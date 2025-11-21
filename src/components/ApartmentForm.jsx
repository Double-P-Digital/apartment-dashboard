import React, {useState} from "react";

export default function ApartmentForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [address, setAddress] = useState(initialData?.address || "");

  const [descriptionRo, setDescriptionRo] = useState(initialData?.descriptionRo || "");
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || "");

  const [price, setPrice] = useState(initialData?.price || "");
  const [currency, setCurrency] = useState(initialData?.currency || "EUR");
  const [description, setDescription] = useState(initialData?.description || "");
  const [amenities, setAmenities] = useState(initialData?.amenities?.join(", ") || "");
  const [status, setStatus] = useState(initialData?.status || "available");
  const [images, setImages] = useState(initialData?.images || []);

  function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  }

  function handleSelectImages(e) {
    const files = Array.from(e.target.files);
    addImages(files);
  }

  function addImages(files) {
    const newUrls = files.map(file => `http://${file.name}`);
    setImages(prev => [...prev, ...newUrls]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      name,
      city,
      address,
      descriptionRo,
      descriptionEn,
      price: Number(price),
      currency,
      description,
      amenities: amenities.split(",").map(a => a.trim()).filter(Boolean),
      images,
      status,
    });

    if (!initialData) {
      setName(""); setCity("");
      setAddress(""); setDescriptionRo(""); 
      setDescriptionEn(""),setAmenities(""); setImages([]); setPrice(""); setStatus("available"); setCurrency("EUR");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input className="w-full border p-2 rounded" placeholder="Name"
        value={name} onChange={e => setName(e.target.value)} />

      <input
        className="w-full border p-2 rounded"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />  

      <input className="w-full border p-2 rounded" placeholder="Address"
        value={address} onChange={e => setAddress(e.target.value)} />

      {/* Price + Currency */}
      <div className="flex gap-3">
        <input
          type="number"
          className="w-32 border p-2 rounded"
          placeholder="Price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          onWheel={e => e.target.blur()} // ≤ fixes mouse wheel changing value
        />
        <select
          className="border p-2 rounded"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
        >
          <option value="EUR">EUR</option>
          <option value="RON">RON</option>
        </select>
      </div>

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description (Romanian)"
        value={descriptionRo}
        onChange={(e) => setDescriptionRo(e.target.value)}
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description (English)"
        value={descriptionEn}
        onChange={(e) => setDescriptionEn(e.target.value)}
      />

      <input className="w-full border p-2 rounded"
        placeholder="Amenities (comma separated)"
        value={amenities} onChange={e => setAmenities(e.target.value)}
      />

      <select className="w-full border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="available">available</option>
        <option value="unavailable">unavailable</option>
      </select>

      {/* Drag & Drop Image Upload */}
      <div
        className="border-2 border-dashed rounded p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("file-input").click()}
      >
        Drag & Drop images here or click to select
        <input id="file-input" type="file" multiple className="hidden" onChange={handleSelectImages} />
      </div>

      {/* {images.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {images.map((img, i) => (
      <div key={i} className="relative group">
        <img src={img} className="h-20 w-20 object-cover rounded border" /> */}

        {/* Remove button */}
        {/* <button
          type="button"
          onClick={() => setImages(images.filter((_, index) => index !== i))}
          className="absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs px-1 opacity-0 group-hover:opacity-100 transition"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)} */}

      {images.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {images.map((img, i) => (
      <div key={i} className="relative group flex flex-col items-center">
        <img src={img} className="h-20 w-20 object-cover rounded border" />

        <div className="flex gap-1 mt-1">
          {/* Move Left */}
          <button
            type="button"
            disabled={i === 0}
            onClick={() => {
              const newArr = [...images];
              [newArr[i-1], newArr[i]] = [newArr[i], newArr[i-1]];
              setImages(newArr);
            }}
            className="px-1 text-xs bg-gray-200 rounded disabled:opacity-30"
          >
            ◀
          </button>

          {/* Move Right */}
          <button
            type="button"
            disabled={i === images.length - 1}
            onClick={() => {
              const newArr = [...images];
              [newArr[i+1], newArr[i]] = [newArr[i], newArr[i+1]];
              setImages(newArr);
            }}
            className="px-1 text-xs bg-gray-200 rounded disabled:opacity-30"
          >
            ▶
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={() => setImages(images.filter((_, index) => index !== i))}
            className="px-1 text-xs bg-red-600 text-white rounded"
          >
            ✕
          </button>
        </div>
      </div>
    ))}
  </div>
)}


      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
          {initialData ? "Save" : "Add"}
        </button>
        {onCancel && (
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
