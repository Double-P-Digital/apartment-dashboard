import React, {useState, useEffect, useRef} from "react";
import { uploadFilesToCloudinary } from "../service/ApartmentService";

export default function ApartmentForm({ initialData, onSubmit, onCancel, onMessage }) {
  
  // ADDED: State for hotelId
  const [hotelId, setHotelId] = useState(initialData?.hotelId || "");
  
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
             onMessage(`❌ Error uploading images: ${error.message}`);
        }
        
    }
    
    setIsUploading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    // Construct the data object matching the required schema
    onSubmit({
      id: initialData?.id,
      // ADDED: Include hotelId in the submission
      hotelId, 
      name,
      city,
      address,
      descriptionRo,
      descriptionEn,
      price: Number(price),
      currency,
      
      amenities: amenities.split(",").map(a => a.trim()).filter(Boolean),
      images,
      status,
      
      maxGuests: Number(maxGuests),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      coordinates: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    });

    if (!initialData) {
      // ADDED: Reset hotelId
      setHotelId("");
      
      setName(""); setCity(""); setAddress(""); 
      setDescriptionRo(""); setDescriptionEn("");
      setAmenities(""); setImages([]); setPrice(""); 
      setStatus("available"); setCurrency("EUR");
      
      
      setMaxGuests(""); setBedrooms(""); setBathrooms("");
      setLatitude(""); setLongitude("");
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {/* ADDED: Input for Hotel ID (Make sure to match the input style of 'Name') */}
      <input className="w-full border p-2 rounded" placeholder="Hotel ID "
        value={hotelId} onChange={e => setHotelId(e.target.value)} required />
        
      <input ref={nameInputRef} className="w-full border p-2 rounded" placeholder="Apartment Name"
        value={name} onChange={e => setName(e.target.value)} required />

      {/* Location */}
      <div className="flex gap-3">
        <input className="w-full border p-2 rounded" placeholder="City"
          value={city} onChange={(e) => setCity(e.target.value)} required />  
        <input className="w-full border p-2 rounded" placeholder="Address"
          value={address} onChange={e => setAddress(e.target.value)} required />
      </div>

      {/* Price + Currency */}
      <div className="flex gap-3 items-center">
        <label className="text-sm font-medium text-gray-700">Price/Night:</label>
        <input
          type="number"
          className="w-32 border p-2 rounded"
          placeholder="Price"
          value={price}
          onChange={e => setPrice(e.target.value)}
          onWheel={e => e.target.blur()} 
          min="0" required
        />
        <select
          className="border p-2 rounded"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
        >
          <option value="RON">RON</option>
          <option value="EUR">EUR</option>
          
        </select>
      </div>
      
      {/* Capacity & Rooms */}
      <div className="flex gap-3">
        <input type="number" className="w-full border p-2 rounded" placeholder="Max Guests"
          value={maxGuests} onChange={e => setMaxGuests(e.target.value)} min="1" required />
        <input type="number" className="w-full border p-2 rounded" placeholder="Bedrooms"
          value={bedrooms} onChange={e => setBedrooms(e.target.value)} min="0" required />
        <input type="number" className="w-full border p-2 rounded" placeholder="Bathrooms"
          value={bathrooms} onChange={e => setBathrooms(e.target.value)} min="0" required />
      </div>

      {/* Coordinates */}
      <div className="flex gap-3">
        <input type="number" step="any" className="w-full border p-2 rounded" placeholder="Latitude (eg 45.7983)"
          value={latitude} onChange={e => setLatitude(e.target.value)} required />
        <input type="number" step="any" className="w-full border p-2 rounded" placeholder="Longitude (eg 24.1256)"
          value={longitude} onChange={e => setLongitude(e.target.value)} required />
      </div>

      {/* Descriptions */}
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description (Romanian)"
        value={descriptionRo}
        onChange={(e) => setDescriptionRo(e.target.value)}
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description (English)"
        value={descriptionEn}
        onChange={(e) => setDescriptionEn(e.target.value)}
      />

      <input className="w-full border p-2 rounded"
        placeholder="Amenities (comma separated)"
        value={amenities} onChange={e => setAmenities(e.target.value)}
      />

      <select className="w-full border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="available">available</option>
        <option value="unavailable">unavailable</option>
      </select>

      {/* Image Handling (Updated to show loading state) */}
      <div
        className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${isUploading ? 'bg-yellow-100 border-yellow-500 animate-pulse' : 'bg-gray-50 hover:bg-gray-100'}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !isUploading && document.getElementById("file-input").click()}
      >
        {isUploading 
          ? "Uploading... Please wait." 
          : "Drag & Drop images here or click to select"}
          
        <input 
          id="file-input" 
          type="file" 
          multiple 
          className="hidden" 
          onChange={handleSelectImages} 
          disabled={isUploading} // Disable input while uploading
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {images.map((img, i) => (
            <div key={i} className="relative group flex flex-col items-center">
              <img src={img} className="h-20 w-20 object-cover rounded border" />

              <div className="flex gap-1 mt-1">
                {/* Move Left */}
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => {
                    const newArr = [...images];
                    [newArr[i-1], newArr[i]] = [newArr[i], newArr[i-1]];
                    setImages(newArr);
                  }}
                  className="px-1 text-xs bg-gray-200 rounded disabled:opacity-30"
                >
                  ◀
                </button>

                {/* Move Right */}
                <button
                  type="button"
                  disabled={i === images.length - 1}
                  onClick={() => {
                    const newArr = [...images];
                    [newArr[i+1], newArr[i]] = [newArr[i], newArr[i+1]];
                    setImages(newArr);
                  }}
                  className="px-1 text-xs bg-gray-200 rounded disabled:opacity-30"
                >
                  ▶
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, index) => index !== i))}
                  className="px-1 text-xs bg-red-600 text-white rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
          {initialData ? "Save" : "Add"}
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