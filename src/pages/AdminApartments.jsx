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

      {/* List */}
      <h2 className="text-2xl font-semibold mb-4">Existing Apartments</h2>
      <div className="space-y-4">
        {apartments.length === 0 && <p className="text-gray-500">No apartments yet.</p>}

        {apartments.map(ap => (
          <div key={ap.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
            {editing === ap.id ? (
              <ApartmentForm
                initialData={ap}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div>
                  <p className="font-bold text-lg">{ap.name}</p>
                  <p className="text-sm text-gray-600">{ap.address}</p>
                  <p>€{ap.price}</p>
                  <p className="mt-1 text-gray-600 text-sm">{ap.description}</p>
                  <p className="mt-1 text-gray-500 text-xs">
                    Amenities: {ap.amenities.join(", ")}
                  </p>
                  <p className="mt-1 text-sm">Status: {ap.status}</p>

                  {ap.images?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {ap.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="h-20 w-20 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(ap.id)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ap.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
