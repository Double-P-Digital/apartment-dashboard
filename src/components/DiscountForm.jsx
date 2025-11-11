import React, { useState } from "react";

export default function DiscountForm({ initialData, apartments = [], onSubmit, onCancel }) {
  const [codeName, setCodeName] = useState(initialData?.codeName || "");
  const [expireDate, setExpireDate] = useState(initialData?.expireDate || "");
  const [newPrice, setNewPrice] = useState(initialData?.newPrice || "");
  const [apartmentIds, setApartmentIds] = useState(initialData?.apartmentIds || []);

  function toggleApartment(id) {
    setApartmentIds(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      codeName,
      expireDate,
      newPrice: Number(newPrice),
      apartmentIds,
    });

    if (!initialData) {
      setCodeName("");
      setExpireDate("");
      setNewPrice("");
      setApartmentIds([]);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

      <input className="w-full border p-2 rounded"
        placeholder="Code Name"
        value={codeName}
        onChange={(e) => setCodeName(e.target.value)}
      />

      <input type="date" className="w-full border p-2 rounded"
        value={expireDate}
        onChange={(e) => setExpireDate(e.target.value)}
      />

      <input type="number" className="w-full border p-2 rounded"
        placeholder="Discounted Price"
        value={newPrice}
        onChange={(e) => setNewPrice(e.target.value)}
      />

      <div>
        <p className="font-semibold mb-1">Applies to Apartments:</p>
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border p-2 rounded">
          {apartments.map(ap => (
            <label key={ap.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={apartmentIds.includes(ap.id)}
                onChange={() => toggleApartment(ap.id)}
              />
              {ap.name} — {ap.price} {ap.currency}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
          {initialData ? "Save" : "Add Code"}
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
