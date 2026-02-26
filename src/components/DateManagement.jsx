import React, { useState, useEffect } from 'react';

const apiKey = import.meta.env.VITE_X_API_KEY;

export default function DateManagement({ apartments }) {
  const [action, setAction] = useState('block'); // 'block' or 'price'
  const [selectedApartment, setSelectedApartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [priceOverrides, setPriceOverrides] = useState([]);
  const [allBlockedDates, setAllBlockedDates] = useState([]);
  const [allPriceOverrides, setAllPriceOverrides] = useState([]);

  // Încarcă toate datele blocate și price overrides pentru toate apartamentele
  useEffect(() => {
    if (apartments && apartments.length > 0) {
      loadAllData();
    }
  }, [apartments]);

  useEffect(() => {
    if (selectedApartment) {
      loadBlockedDates();
      loadPriceOverrides();
    }
  }, [selectedApartment]);

  async function loadAllData() {
    const allBlocked = [];
    const allOverrides = [];
    for (const apt of apartments) {
      const aptId = apt._id || apt.id;
      try {
        const [blockedRes, overridesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/apartment-service/${aptId}/blocked-dates`, {
            headers: { 'x-api-key': apiKey }
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/apartment-service/${aptId}/price-overrides`, {
            headers: { 'x-api-key': apiKey }
          })
        ]);
        if (blockedRes.ok) {
          const data = await blockedRes.json();
          allBlocked.push(...data.map(d => ({ ...d, apartmentName: apt.name })));
        }
        if (overridesRes.ok) {
          const data = await overridesRes.json();
          allOverrides.push(...data.map(d => ({ ...d, apartmentName: apt.name })));
        }
      } catch (error) {
        console.error(`Error loading data for ${apt.name}:`, error);
      }
    }
    setAllBlockedDates(allBlocked);
    setAllPriceOverrides(allOverrides);
  }

  async function loadBlockedDates() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apartment-service/${selectedApartment}/blocked-dates`,
        {
          headers: {
            'x-api-key': apiKey
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBlockedDates(data);
      }
    } catch (error) {
      console.error('Error loading blocked dates:', error);
    }
  }

  async function loadPriceOverrides() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apartment-service/${selectedApartment}/price-overrides`,
        {
          headers: {
            'x-api-key': apiKey
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPriceOverrides(data);
      }
    } catch (error) {
      console.error('Error loading price overrides:', error);
    }
  }

  async function handleBlockDate(e) {
    e.preventDefault();
    if (!selectedApartment || !startDate || !endDate) {
      setMessage('Te rog completează toate câmpurile');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apartment-service/${selectedApartment}/block-dates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            startDate,
            endDate
          })
        }
      );

      if (response.ok) {
        setMessage('✅ Datele au fost blocate cu succes!');
        setStartDate('');
        setEndDate('');
        loadBlockedDates();
        loadAllData();
      } else {
        const error = await response.json();
        setMessage(`❌ Eroare: ${error.message || 'Nu s-a putut bloca perioada'}`);
      }
    } catch (error) {
      setMessage(`❌ Eroare: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePriceChange(e) {
    e.preventDefault();
    if (!selectedApartment || !startDate || !endDate || !newPrice) {
      setMessage('Te rog completează toate câmpurile');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apartment-service/${selectedApartment}/price-override`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            startDate,
            endDate,
            price: parseFloat(newPrice),
            currency: currency
          })
        }
      );

      if (response.ok) {
        setMessage('✅ Prețul a fost modificat cu succes!');
        setStartDate('');
        setEndDate('');
        setNewPrice('');
        setCurrency('EUR');
        loadPriceOverrides();
        loadAllData();
      } else {
        const error = await response.json();
        setMessage(`❌ Eroare: ${error.message || 'Nu s-a putut modifica prețul'}`);
      }
    } catch (error) {
      setMessage(`❌ Eroare: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBlock(blockId) {
    if (!confirm('Sigur vrei să ștergi această blocare?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apartment-service/blocked-dates/${blockId}`,
        {
          method: 'DELETE',
          headers: {
            'x-api-key': apiKey
          }
        }
      );

      if (response.ok) {
        setMessage('✅ Blocarea a fost ștearsă');
        loadBlockedDates();
        loadAllData();
      }
    } catch (error) {
      setMessage(`❌ Eroare: ${error.message}`);
    }
  }

  async function handleDeletePriceOverride(overrideId) {
    if (!confirm('Sigur vrei să ștergi această modificare de preț?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/apartment-service/price-overrides/${overrideId}`,
        {
          method: 'DELETE',
          headers: {
            'x-api-key': apiKey
          }
        }
      );

      if (response.ok) {
        setMessage('✅ Modificarea de preț a fost ștearsă');
        loadPriceOverrides();
        loadAllData();
      }
    } catch (error) {
      setMessage(`❌ Eroare: ${error.message}`);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Gestionare Date și Prețuri</h3>

      {/* Combo Box pentru selecția acțiunii */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Alege acțiunea:</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="block">Blochează o dată / perioadă</option>
          <option value="price">Modifică prețul unei date / perioade</option>
        </select>
      </div>

      {/* Selectare Apartament */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Selectează apartamentul:</label>
        <select
          value={selectedApartment}
          onChange={(e) => setSelectedApartment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Alege apartamentul --</option>
          {apartments.map((apt) => (
            <option key={apt.id || apt._id} value={apt.id || apt._id}>
              {apt.name} - {apt.city}
            </option>
          ))}
        </select>
      </div>

      {/* Formular pentru Blocare Date */}
      {action === 'block' && (
        <form onSubmit={handleBlockDate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data început:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data sfârșit:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedApartment}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Se procesează...' : '🔒 Blochează perioada'}
          </button>
        </form>
      )}

      {/* Formular pentru Modificare Preț */}
      {action === 'price' && (
        <form onSubmit={handlePriceChange} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data început:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data sfârșit:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Noul preț (per noapte):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="ex: 150.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valută:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="EUR">EUR (€)</option>
                <option value="RON">RON (lei)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedApartment}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Se procesează...' : '💰 Modifică prețul'}
          </button>
        </form>
      )}

      {/* Mesaj de feedback */}
      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Lista de date blocate - vizibilă permanent */}
      {allBlockedDates.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Date blocate actuale:</h4>
          <div className="space-y-2">
            {allBlockedDates.map((block) => (
              <div key={block._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="text-sm text-blue-600 font-medium mr-2">[{block.apartmentName}]</span>
                  <span className="font-medium">
                    {new Date(block.startDate).toLocaleDateString('ro-RO')} - {new Date(block.endDate).toLocaleDateString('ro-RO')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteBlock(block._id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Șterge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {allBlockedDates.length === 0 && (
        <div className="mt-6 text-gray-500 text-sm">Nu există date blocate.</div>
      )}

      {/* Lista de modificări de preț - vizibilă permanent */}
      {allPriceOverrides.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Modificări de preț active:</h4>
          <div className="space-y-2">
            {allPriceOverrides.map((override) => (
              <div key={override._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="text-sm text-blue-600 font-medium mr-2">[{override.apartmentName}]</span>
                  <span className="font-medium">
                    {new Date(override.startDate).toLocaleDateString('ro-RO')} - {new Date(override.endDate).toLocaleDateString('ro-RO')}
                  </span>
                  <span className="text-green-600 font-bold ml-3">
                    {override.currency === 'RON' ? `${override.price} lei` : `€${override.price}`}/noapte
                  </span>
                </div>
                <button
                  onClick={() => handleDeletePriceOverride(override._id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Șterge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {allPriceOverrides.length === 0 && (
        <div className="mt-6 text-gray-500 text-sm">Nu există modificări de preț.</div>
      )}
    </div>
  );
}
