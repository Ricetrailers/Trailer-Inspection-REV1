import { useState } from "react";

export default function TrailerInspectionApp() {
  const [image, setImage] = useState(null);
  const [tagData, setTagData] = useState({ vin: "", model: "", customer: "" });
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true);

    // Simulate OCR result for now
    setTimeout(() => {
      setTagData({
        vin: "4RWBS1218SH056665",
        model: "SST7612",
        customer: "STALLON'S AUTO SALES",
      });
      setLoading(false);
    }, 1500);
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
      </div>
    </div>
  );
}
