'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const makeIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const modeIcons = {
  buy: makeIcon('blue'),
  rent: makeIcon('green'),
  sell: makeIcon('orange'),
};

function formatPriceMini(price) {
  if (!price) return 'Price on request';

  if (typeof price === 'string') {
    const n = parseFloat(price);
    if (!isNaN(n) && n.toString() === price) {
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      return `₹${n.toLocaleString('en-IN')}`;
    }
    return price.includes('₹') ? price : `₹${price}`;
  }

  if (typeof price === 'number') {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString('en-IN')}`;
  }

  return `₹${price}`;
}

function MapController({ fitTrigger, coords }) {
  const map = useMap();
  const prevTrigger = useRef(fitTrigger);

  useEffect(() => {
    if (fitTrigger !== prevTrigger.current && coords.length > 0) {
      prevTrigger.current = fitTrigger;
      const bounds = L.latLngBounds(coords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    }
  }, [fitTrigger, coords, map]);

  return null;
}

export default function MapComponent({ properties, onPropertySelect, fitTrigger }) {
  const coords = properties
    .filter((p) => p.coordinates)
    .map((p) => [p.coordinates.lat, p.coordinates.lng]);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      <MapController fitTrigger={fitTrigger} coords={coords} />

      {properties
        .filter((p) => p.coordinates)
        .map((p) => (
          <Marker
            key={p._id}
            position={[p.coordinates.lat, p.coordinates.lng]}
            icon={modeIcons[p.mode] || modeIcons.buy}
          >
            <Popup minWidth={230} maxWidth={260}>
              <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2px' }}>
                {p.gallery?.[0] && (
                  <img
                    src={p.gallery[0]}
                    alt={p.title}
                    style={{
                      width: '100%',
                      height: '110px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      display: 'block',
                    }}
                  />
                )}
                <div
                  style={{
                    fontWeight: '700',
                    fontSize: '13px',
                    color: '#111827',
                    marginBottom: '4px',
                    lineHeight: '1.3',
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    color: '#1d4ed8',
                    fontWeight: '800',
                    fontSize: '15px',
                    marginBottom: '7px',
                  }}
                >
                  {formatPriceMini(p.price)}
                  {p.mode === 'rent' && (
                    <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}> /mo</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '7px' }}>
                  <span
                    style={{
                      background: '#e0e7ff',
                      color: '#3730a3',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {p.type}
                  </span>
                  {p.bhk && p.bhk !== 'na' && (
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}
                    >
                      {p.bhk.toUpperCase()}
                    </span>
                  )}
                  <span
                    style={{
                      background: p.mode === 'rent' ? '#d1fae5' : p.mode === 'sell' ? '#fef3c7' : '#dbeafe',
                      color: p.mode === 'rent' ? '#065f46' : p.mode === 'sell' ? '#92400e' : '#1e40af',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    For {p.mode}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '10px' }}>
                  📍 {p.location}
                </div>
                <button
                  onClick={() => onPropertySelect(p)}
                  style={{
                    width: '100%',
                    background: '#1d4ed8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 0',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  View Full Details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
