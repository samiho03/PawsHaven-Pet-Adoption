// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css'; // Import the CSS file

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to update map view on search
function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

function Map() {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState([6.9271, 79.8612]); // Default: Colombo
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      // Step 1: Geocode location using Nominatim
      const nominatimURL = `https://nominatim.openstreetmap.org/search?q=${location}&format=json`;
      const nominatimResponse = await axios.get(nominatimURL);
      const data = nominatimResponse.data;

      if (data.length === 0) {
        alert('Location not found!');
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      setCoordinates([lat, lon]);

      const range = 0.2;
      const latMin = lat - range;
      const lonMin = lon - range;
      const latMax = lat + range;
      const lonMax = lon + range;

      const overpassQuery = `
        [out:json][timeout:30];
        (
          node["amenity"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});
          way["amenity"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});
          relation["amenity"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});

          node["healthcare"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});
          way["healthcare"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});
          relation["healthcare"="veterinary"](${latMin},${lonMin},${latMax},${lonMax});

          node["name"~"පශු වෛර්ෂය|පශු වෛද්ය|පශු රෝහල",i](${latMin},${lonMin},${latMax},${lonMax});
          node["shop"="pet"](${latMin},${lonMin},${latMax},${lonMax});
          way["shop"="pet"](${latMin},${lonMin},${latMax},${lonMax});
          relation["shop"="pet"](${latMin},${lonMin},${latMax},${lonMax});

          node["name"~"vet|animal|pet hospital", i](${latMin},${lonMin},${latMax},${lonMax});
          way["name"~"vet|animal|pet hospital", i](${latMin},${lonMin},${latMax},${lonMax});
          relation["name"~"vet|animal|pet hospital", i](${latMin},${lonMin},${latMax},${lonMax});

          node["description"~"vet|animal|pet hospital", i](${latMin},${lonMin},${latMax},${lonMax});
          way["description"~"vet|animal|pet hospital", i](${latMin},${lonMin},${latMax},${lonMax});
          relation["description"~"vet|animal|pet hospital", i](${latMin},${lonMin},${latMax},${lonMax});
        );
        out center;
      `;

      // Step 4: Fetch vet locations
      const overpassResponse = await axios.post(
        'https://overpass-api.de/api/interpreter',
        overpassQuery,
        { headers: { 'Content-Type': 'text/plain' } }
      );

      setResults(overpassResponse.data.elements);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="map-container">
     <h1 className="map-title">Pet Hospital Finder</h1>
     <p className="map-subtitle">Find veterinary clinics and pet hospitals near you</p>
      <form onSubmit={handleSearch} className="map-search-form">
        <input
          type="text"
          value={location}
          placeholder="Enter location (e.g. Colombo)"
          onChange={(e) => setLocation(e.target.value)}
          required
          className="map-search-input"
        />
        <button 
          type="submit" 
          className="map-search-button"
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="map-wrapper">
        <MapContainer
          center={coordinates}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeMapView center={coordinates} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {results.map((place, index) => {
            const lat = place.lat || place.center?.lat;
            const lon = place.lon || place.center?.lon;

            if (typeof lat !== 'number' || typeof lon !== 'number') {
              console.warn(`Skipping place ${index} due to missing coordinates`, place);
              return null;
            }

            return (
              <Marker key={index} position={[lat, lon]}>
                <Popup>
                  <div className="map-popup-content">
                    <strong>{place.tags?.name || 'Unnamed Place'}</strong>
                    <div className="map-popup-type">
                      {place.tags?.amenity || place.tags?.healthcare || place.tags?.shop || ''}
                    </div>
                    {place.tags?.phone && (
                      <div className="map-popup-phone">
                        📞 {place.tags.phone}
                      </div>
                    )}
                    {place.tags?.website && (
                      <div className="map-popup-website">
                        🌐 <a href={place.tags.website} target="_blank" rel="noreferrer">Website</a>
                      </div>
                    )}
                    {place.tags?.opening_hours && (
                      <div className="map-popup-hours">
                        🕒 {place.tags.opening_hours}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default Map;