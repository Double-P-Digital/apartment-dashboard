import React, { useState } from "react";

export default function ApartmentForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [amenities, setAmenities] = useState(initialData?.amenities?.join(", ") || "");
  const [status, setStatus] = useState(initialData?.status || "available");
  const [images, setImages] = useState(initialData?.images || []);

  function handleImages(e) {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      name,
      address,
      price: Number(price),
      description,
      amenities: amenities.split(",").map(a => a.trim()).filter(Boolean),
      images,
      status
    });
    if (!initialData) {
      setName("");
      setAddress("");
      setPrice("");
      setDescription("");
      setAmenities("");
      setImages([]);
      setStatus("available");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input className="w-full border p-2 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="w-full border p-2 rounded" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
      <input className="w-full border p-2 rounded" type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
      <textarea className="w-full border p-2 rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

      <input className="w-full border p-2 rounded" placeholder="Amenities (comma separated)"
        value={amenities} onChange={e => setAmenities(e.target.value)} />

      <select className="w-full border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
      </select>

      <div>
        <label className="block text-sm font-medium">Images</label>
        <input type="file" multiple onChange={handleImages} className="mt-1" />
        <div className="flex gap-2 mt-2 flex-wrap">
          {images.map((img, i) => (
            <img key={i} src={img} className="h-20 w-20 object-cover rounded" />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
          {initialData ? "Save" : "Add"}
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
