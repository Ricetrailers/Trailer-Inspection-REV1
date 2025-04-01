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
    <div className="p-4 max-w-xl mx-auto">
      <div className="bg-white shadow-md rounded p-4 space-y-4">
        <p className="text-xl font-bold">Trailer Tag Scanner</p>

        <input type="file" accept="image/*" onChange={handleImageChange} className="block" />

        {loading && <p className="text-sm">Reading tag... please wait.</p>}

        {image && <img src={image} alt="Tag Preview" className="w-full rounded-md" />}

        {!loading && tagData.vin && (
          <div className="space-y-2">
            <p><strong>VIN:</strong> {tagData.vin}</p>
            <p><strong>Model:</strong> {tagData.model}</p>
            <p><strong>Customer:</strong> {tagData.customer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
