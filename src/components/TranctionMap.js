import React, { useState, useEffect } from 'react';
import ParticleCanvas from './ParticleCanvas';

const TransactionMap = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  
  // Function to load Google Maps script
  const loadGoogleMapsScript = () => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyALQLhxgvllyOzJiTgr467C8u3oUPtr_Rk`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  };

  useEffect(() => {
    // Load Google Maps script
    loadGoogleMapsScript();
    
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);

        // Get user ID from localStorage (fallback to 1)
        const userId = localStorage.getItem('id') || '1';

        // Fetch transaction data from API
        const response = await fetch(`http://localhost:8080/api/users/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        console.log("Fetched Transactions:", userData.transactions);
        localStorage.setItem('alert', "Here you can view all your transactions on a map and see detailed information by clicking on the markers.");
        // Filter only transactions with location data
        const transactionsWithLocation = userData.transactions?.filter(
          transaction => transaction.location && transaction.location.latitude && transaction.location.longitude
        ) || [];
        
        setTransactions(transactionsWithLocation);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Initialize the map once Google Maps is loaded and transactions are available
  useEffect(() => {
    if (!mapLoaded || isLoading || transactions.length === 0) return;
    
    const initializeMap = () => {
      // Find center of all transactions (average lat/lng)
      const sumLat = transactions.reduce((sum, t) => sum + t.location.latitude, 0);
      const sumLng = transactions.reduce((sum, t) => sum + t.location.longitude, 0);
      const centerLat = sumLat / transactions.length;
      const centerLng = sumLng / transactions.length;
      
      // Create map
      const mapInstance = new window.google.maps.Map(document.getElementById('google-map'), {
        center: { lat: centerLat, lng: centerLng },
        zoom: 5,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ],
      });
      
      setMap(mapInstance);

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow();
      
      // Create markers for each transaction
      const mapMarkers = transactions.map(transaction => {
        const markerColor = transaction.transactionType === 'CREDIT' ? 'green' : 'red';
        
        const marker = new window.google.maps.Marker({
          position: { 
            lat: transaction.location.latitude, 
            lng: transaction.location.longitude 
          },
          map: mapInstance,
          title: `${transaction.merchant}: ₹${transaction.amount}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor,
            fillOpacity: 0.9,
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 8
          },
          animation: window.google.maps.Animation.DROP
        });
        
        // Add click event to marker
        marker.addListener('click', () => {
          // Format transaction date
          const date = new Date(transaction.timestamp).toLocaleDateString();
          
          // Set info window content
          const contentString = `
            <div style="color: #333; padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px; font-weight: bold;">${transaction.merchant}</h3>
              <p style="margin: 4px 0;"><span style="color: #666;">Amount:</span> <span style="color: ${transaction.transactionType === 'CREDIT' ? 'green' : 'red'};">₹${transaction.amount}</span></p>
              <p style="margin: 4px 0;"><span style="color: #666;">Type:</span> ${transaction.transactionType}</p>
              <p style="margin: 4px 0;"><span style="color: #666;">Date:</span> ${date}</p>
              <p style="margin: 4px 0;"><span style="color: #666;">From Location:</span> ${transaction.location.city}, ${transaction.location.country}</p>
            </div>
          `;
          
          infoWindow.setContent(contentString);
          infoWindow.open(mapInstance, marker);
          
          // Update selected transaction in React state
          setSelectedTransaction(transaction);
        });
        
        return marker;
      });
      
      setMarkers(mapMarkers);
      
      // Fit map bounds to include all markers
      if (mapMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        mapMarkers.forEach(marker => bounds.extend(marker.getPosition()));
        mapInstance.fitBounds(bounds);
        
        // Don't zoom in too far
        const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
          if (mapInstance.getZoom() > 15) {
            mapInstance.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    };
    
    initializeMap();
    
    // Cleanup function to remove markers when component unmounts
    return () => {
      if (markers.length > 0) {
        markers.forEach(marker => marker.setMap(null));
      }
    };
  }, [mapLoaded, isLoading, transactions]);

  // Highlight marker on table row click
  useEffect(() => {
    if (!selectedTransaction || !map || markers.length === 0) return;
    
    // Find the marker corresponding to selected transaction
    const marker = markers.find(m => 
      m.getPosition().lat() === selectedTransaction.location.latitude && 
      m.getPosition().lng() === selectedTransaction.location.longitude
    );
    
    if (marker) {
      // Center map on marker
      map.panTo(marker.getPosition());
      
      // Animate marker
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        marker.setAnimation(null);
      }, 1500);
    }
  }, [selectedTransaction, map, markers]);

  // Function to render transaction list
  const renderTransactionList = () => {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <ParticleCanvas/>
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Transaction Locations</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Merchant</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Location</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Amount</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Type</th>
                <th className="py-2 px-4 border-b border-gray-700 text-left text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr 
                    key={transaction.id} 
                    className={`${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'} cursor-pointer hover:bg-gray-700
                      ${selectedTransaction?.id === transaction.id ? 'bg-gray-700' : ''}`}
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="py-2 px-4 border-b border-gray-700 text-gray-300">{transaction.merchant}</td>
                    <td className="py-2 px-4 border-b border-gray-700 text-gray-300">
                      {transaction.location.city}, {transaction.location.country}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700 text-gray-300">₹{transaction.amount.toLocaleString()}</td>
                    <td className={`py-2 px-4 border-b border-gray-700 ${transaction.transactionType === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {transaction.transactionType}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-700 text-gray-300">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-400">
                    No transactions with location data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading transaction map...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <p>Please check that your backend is running and accessible.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-900 rounded-lg shadow-lg text-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Transaction Map Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">Total Mapped Transactions</h2>
          <p className="text-3xl font-bold text-white">{transactions.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">Unique Locations</h2>
          <p className="text-3xl font-bold text-blue-400">
            {new Set(transactions.map(t => `${t.location.city}-${t.location.country}`)).size}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">Unique Merchants</h2>
          <p className="text-3xl font-bold text-purple-400">
            {new Set(transactions.map(t => t.merchant)).size}
          </p>
        </div>
      </div>

      {/* Map Section */}
      <div className="mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Transaction Locations Map</h2>
          {transactions.length > 0 ? (
            <div 
              id="google-map" 
              className="w-full h-96 rounded-lg"
              style={{ display: mapLoaded ? 'block' : 'none' }}
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-700 rounded-lg">
              <p className="text-gray-400">No transactions with location data available</p>
            </div>
          )}
          {!mapLoaded && transactions.length > 0 && (
            <div className="w-full h-64 flex items-center justify-center bg-gray-700 rounded-lg">
              <p className="text-gray-400">Loading Google Maps...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Transactions List */}
      {renderTransactionList()}
    </div>
  );
};

export default TransactionMap;