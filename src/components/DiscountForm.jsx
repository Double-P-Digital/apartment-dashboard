// src/components/DiscountForm.jsx (Updated for new backend structure)

import React, { useState, useEffect } from "react";

const DiscountType = {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE',
};

export default function DiscountForm({ initialData, apartments = [], onSubmit, onCancel }) {
  // State variables aligned with NestJS DTO/Service expectations
  const [code, setCode] = useState(initialData?.code || "");
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || "");
  const [discountType, setDiscountType] = useState(initialData?.discountType || DiscountType.FIXED);
  const [value, setValue] = useState(initialData?.value || initialData?.price || ""); // Support both old and new format
  const [currency, setCurrency] = useState(initialData?.currency || "RON");
  
  // RESTORED: State for apartment IDs linked to this discount
  const [apartmentIds, setApartmentIds] = useState(initialData?.apartmentIds || []);

  // Sync form fields when initialData changes (e.g., user clicks Edit)
  useEffect(() => {
    if (initialData) {
      setCode(initialData?.code || "");
      setExpirationDate(initialData?.expirationDate || "");
      setDiscountType(initialData?.discountType || DiscountType.FIXED);
      setValue(initialData?.value || initialData?.price || ""); // Support both old and new format
      setCurrency(initialData?.currency || "RON");
      setApartmentIds(initialData?.apartmentIds || []);
    } else {
      // Clear form when no initialData (e.g. cancelled)
      setCode("");
      setExpirationDate("");
      setDiscountType(DiscountType.FIXED);
      setValue("");
      setCurrency("RON");
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
    
    // Validare
    if (discountType === DiscountType.PERCENTAGE && (value < 0 || value > 100)) {
      alert('Pentru procentaj, valoarea trebuie să fie între 0 și 100');
      return;
    }
    
    if (value < 0) {
      alert('Valoarea trebuie să fie mai mare sau egală cu 0');
      return;
    }
    
    if (apartmentIds.length === 0) {
      alert('Trebuie să selectezi cel puțin un apartment');
      return;
    }
    
    const payload = {
      // We assume the backend uses Mongoose _id as the 'id' property here
      id: initialData?._id || initialData?.id, 
      code,
      discountType, // FIXED sau PERCENTAGE
      value: Number(value), // Changed from price to value
      expirationDate,
      apartmentIds,
      // Currency doar pentru FIXED (opțional)
      ...(discountType === DiscountType.FIXED && { currency }),
    };
    onSubmit(payload);

    if (!initialData) {
      setCode("");
      setExpirationDate("");
      setDiscountType(DiscountType.FIXED);
      setValue("");
      setCurrency("RON");
      setApartmentIds([]); // Reset apartment selection
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-2xl">
      {initialData && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
          <p className="text-sm font-medium text-purple-800">Editing: {initialData.code || 'Discount Code'}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Discount Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code Name *</label>
            <input 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none uppercase"
              placeholder="SUMMER25"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
            <p className="text-xs text-gray-500 mt-1">e.g., SUMMER25, WINTER50</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date *</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
          <select
            className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white mb-4"
            value={discountType}
            onChange={e => {
              setDiscountType(e.target.value);
              setValue(""); // Reset value when changing type
            }}
          >
            <option value={DiscountType.FIXED}>Preț fix (RON/EUR)</option>
            <option value={DiscountType.PERCENTAGE}>Procentaj (%)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {discountType === DiscountType.PERCENTAGE ? "Procentaj (0-100) *" : "Valoare discount (RON/EUR) *"}
            </label>
            <div className="relative">
              <input 
                type="number" 
                className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                placeholder={discountType === DiscountType.PERCENTAGE ? "20" : "50"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="0"
                max={discountType === DiscountType.PERCENTAGE ? "100" : undefined}
                step={discountType === DiscountType.PERCENTAGE ? "1" : "0.01"}
                required
              />
              {discountType === DiscountType.PERCENTAGE && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {discountType === DiscountType.PERCENTAGE 
                ? "Valoarea trebuie să fie între 0 și 100" 
                : "Introdu valoarea discount-ului în moneda selectată"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {discountType === DiscountType.FIXED ? "Currency *" : "Currency (for display)"}
            </label>
            <select
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              disabled={discountType === DiscountType.PERCENTAGE}
            >
              <option value="EUR">EUR</option>
              <option value="RON">RON</option>
            </select>
            {discountType === DiscountType.PERCENTAGE && (
              <p className="text-xs text-gray-500 mt-1">
                Currency nu este folosit pentru discount-uri procentuale
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Apartment Selection UI */}
      {apartments.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Applies to Apartments</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {apartments.map(ap => (
                <label 
                  key={ap.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={apartmentIds.includes(ap.id)}
                    onChange={() => toggleApartment(ap.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{ap.name}</span>
                    <span className="text-sm text-gray-600 ml-2">— {ap.price} {ap.currency || 'RON'}/night</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {apartmentIds.length} apartment{apartmentIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {apartments.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No apartments available. Please create apartments first.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
        <button 
          type="submit" 
          className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-base sm:text-lg"
        >
          {initialData ? "💾 Save Changes" : "➕ Add Discount Code"}
        </button>
        {onCancel && (
          <button 
            type="button" 
            className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold text-base sm:text-lg" 
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}