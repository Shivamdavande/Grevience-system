import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import axios from 'axios';
import { MapPin, Navigation, Loader2, Target, Globe, ShieldCheck, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const LocationMarker = ({ position, updateLocation }) => {
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

const RecenterMap = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.flyTo(pos, 15);
    }
  }, [pos, map]);
  return null;
};

const MapPicker = ({ onLocationSelect, initialPos }) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState(initialPos || [23.2599, 77.4126]); // Default to Bhopal
  const [detecting, setDetecting] = useState(false);

  const updateLocation = async (lat, lon) => {
    setPosition([lat, lon]);
    
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers: { 'User-Agent': 'AIGrievanceSystem/1.0' }
      });
      const address = res.data.display_name;
      onLocationSelect({ lat, lon, address });
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      onLocationSelect({ lat, lon, address: `LAT: ${lat.toFixed(6)}, LON: ${lon.toFixed(6)}` });
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
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-gov-navy/10 ring-1 ring-gray-100">
      <MapContainer center={position} zoom={13} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} updateLocation={updateLocation} />
        <RecenterMap pos={position} />
      </MapContainer>
      
      {/* Precision Overlay */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <div className="bg-gov-navy/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-3 text-gov-saffron shadow-xl">
          <Target className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Precision Tagging Active</span>
        </div>
      </div>

      {/* Tap Hint */}
      <div className="absolute top-4 right-4 z-[400] pointer-events-none hidden sm:flex">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2 text-gov-navy shadow-lg shadow-black/5">
          <Crosshair className="w-3.5 h-3.5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Tap Map to Pinpoint</span>
        </div>
      </div>

      {/* GPS Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleDetect}
        disabled={detecting}
        className="absolute bottom-6 right-6 z-[400] px-6 py-4 bg-gov-navy text-white rounded-2xl flex items-center gap-3 shadow-2xl shadow-gov-navy/40 hover:bg-gov-navy-deep transition-all disabled:opacity-50 group"
      >
        {detecting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Navigation className="w-5 h-5 text-gov-saffron group-hover:rotate-45 transition-transform" />
        )}
        <span className="text-sm font-bold tracking-tight">
          {detecting ? "Acquiring Signal..." : "Use Current Location"}
        </span>
      </motion.button>

      {/* Status Bar */}
      <div className="absolute bottom-6 left-6 z-[400] pointer-events-none hidden md:block">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 text-xs font-bold text-gray-500 shadow-lg">
          <Globe className="w-3.5 h-3.5" />
          {position[0].toFixed(4)}°N, {position[1].toFixed(4)}°E
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
