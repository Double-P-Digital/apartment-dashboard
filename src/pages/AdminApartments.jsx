import React, { useState } from "react";
import ApartmentForm from "../components/ApartmentForm";
import DiscountForm from "../components/DiscountForm";

export default function AdminApartments() {
  const [apartments, setApartments] = useState([]);
  const [editingApartment, setEditingApartment] = useState(null);

  
  const [discounts, setDiscounts] = useState([]);
  const [editingDiscount, setEditingDiscount] = useState(null);

  // --- Apartments CRUD ---
  function handleAddOrUpdate(apartment) {
    if (apartment.id) {
      // update existing
      setApartments(prev =>
        prev.map(a => (a.id === apartment.id ? apartment : a))
      );
    } else {
      // create new
      setApartments(prev => [...prev, { ...apartment, id: Date.now() }]);
    }
    setEditingApartment(null);
  }

  function handleEdit(ap) {
    setEditingApartment(ap);
  }

  function handleDelete(id) {
    setApartments(prev => prev.filter(a => a.id !== id));
  }

  // --- Discount CRUD ---
  function handleAddOrUpdateDiscount(discount) {
    if (discount.id) {
      setDiscounts(prev =>
        prev.map(d => (d.id === discount.id ? discount : d))
      );
    } else {
      setDiscounts(prev => [...prev, { ...discount, id: Date.now() }]);
    }
    setEditingDiscount(null);
  }

  function handleEditDiscount(d) {
    setEditingDiscount(d);
  }

  function handleDeleteDiscount(id) {
    setDiscounts(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="max-w-screen-xl mx-auto p-6 space-y-12">

      {/* Apartment Form*/}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Apartments</h2>

        <ApartmentForm
          initialData={editingApartment}
          onSubmit={handleAddOrUpdate}
          onCancel={() => setEditingApartment(null)}
        />

        {/* Apartment List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {apartments.map((ap) => (
            <div key={ap.id} className="bg-white shadow p-4 rounded border">
              <h3 className="font-bold text-lg">{ap.name}</h3>
              <p className="text-sm text-gray-600">{ap.address}</p>
              <p className="mt-1 text-sm font-semibold">{ap.price} {ap.currency}</p>

              <p className="mt-1 text-sm">
                Status: <span className={`px-2 py-0.5 text-xs rounded ${
                  ap.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {ap.status}
                </span>
              </p>

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
      </section>


      {/* Discount Codes Form */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Discount Codes</h2>

        <DiscountForm
          initialData={editingDiscount}
          onSubmit={handleAddOrUpdateDiscount}
          onCancel={() => setEditingDiscount(null)}
        />

        {/* Discount List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {discounts.map((d) => (
            <div key={d.id} className="bg-white shadow p-4 rounded border">
              <h3 className="font-bold text-lg">{d.codeName}</h3>
              <p className="text-sm">Discount: {d.discountPercent}%</p>
              <p className="text-sm text-gray-600">Expires: {d.expireDate}</p>

              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEditDiscount(d)} className="px-3 py-1 bg-yellow-500 text-white rounded">
                  Edit
                </button>
                <button onClick={() => handleDeleteDiscount(d.id)} className="px-3 py-1 bg-red-600 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

