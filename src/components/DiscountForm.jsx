import React, { useState } from "react";

export default function DiscountForm({ initialData, onSubmit, onCancel }) {
  const [codeName, setCodeName] = useState(initialData?.codeName || "");
  const [discountPercent, setDiscountPercent] = useState(initialData?.discountPercent || "");
  const [expireDate, setExpireDate] = useState(initialData?.expireDate || "");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      id: initialData?.id,
      codeName,
      discountPercent,
      expireDate,
    });
    if (!initialData) {
      setCodeName("");
      setDiscountPercent("");
      setExpireDate("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

      <input className="w-full border p-2 rounded"
        placeholder="Code Name"
        value={codeName}
        onChange={(e) => setCodeName(e.target.value)}
      />

      <input type="number" className="w-full border p-2 rounded"
        placeholder="Discount %"
        value={discountPercent}
        onChange={(e) => setDiscountPercent(e.target.value)}
      />

      <input type="date" className="w-full border p-2 rounded"
        value={expireDate}
        onChange={(e) => setExpireDate(e.target.value)}
      />

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