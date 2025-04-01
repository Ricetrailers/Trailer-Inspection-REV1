import { useState } from "react";
import Tesseract from "tesseract.js";

export default function TrailerInspectionApp() {
  const [image, setImage] = useState(null);
  const [tagData, setTagData] = useState({ vin: "", model: "", customer: "" });
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);

  const extractField = (text, label) => {
    const regex = new RegExp(`${label}[:\s]*([A-Z0-9\-']{5,})`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : "";
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

      setTagData({
        vin: extractField(text, "VIN"),
        model: extractField(text, "MODEL"),
        customer: extractField(text, "CUSTOMER"),
      });
    } catch (error) {
      console.error("OCR failed:", error);
      setTagData({ vin: "", model: "", customer: "" });
      setRawText("(OCR failed)");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Trailer Tag Scanner</h1>

        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'block', marginTop: '1rem' }} />

        {loading && <p style={{ fontSize: '0.9rem' }}>Reading tag... please wait.</p>}

        {image && <img src={image} alt="Tag Preview" style={{ width: '100%', borderRadius: '4px', marginTop: '1rem' }} />}

        {!loading && tagData.vin && (
          <div style={{ marginTop: '1rem' }}>
            <p><strong>VIN:</strong> {tagData.vin}</p>
            <p><strong>Model:</strong> {tagData.model}</p>
            <p><strong>Customer:</strong> {tagData.customer}</p>
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
