// src/pages/AdminApartments.jsx (Updated for Hotel ID)

import React, {useEffect, useState} from "react";
import ApartmentForm from "../components/ApartmentForm";
import DiscountForm from "../components/DiscountForm";
import DateManagement from "../components/DateManagement";

import {saveApartment, getApartments, updateApartment, deleteApartment} from "../service/ApartmentService.js";
import {saveDiscount, getDiscounts, deleteDiscount} from "../service/DiscountService.js"; 


export default function AdminApartments({ onLogout }) {
  const [apartments, setApartments] = useState([]);
  const [editingApartment, setEditingApartment] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [message, setMessage] = useState('');
  
  // Drag and Drop state
  const [draggedApartment, setDraggedApartment] = useState(null);
  const [dragOverApartment, setDragOverApartment] = useState(null);

    // Fetch BOTH Apartments and Discounts on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Apartments
                const apartmentData = await getApartments();
                // Normalize IDs (handle both _id and id formats)
                const normalizedApartments = apartmentData.map((apt, index) => ({
                    ...apt,
                    id: apt._id || apt.id,
                    displayOrder: apt.displayOrder !== undefined ? apt.displayOrder : index
                }));
                // Sort by displayOrder
                normalizedApartments.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                setApartments(normalizedApartments);

                // Fetch Discounts
                const discountData = await getDiscounts();
                setDiscounts(discountData);
                
            }
            catch (error) {
                setMessage("Error loading data: " + error.message);
            }
        }

        fetchData().then();
    }, [])

  // --- Apartments CRUD ---
  async function handleAddOrUpdate(apartment) {
    setMessage('');
    try {
        let result;
        // Handle both _id (Mongoose) and id formats
        const apartmentId = apartment._id || apartment.id;
        
        // If creating new apartment, set displayOrder to end of city list
        if (!apartmentId && apartment.displayOrder === undefined) {
            const cityApartments = apartments.filter(a => a.city === apartment.city);
            apartment.displayOrder = cityApartments.length;
        }
        
        if (apartmentId) {
            result = await updateApartment(apartment);
            setMessage(`Apartment '${apartment.name}' updated successfully.`);
            const resultId = result._id || result.id;
            setApartments(prev => {
                const updated = prev.map(a => {
                    const aId = a._id || a.id;
                    return (aId === apartmentId ? { ...result, id: resultId, displayOrder: result.displayOrder !== undefined ? result.displayOrder : a.displayOrder } : a);
                });
                return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            });
        } else {
            result = await saveApartment(apartment);
            setMessage(`Apartment '${apartment.name}' added successfully.`);
            const resultId = result._id || result.id;
            setApartments(prev => {
                const newList = [...prev, { ...result, id: resultId, displayOrder: result.displayOrder !== undefined ? result.displayOrder : prev.length }];
                return newList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            }); 
        }
        setEditingApartment(null);
    } catch (error) {
        setMessage("Error saving apartment: " + error.message);
    }
  }

  // Drag and Drop handlers
  function handleDragStart(e, apartment) {
    setDraggedApartment(apartment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', apartment.id);
  }

  function handleDragOver(e, apartment) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Only allow dropping within the same city
    if (draggedApartment && draggedApartment.city === apartment.city && draggedApartment.id !== apartment.id) {
      setDragOverApartment(apartment);
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragOverApartment(null);
  }

  async function handleDrop(e, targetApartment) {
    e.preventDefault();
    setDragOverApartment(null);
    
    if (!draggedApartment || draggedApartment.id === targetApartment.id) {
      setDraggedApartment(null);
      return;
    }
    
    // Only allow reordering within the same city
    if (draggedApartment.city !== targetApartment.city) {
      setMessage("Cannot move apartment to a different city.");
      setDraggedApartment(null);
      return;
    }
    
    setMessage('');
    try {
      // Simple SWAP: only swap displayOrder between the two apartments
      const draggedOrder = draggedApartment.displayOrder;
      const targetOrder = targetApartment.displayOrder;
      
      // Update both apartments with swapped displayOrder values
      await Promise.all([
        updateApartment({ ...draggedApartment, displayOrder: targetOrder }),
        updateApartment({ ...targetApartment, displayOrder: draggedOrder })
      ]);
      
      // Update local state - swap the displayOrder values
      setApartments(prev => {
        const updated = prev.map(apt => {
          if (apt.id === draggedApartment.id) {
            return { ...apt, displayOrder: targetOrder };
          }
          if (apt.id === targetApartment.id) {
            return { ...apt, displayOrder: draggedOrder };
          }
          return apt;
        });
        return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      });
      
      setMessage(`Swapped positions successfully.`);
    } catch (error) {
      setMessage("Error swapping apartments: " + error.message);
    }
    
    setDraggedApartment(null);
  }

  function handleDragEnd() {
    setDraggedApartment(null);
    setDragOverApartment(null);
  }

  function handleEdit(ap) {
    // Normalize ID (handle both _id and id formats)
    const normalizedAp = {
      ...ap,
      id: ap._id || ap.id
    };
    setEditingApartment(normalizedAp);
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
        setMessage("Error deleting discount: " + error.message);
    }
  }

  // Helper function to render apartments grouped by city
  const renderApartmentsByCity = () => {
    if (apartments.length === 0) return null;

    // Group apartments by city
    const apartmentsByCity = apartments.reduce((acc, ap) => {
      const city = ap.city || 'Fără oraș';
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(ap);
      return acc;
    }, {});

    // Sort cities alphabetically and sort apartments within each city by displayOrder
    const sortedCities = Object.keys(apartmentsByCity).sort();
    sortedCities.forEach(city => {
      apartmentsByCity[city].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    });

    return (
      <div className="mt-8 sm:mt-10">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-6">Apartments List ({apartments.length})</h3>
        <div className="space-y-8 sm:space-y-12">
          {sortedCities.map((city) => {
            const cityApartments = apartmentsByCity[city];

            return (
              <div key={city} className="space-y-4">
                {/* City Headline */}
                <div className="flex items-center gap-3 pb-3 border-b-2 border-indigo-200">
                  <div className="h-8 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {city}
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {cityApartments.length} {cityApartments.length === 1 ? 'apartament' : 'apartamente'}
                  </span>
                </div>

                {/* Apartments Grid for this city */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {cityApartments.map((ap, cityIndex) => {
                    const isDragging = draggedApartment?.id === ap.id;
                    const isDragOver = dragOverApartment?.id === ap.id;

                    return (
                      <div 
                        key={ap.id} 
                        className={`bg-white border rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative cursor-grab active:cursor-grabbing ${
                          isDragging ? 'opacity-50 border-indigo-400 border-2' : 'border-gray-200'
                        } ${isDragOver ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ap)}
                        onDragOver={(e) => handleDragOver(e, ap)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, ap)}
                        onDragEnd={handleDragEnd}
                      >
                        {/* Drag handle and position indicator */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-md flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                            <span className="text-sm font-bold text-indigo-600">#{cityIndex + 1}</span>
                          </div>
                        </div>

                        {ap.images.length > 0 && (
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={ap.images[0]} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                              alt={ap.name}
                            />
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
                                ap.status === "available" 
                                  ? "bg-green-500 text-white" 
                                  : "bg-red-500 text-white"
                              }`}>
                                {ap.status}
                              </span>
                              {/* City badge - more prominent */}
                              <span className="px-3 py-1 text-xs font-semibold rounded-full shadow-lg bg-indigo-500 text-white">
                                {ap.city || 'N/A'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {ap.images.length === 0 && (
                          <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
                                ap.status === "available" 
                                  ? "bg-green-500 text-white" 
                                  : "bg-red-500 text-white"
                              }`}>
                                {ap.status}
                              </span>
                              {/* City badge - more prominent */}
                              <span className="px-3 py-1 text-xs font-semibold rounded-full shadow-lg bg-indigo-500 text-white">
                                {ap.city || 'N/A'}
                              </span>
                            </div>
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="p-4 sm:p-5">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2 line-clamp-1">{ap.name}</h3>
                          <p className="text-xs text-gray-500 mb-3">Hotel ID: {ap.hotelId}</p>
                          
                          <div className="space-y-2 mb-4">
                            {/* City is now shown in badge above, but keep it here too for consistency */}
                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-semibold">{ap.city || 'N/A'}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>{ap.maxGuests} guests</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>{ap.bedrooms} bed</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                                <span>{ap.bathrooms} bath</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {ap.price} {ap.currency || 'RON'}
                              <span className="text-xs text-gray-500 font-normal">/night</span>
                            </p>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button 
                              onClick={() => handleEdit(ap)} 
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm sm:text-base"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(ap.id)} 
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm sm:text-base"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your apartments and discounts</p>
          </div>
          {onLogout && (
            <button 
              onClick={onLogout} 
              className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm sm:text-base"
            >
              Logout
            </button>
          )}
        </div>
      
      {/* API Message Display */}
      {message && (
        <div className={`p-4 rounded-lg shadow-md text-sm font-medium animate-fade-in ${
          message.includes('Error') 
            ? 'bg-red-50 border-l-4 border-red-500 text-red-800' 
            : 'bg-green-50 border-l-4 border-green-500 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Apartment Form*/}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Manage Apartments</h2>
        </div>

        <ApartmentForm
          initialData={editingApartment}
          onSubmit={handleAddOrUpdate}
          onCancel={() => setEditingApartment(null)}
          onMessage={setMessage}
        />

        {/* Apartment List */}
        {renderApartmentsByCity()}
        
        {apartments.length === 0 && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No apartments</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new apartment.</p>
          </div>
        )}
      </section>

      {/* Date Management Section - NEW */}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Gestionare Date și Prețuri</h2>
        </div>
        
        <DateManagement apartments={apartments} />
      </section>


      {/* Discount Codes Form */}
      <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Discount Codes</h2>
        </div>

        <DiscountForm
            initialData={editingDiscount}
            apartments={apartments}
            onSubmit={handleAddOrUpdateDiscount}
            onCancel={() => setEditingDiscount(null)}
        />

        {/* Discount List */}
        {discounts.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Active Discounts ({discounts.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {discounts.map((d) => {
                // Folosește discountType din backend sau detectează din date
                const isPercentage = d.discountType === 'PERCENTAGE' || d.discountType === 'percentage';
                const discountValue = d.value !== undefined ? d.value : d.price; // Support both old and new format
                const displayCode = d.baseCode || (d.code && d.code.includes('_') ? d.code.split('_')[0] : d.code) || 'N/A';
                
                return (
                <div 
                  key={d.id} 
                  className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl sm:text-2xl text-purple-700 mb-1">{displayCode}</h3>
                      <p className="text-xs text-gray-600">Discount Code</p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-2">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {isPercentage 
                          ? `${discountValue}%` 
                          : `${discountValue} ${d.currency || 'RON'}`}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isPercentage 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isPercentage ? "Percentage" : "Fixed"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Expires: {new Date(d.expirationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteDiscount(d.id)} 
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        )}
        
        {discounts.length === 0 && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No discount codes</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new discount code.</p>
          </div>
        )}
      </section>

    </div>
    </div>
  );
}