// src/pages/AdminApartments.jsx (Updated for Hotel ID)

import React, {useEffect, useState} from "react";
import ApartmentForm from "../components/ApartmentForm";
import DiscountForm from "../components/DiscountForm";

import {saveApartment, getApartments, updateApartment, deleteApartment} from "../service/ApartmentService.js";
import {saveDiscount, getDiscounts, deleteDiscount} from "../service/DiscountService.js"; 


export default function AdminApartments({ onLogout }) {
  const [apartments, setApartments] = useState([]);
  const [editingApartment, setEditingApartment] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [message, setMessage] = useState('');

    // Fetch BOTH Apartments and Discounts on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Apartments
                const apartmentData = await getApartments();
                setApartments(apartmentData);

                // Fetch Discounts
                const discountData = await getDiscounts();
                setDiscounts(discountData);
                
            }
            catch (error) {
                console.error("Error fetching data:", error.message);
                setMessage("Error loading data: " + error.message);
            }
        }

        fetchData().then();
    }, [])

  // --- Apartments CRUD (Logic remains the same) ---
  async function handleAddOrUpdate(apartment) {
    setMessage('');
    try {
        let result;
        if (apartment.id) {
            result = await updateApartment(apartment);
            setMessage(`Apartment '${apartment.name}' updated successfully.`);
            setApartments(prev =>
                prev.map(a => (a.id === apartment.id ? apartment : a))
            );
        } else {
            result = await saveApartment(apartment);
            setMessage(`Apartment '${apartment.name}' added successfully.`);
            setApartments(prev => [...prev, result]); 
        }
        setEditingApartment(null);
    } catch (error) {
        console.error("Error saving apartment:", error);
        setMessage("Error saving apartment: " + error.message);
    }
  }

  function handleEdit(ap) {
    setEditingApartment(ap);
    setMessage('');
    // scroll the form into view so user can see and edit the fields
    const formEl = document.querySelector('form');
    if (formEl && typeof formEl.scrollIntoView === 'function') {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleDelete(id) {
    if (!id) {
        setMessage("Error: Cannot delete apartment, ID is missing.");
        return; // Stop execution if ID is undefined/null
    }
    if (!window.confirm("Are you sure you want to delete this apartment?")) return;
    setMessage('');
    try {
        await deleteApartment(id);
        setApartments(prev => prev.filter(a => a.id !== id));
        setMessage("Apartment deleted successfully.");
    } catch (error) {
        console.error("Error deleting apartment:", error);
        setMessage("Error deleting apartment: " + error.message);
    }
  }

  // --- Discount CRUD (UPDATED) ---
  async function handleAddOrUpdateDiscount(discount) {
    setMessage('');
    try {
        let savedDiscount;
        if (discount.id) {
             // Treat as update, assuming saveDiscount (POST) handles it
             savedDiscount = await saveDiscount(discount); 
             setDiscounts(prev => prev.map(d => (d.id === discount.id ? savedDiscount : d)));
             setMessage(`Discount code '${discount.code}' updated successfully.`); // Use 'code'
        } else {
            // create new
            savedDiscount = await saveDiscount(discount);
            setDiscounts(prev => [...prev, savedDiscount]);
            setMessage(`Discount code '${savedDiscount.code}' added successfully.`); // Use 'code'
        }
        setEditingDiscount(null);
    } catch (error) {
        console.error("Error saving discount:", error);
        setMessage("Error saving discount: " + error.message);
    }
  }

  function handleEditDiscount(d) {
    // If you enable editing later, you can map backend _id to frontend 'id' here
    setEditingDiscount(d); 
    setMessage('');
  }

  async function handleDeleteDiscount(id) {
    if (!window.confirm("Are you sure you want to delete this discount code?")) return;
    setMessage('');
    try {
        await deleteDiscount(id);
        setDiscounts(prev => prev.filter(d => d.id !== id));
        setMessage("Discount deleted successfully.");
    } catch (error) {
        console.error("Error deleting discount:", error);
        setMessage("Error deleting discount: " + error.message);
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto p-6 space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {onLogout && (
          <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Logout
          </button>
        )}
      </div>
      
      {/* API Message Display */}
      {message && (
        <div className={`p-3 rounded text-sm font-medium ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Apartment Form*/}
      <section>
        <h2 className="text-2xl font-bold mb-4">Manage Apartments</h2>

        <ApartmentForm
          initialData={editingApartment}
          onSubmit={handleAddOrUpdate}
          onCancel={() => setEditingApartment(null)}
          onMessage={setMessage}
        />

        {/* Apartment List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {apartments.map((ap) => (
            <div key={ap.id} className="bg-white shadow p-4 rounded border">
              <h3 className="font-bold text-lg">{ap.name}</h3>
              {/* ADDED: Display hotelId */}
              <p className="text-xs text-gray-400">Hotel ID: {ap.hotelId}</p> 
              <p className="text-sm text-gray-600">City: {ap.city} | Guests: {ap.maxGuests}</p>
              <p className="text-sm text-gray-600">Rooms: {ap.bedrooms} Bed, {ap.bathrooms} Bath</p>
              <p className="mt-1 text-sm font-semibold text-indigo-600">{ap.price} {ap.currency}</p>
              
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
            apartments={apartments}
            onSubmit={handleAddOrUpdateDiscount}
            onCancel={() => setEditingDiscount(null)}
        />


        {/* Discount List (UPDATED) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {discounts.map((d) => (
            <div key={d.id} className="bg-white shadow p-4 rounded border">
              <h3 className="font-bold text-lg">Code: {d.code}</h3> {/* Use d.code */}
              <p className="mt-1 text-sm font-semibold text-indigo-600">{d.price} {d.currency}</p> {/* Display currency with price */}
              <p className="text-sm text-gray-600">Expires: {d.expirationDate}</p> {/* Use d.expirationDate */}
              {/* Removed apartmentIds display */}
              <div className="flex gap-2 mt-4">
                
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