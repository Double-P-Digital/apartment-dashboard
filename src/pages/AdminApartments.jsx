import React, { useState } from "react";
import ApartmentForm from "../components/ApartmentForm";

export default function AdminApartments() {
  const [apartments, setApartments] = useState([]);
  const [editing, setEditing] = useState(null);

  function handleAdd(newApartment) {
    const id = crypto.randomUUID(); // temporary local ID
    setApartments(prev => [...prev, { ...newApartment, id }]);
  }

  function handleUpdate(updatedApartment) {
    setApartments(prev =>
      prev.map(a => (a.id === updatedApartment.id ? updatedApartment : a))
    );
    setEditing(null);
  }

  function handleDelete(id) {
    setApartments(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Apartment Dashboard</h1>

      {/* Add New */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Add New Apartment</h2>
        <ApartmentForm onSubmit={handleAdd} />
      </div>

      {/* Apartment List */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
  {apartments.map((ap) => (
    <div key={ap.id} className="bg-white shadow p-4 rounded border">
      <h3 className="font-bold text-lg">{ap.name}</h3>
      <p className="text-sm text-gray-600">{ap.address}</p>

      <p className="mt-1 text-sm font-semibold">
        Price: {ap.price} {ap.currency}
      </p>

      <p className="mt-1 text-sm">
        Status: <span className={`px-2 py-0.5 text-xs rounded ${
          ap.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {ap.status}
        </span>
      </p>

      <p className="text-sm mt-2 line-clamp-2">{ap.description}</p>

      {ap.images.length > 0 && (
        <img src={ap.images[0]} className="w-full h-32 object-cover rounded mt-3" />
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={() => handleEdit(ap)} className="px-3 py-1 bg-yellow-500 text-white rounded">
          Edit
        </button>
        <button onClick={() => handleDelete(ap.id)} className="px-3 py-1 bg-red-600 text-white rounded">
          Delete
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}
