import React, {useState, useEffect, useRef} from "react";
import { uploadFilesToCloudinary } from "../service/ApartmentService";

export default function ApartmentForm({ initialData, onSubmit, onCancel, onMessage }) {
  
  // ADDED: State for hotelId
  const [hotelId, setHotelId] = useState(initialData?.hotelId || "");
  // ADDED: State for roomId
  const [roomId, setRoomId] = useState(initialData?.roomId || "");
  // ADDED: State for stripeAccountId
  const [stripeAccountId, setStripeAccountId] = useState(initialData?.stripeAccountId || "");
  
  const [name, setName] = useState(initialData?.name || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [descriptionRo, setDescriptionRo] = useState(initialData?.descriptionRo || "");
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [currency, setCurrency] = useState(initialData?.currency || "RON");
  const [amenities, setAmenities] = useState(initialData?.amenities?.join(", ") || "");
  const [status, setStatus] = useState(initialData?.status || "available");
  // const [images, setImages] = useState(initialData?.images || []);
  
  
  const [maxGuests, setMaxGuests] = useState(initialData?.maxGuests || "");
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms || "");
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms || "");
  const [latitude, setLatitude] = useState(initialData?.coordinates?.latitude || "");
  const [longitude, setLongitude] = useState(initialData?.coordinates?.longitude || "");

  const [images, setImages] = useState(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  
  // refs to focus and scroll when editing
  const nameInputRef = useRef(null);
  const formRef = useRef(null);

  // Keep form fields in sync when `initialData` changes (e.g. user clicked Edit)
  useEffect(() => {
    if (initialData) {
      setHotelId(initialData?.hotelId || "");
      setRoomId(initialData?.roomId || "");
      setStripeAccountId(initialData?.stripeAccountId || "");
      setName(initialData?.name || "");
      setCity(initialData?.city || "");
      setAddress(initialData?.address || "");
      setDescriptionRo(initialData?.descriptionRo || "");
      setDescriptionEn(initialData?.descriptionEn || "");
      setPrice(initialData?.price ?? "");
      setCurrency(initialData?.currency || "RON");
      setAmenities(initialData?.amenities?.join(", ") || "");
      setStatus(initialData?.status || "available");
      setImages(initialData?.images || []);
      setMaxGuests(initialData?.maxGuests ?? "");
      setBedrooms(initialData?.bedrooms ?? "");
      setBathrooms(initialData?.bathrooms ?? "");
      setLatitude(initialData?.coordinates?.latitude ?? "");
      setLongitude(initialData?.coordinates?.longitude ?? "");

      // scroll the form into view and focus the name input
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nameInputRef.current?.focus();
    } else {
      // clear form when no initialData (e.g. cancelled)
      setHotelId("");
      setRoomId("");
      setStripeAccountId("");
      setName(""); setCity(""); setAddress("");
      setDescriptionRo(""); setDescriptionEn("");
      setPrice(""); setCurrency("RON");
      setAmenities(""); setImages([]);
      setStatus("available");
      setMaxGuests(""); setBedrooms(""); setBathrooms("");
      setLatitude(""); setLongitude("");
    }
  }, [initialData]);
  

  function handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  }

  function handleSelectImages(e) {
    const files = Array.from(e.target.files);
    addImages(files);
  }

 async function addImages(files) {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    try {
        const newUrls = await uploadFilesToCloudinary(files); 
        
        if (newUrls.length > 0) {
            setImages(prev => [...prev, ...newUrls]);
        }
        
        // FIX: Use the prop 'onMessage' to update the parent's state
        if (onMessage) {
            onMessage(`✅ Successfully uploaded ${newUrls.length} images.`);
        }
        
    } catch (error) {
        console.error("Image upload failed:", error);
        alert(`Image upload failed: ${error.message}`);
        
        // FIX: Use the prop 'onMessage' to update the parent's state with an error
        if (onMessage) {
             onMessage(` Error uploading images: ${error.message}`);
        }
        
    }
    
    setIsUploading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    // Construct the data object matching the required schema
    const apartmentData = {
      // Only include id if editing (not for new apartments)
      ...(initialData && { id: initialData._id || initialData.id }),
      // Only include hotelId if it has a value
      ...(hotelId && { hotelId }),
      // Only include roomId if it has a value
      ...(roomId && { roomId }),
      // Only include stripeAccountId if it has a value
      ...(stripeAccountId && { stripeAccountId }),
      name,
      city,
      address,
      descriptionRo,
      descriptionEn,
      price: Number(price) || 0,
      currency,
      
      amenities: amenities.split(",").map(a => a.trim()).filter(Boolean),
      images: images || [],
      status,
      // Include position if it exists (preserve when editing)
      ...(initialData?.position !== undefined && { position: initialData.position }),
      
      maxGuests: maxGuests ? Number(maxGuests) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      coordinates: {
        latitude: latitude ? Number(latitude) : 0,
        longitude: longitude ? Number(longitude) : 0,
      },
    };
    
    // Remove undefined values to avoid sending them to backend
    Object.keys(apartmentData).forEach(key => {
      if (apartmentData[key] === undefined) {
        delete apartmentData[key];
      }
    });
    
    onSubmit(apartmentData);

    if (!initialData) {
      // ADDED: Reset hotelId
      setHotelId("");
      // ADDED: Reset roomId
      setRoomId("");
      // ADDED: Reset stripeAccountId
      setStripeAccountId("");
      
      setName(""); setCity(""); setAddress(""); 
      setDescriptionRo(""); setDescriptionEn("");
      setAmenities(""); setImages([]); setPrice(""); 
      setStatus("available"); setCurrency("RON");
      
      
      setMaxGuests(""); setBedrooms(""); setBathrooms("");
      setLatitude(""); setLongitude("");
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Form Header */}
      {initialData && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
          <p className="text-sm font-medium text-blue-800">Editing: {initialData.name || 'Apartment'}</p>
        </div>
      )}
      
      {/* Basic Information Section */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel ID *</label>
            <input 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Hotel ID"
              value={hotelId} 
              onChange={e => setHotelId(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room ID *</label>
            <input 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Room ID"
              value={roomId} 
              onChange={e => setRoomId(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Account ID *</label>
            <input 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Stripe Account ID"
              value={stripeAccountId} 
              onChange={e => setStripeAccountId(e.target.value)} 
              required 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apartment Name *</label>
          <input 
            ref={nameInputRef} 
            className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
            placeholder="Apartment Name"
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="City"
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Address"
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              required 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
            <input 
              type="number" 
              step="any" 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Latitude (eg 45.7983)"
              value={latitude} 
              onChange={e => setLatitude(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
            <input 
              type="number" 
              step="any" 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Longitude (eg 24.1256)"
              value={longitude} 
              onChange={e => setLongitude(e.target.value)} 
              required 
            />
          </div>
        </div>
      </div>

      {/* Pricing & Details Section */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Night *</label>
            <input
              type="number"
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="Price"
              value={price}
              onChange={e => setPrice(e.target.value)}
              onWheel={e => e.target.blur()} 
              min="0" 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
            <select
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              <option value="RON">RON</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white" 
              value={status} 
              onChange={e => setStatus(e.target.value)}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests *</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Max Guests"
              value={maxGuests} 
              onChange={e => setMaxGuests(e.target.value)} 
              min="1" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms *</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Bedrooms"
              value={bedrooms} 
              onChange={e => setBedrooms(e.target.value)} 
              min="0" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms *</label>
            <input 
              type="number" 
              className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
              placeholder="Bathrooms"
              value={bathrooms} 
              onChange={e => setBathrooms(e.target.value)} 
              min="0" 
              required 
            />
          </div>
        </div>
      </div>

      {/* Descriptions Section */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Descriptions</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Romanian)</label>
          <textarea
            className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-y min-h-[100px]"
            placeholder="Description in Romanian"
            value={descriptionRo}
            onChange={(e) => setDescriptionRo(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
          <textarea
            className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-y min-h-[100px]"
            placeholder="Description in English"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
          <input 
            className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
            placeholder="Amenities (comma separated, e.g., WiFi, Parking, Pool)"
            value={amenities} 
            onChange={e => setAmenities(e.target.value)}
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Images</h3>
        
        <div
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
            isUploading 
              ? 'bg-yellow-50 border-yellow-400 animate-pulse' 
              : 'bg-white border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !isUploading && document.getElementById("file-input").click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 font-medium">Uploading... Please wait.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-gray-700 font-medium">Drag & Drop images here</p>
                <p className="text-sm text-gray-500 mt-1">or click to select</p>
              </div>
            </div>
          )}
          
          <input 
            id="file-input" 
            type="file" 
            multiple 
            accept="image/*"
            className="hidden" 
            onChange={handleSelectImages} 
            disabled={isUploading}
          />
        </div>

        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Uploaded Images ({images.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-indigo-400 transition-all">
                    <img src={img} className="w-full h-full object-cover" alt={`Upload ${i + 1}`} />
                  </div>
                  
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {i + 1}
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => {
                        const newArr = [...images];
                        [newArr[i-1], newArr[i]] = [newArr[i], newArr[i-1]];
                        setImages(newArr);
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all"
                      title="Move left"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      disabled={i === images.length - 1}
                      onClick={() => {
                        const newArr = [...images];
                        [newArr[i+1], newArr[i]] = [newArr[i], newArr[i+1]];
                        setImages(newArr);
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-all"
                      title="Move right"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, index) => index !== i))}
                      className="opacity-0 group-hover:opacity-100 bg-red-500 rounded-full p-1.5 hover:bg-red-600 transition-all"
                      title="Remove"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <button 
          type="submit" 
          className="flex-1 sm:flex-none px-6 sm:px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-base sm:text-lg"
        >
          {initialData ? "💾 Save Changes" : "➕ Add Apartment"}
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