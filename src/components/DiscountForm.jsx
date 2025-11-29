// src/components/DiscountForm.jsx (Restored Apartment Selection Logic)

import React, { useState, useEffect } from "react";

export default function DiscountForm({ initialData, apartments = [], onSubmit, onCancel }) {
  // State variables aligned with NestJS DTO/Service expectations
  const [code, setCode] = useState(initialData?.code || "");
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [currency, setCurrency] = useState(initialData?.currency || "EUR");
  
  // RESTORED: State for apartment IDs linked to this discount
  const [apartmentIds, setApartmentIds] = useState(initialData?.apartmentIds || []);

  // Sync form fields when initialData changes (e.g., user clicks Edit)
  useEffect(() => {
    if (initialData) {
      setCode(initialData?.code || "");
      setExpirationDate(initialData?.expirationDate || "");
      setPrice(initialData?.price || "");
      setCurrency(initialData?.currency || "EUR");
      setApartmentIds(initialData?.apartmentIds || []);
    } else {
      // Clear form when no initialData (e.g. cancelled)
      setCode("");
      setExpirationDate("");
      setPrice("");
      setCurrency("EUR");
      setApartmentIds([]);
    }
  }, [initialData]);

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
      // We assume the backend uses Mongoose _id as the 'id' property here
      id: initialData?._id || initialData?.id, 
      code,
      expirationDate,
      price: Number(price), 
      currency,
      // RESTORED: Include apartmentIds in the payload for the backend service
      apartmentIds, 
    });

    if (!initialData) {
      setCode("");
      setExpirationDate("");
      setPrice("");
      setCurrency("EUR");
      setApartmentIds([]); // Reset apartment selection
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

      <input className="w-full border p-2 rounded"
        placeholder="Code Name (e.g., SUMMER25)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />

      <input type="date" className="w-full border p-2 rounded"
        value={expirationDate}
        onChange={(e) => setExpirationDate(e.target.value)}
        required
      />

      <input type="number" className="w-full border p-2 rounded"
        placeholder="Discount Price (e.g., 100)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        min="0"
        required
      />

      {/* Currency Selection */}
      <div className="flex gap-3 items-center">
        <label className="text-sm font-medium text-gray-700">Currency:</label>
        <select
          className="border p-2 rounded"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
        >
          <option value="EUR">EUR</option>
          <option value="RON">RON</option>
        </select>
      </div>
      
      {/* RESTORED: Apartment Selection UI */}
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
      {/* END RESTORED */}


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