import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cgzsryxqmykjlgczngce.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnenNyeXhxbXlramxnY3puZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzI0NjksImV4cCI6MjA1OTEwODQ2OX0.CRtzUfJJ22zDCg7gMDWL8TGP0jnCLywuFtEdaHwiEkY";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TrailerInspectionApp() {
  const [image, setImage] = useState(null);
  const [tagData, setTagData] = useState({ vin: "", model: "", customer: "" });
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedInspections, setSavedInspections] = useState([]);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    const { data, error } = await supabase.from("\"Trailer Inspection\"").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading inspections:", error);
    } else {
      setSavedInspections(data);
    }
  };

  const extractFields = (text) => {
    const vinMatch = text.match(/VIN[:\s]*([A-Z0-9]{17})/i);
    const modelMatch = text.match(/Model[:\s]*([A-Z0-9\-]+)/i);

    const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
    let customer = "";

    if (vinMatch) {
      const vinLine = lines.findIndex((line) => line.includes(vinMatch[1]));
      for (let i = vinLine - 1; i >= 0 && i >= vinLine - 5; i--) {
        const candidate = lines[i];

        const isAllCaps = /^[A-Z0-9 '&.-]+$/.test(candidate);
        const isLikelyCustomer = isAllCaps &&
          !/APPROVED|OPTION|SEQUENCE|TIRES|COLOR|DATE|MODEL|YEAR/.test(candidate) &&
          candidate.length >= 10;

        if (isLikelyCustomer) {
          customer = candidate;
          break;
        }
      }
    }

    return {
      vin: vinMatch ? vinMatch[1] : "",
      model: modelMatch ? modelMatch[1] : "",
      customer,
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTagData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setLoading(true);

    try {
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => console.log(m)
      });
      const text = result.data.text;
      console.log("OCR Result:\n", text);
      setRawText(text);

      const extracted = extractFields(text);
      const updatedData = {
        vin: extracted.vin || "Could not identify VIN",
        model: extracted.model || "Could not identify Model",
        customer: extracted.customer || "Could not identify Customer",
      };
      setTagData(updatedData);
    } catch (error) {
      console.error("OCR failed:", error);
      setTagData({ vin: "OCR failed", model: "OCR failed", customer: "OCR failed" });
      setRawText("(OCR failed)");
    }

    setLoading(false);
  };

  const saveInspection = async () => {
    if (!tagData.vin || tagData.vin.includes("Could not") || tagData.vin === "OCR failed") {
      alert("Please enter a valid VIN before saving.");
      return;
    }

    console.log("Saving inspection:", tagData);
    const { data, error } = await supabase.from("\"Trailer Inspection\"").insert([
      {
        vin: tagData.vin,
        model: tagData.model,
        customer: tagData.customer
      }
    ]);

    console.log("Supabase insert result:", { data, error });

    if (error) {
      console.error("❌ Error saving inspection:", error);
      alert("Failed to save inspection. See console for details.");
    } else {
      console.log("✅ Inspection saved:", data);
      alert("Inspection saved.");
      loadInspections();
    }
  };

  const deleteInspection = async (id) => {
    const { error } = await supabase.from("inspections").delete().eq("id", id);
    if (error) {
      console.error("Error deleting inspection:", error);
    } else {
      loadInspections();
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Trailer Tag Scanner</h1>

        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'block', marginTop: '1rem' }} />

        {loading && <p style={{ fontSize: '0.9rem' }}>Reading tag... please wait.</p>}

        {image && <img src={image} alt="Tag Preview" style={{ width: '100%', borderRadius: '4px', marginTop: '1rem' }} />}

        {!loading && (
          <div style={{ marginTop: '1rem' }}>
            <label><strong>VIN:</strong> <input type="text" name="vin" value={tagData.vin} onChange={handleInputChange} style={{ width: '100%' }} /></label>
            <label><strong>Model:</strong> <input type="text" name="model" value={tagData.model} onChange={handleInputChange} style={{ width: '100%' }} /></label>
            <label><strong>Customer:</strong> <input type="text" name="customer" value={tagData.customer} onChange={handleInputChange} style={{ width: '100%' }} /></label>
            <button onClick={saveInspection} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Save Inspection</button>
          </div>
        )}

        {savedInspections.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2>Saved Inspections</h2>
            {savedInspections.map((item) => (
              <div key={item.id} style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '0.5rem', marginTop: '0.5rem' }}>
                <p><strong>VIN:</strong> {item.vin}</p>
                <p><strong>Model:</strong> {item.model}</p>
                <p><strong>Customer:</strong> {item.customer}</p>
                <button onClick={() => deleteInspection(item.id)} style={{ marginTop: '0.5rem' }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {!loading && rawText && (
          <div style={{ marginTop: '2rem', fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: '#555' }}>
            <h2 style={{ fontWeight: 'bold' }}>Raw OCR Output:</h2>
            <pre>{rawText}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
