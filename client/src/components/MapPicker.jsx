import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

// Fix for default marker icon issue in Leaflet with React/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MapPicker = ({ onLocationSelect, initialPos }) => {
  const [position, setPosition] = useState(initialPos || [20.5937, 78.9629]); // Default to India center
  const [detecting, setDetecting] = useState(false);

  // Component to handle map clicks
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng);
      },
    });

    return position ? (
      <Marker 
        position={position} 
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const { lat, lng } = marker.getLatLng();
            updateLocation(lat, lng);
          },
        }}
      />
    ) : null;
  };

  // Component to fly to current position
  const RecenterMap = ({ pos }) => {
    const map = useMap();
    useEffect(() => {
      if (pos) {
        map.flyTo(pos, 15);
      }
    }, [pos, map]);
    return null;
  };

  const updateLocation = async (lat, lon) => {
    setPosition([lat, lon]);
    
    try {
      // Reverse geocoding to get human-readable address
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const address = res.data.display_name;
      onLocationSelect({ lat, lon, address });
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      onLocationSelect({ lat, lon, address: `${lat.toFixed(6)}, ${lon.toFixed(6)}` });
    }
  };

  const handleDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateLocation(latitude, longitude);
        setDetecting(false);
      },
      (err) => {
        console.error(err);
        alert("Error detecting location. Please pick manually on map.");
        setDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
        <RecenterMap pos={position} />
      </MapContainer>
      
      <button
        type="button"
        onClick={handleDetect}
        className="glass"
        disabled={detecting}
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          zIndex: 1000,
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--card-bg)',
          color: 'white',
          fontSize: '0.8rem'
        }}
      >
        {detecting ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
        {detecting ? 'Detecting...' : 'Use My Location'}
      </button>

      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        color: '#ccc',
        pointerEvents: 'none'
      }}>
        Tap map to set exact spot
      </div>
    </div>
  );
};

export default MapPicker;
