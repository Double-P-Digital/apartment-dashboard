import { useState, useEffect } from 'react';
import { getFailedReservations, retryReservationSync, markReservationResolved } from '../service/ReservationService';

const FailedReservationsAlert = () => {
  const [failedReservations, setFailedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const fetchFailedReservations = async () => {
    try {
      setError(null);
      const data = await getFailedReservations();
      setFailedReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailedReservations();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFailedReservations, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async (reservationId) => {
    setProcessingId(reservationId);
    try {
      const result = await retryReservationSync(reservationId);
      if (result.success) {
        // Remove from list on success
        setFailedReservations(prev => prev.filter(r => r._id !== reservationId));
      } else {
        alert(`Eroare: ${result.message}`);
      }
    } catch (err) {
      alert(`Eroare la retry: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkResolved = async (reservationId) => {
    const notes = prompt('Note (opțional):');
    if (notes === null) return; // User cancelled

    setProcessingId(reservationId);
    try {
      const result = await markReservationResolved(reservationId, notes);
      if (result.success) {
        // Remove from list on success
        setFailedReservations(prev => prev.filter(r => r._id !== reservationId));
      } else {
        alert(`Eroare: ${result.message}`);
      }
    } catch (err) {
      alert(`Eroare: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
        <p className="text-yellow-700 text-sm">
          Nu s-au putut încărca rezervările eșuate: {error}
        </p>
      </div>
    );
  }

  if (failedReservations.length === 0) {
    return null; // Don't show anything if no failed reservations
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg mb-6 overflow-hidden shadow-md">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-red-100 cursor-pointer hover:bg-red-200 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {failedReservations.length}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-red-800">
              Rezervări cu sincronizare eșuată
            </h3>
            <p className="text-red-600 text-sm">
              Aceste rezervări au fost plătite dar nu s-au sincronizat cu PynBooking
            </p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-red-600 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4">
          <div className="space-y-4">
            {failedReservations.map((reservation) => (
              <div 
                key={reservation._id} 
                className="bg-white rounded-lg p-4 shadow-sm border border-red-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Guest Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold text-gray-900">{reservation.guestName}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${reservation.guestPhone}`} className="text-blue-600 hover:underline">
                          {reservation.guestPhone}
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${reservation.guestEmail}`} className="text-blue-600 hover:underline truncate">
                          {reservation.guestEmail}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-green-600">
                        {reservation.totalPrice} {reservation.currency || 'RON'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        ID: {reservation.paymentIntentId?.slice(-8) || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Error Info */}
                  <div className="flex-1">
                    <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mb-2">
                      <strong>Eroare:</strong> {reservation.syncError || 'Unknown error'}
                    </div>
                    {reservation.syncFailedAt && (
                      <div className="text-xs text-gray-500">
                        Eșuat la: {new Date(reservation.syncFailedAt).toLocaleString('ro-RO')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRetry(reservation._id)}
                      disabled={processingId === reservation._id}
                      className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      {processingId === reservation._id ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Retry
                    </button>
                    
                    <button
                      onClick={() => handleMarkResolved(reservation._id)}
                      disabled={processingId === reservation._id}
                      className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Rezolvat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="mt-4 text-center">
            <button
              onClick={fetchFailedReservations}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Reîncarcă lista
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FailedReservationsAlert;



