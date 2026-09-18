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
  buy: makeIcon('red'),
  rent: makeIcon('blue'),
  sell: makeIcon('gold'),
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
            <Popup minWidth={240} maxWidth={270} className="custom-luxury-popup">
              <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '4px' }}>
                {p.gallery?.[0] ? (
                  <div style={{ position: 'relative', height: '120px', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                    <img
                      src={p.gallery[0]}
                      alt={p.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(11, 15, 25, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {p.mode === 'rent' ? 'For Rent' : p.mode === 'sell' ? 'For Sale' : 'Verified'}
                    </div>
                  </div>
                ) : null}
                <div
                  style={{
                    fontWeight: '700',
                    fontSize: '13px',
                    color: '#0F172A',
                    marginBottom: '3px',
                    lineHeight: '1.3',
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    color: '#D7242A',
                    fontWeight: '800',
                    fontSize: '15px',
                    marginBottom: '6px',
                  }}
                >
                  {formatPriceMini(p.price)}
                  {p.mode === 'rent' && (
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}> /mo</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span
                    style={{
                      background: '#F1F5F9',
                      color: '#334155',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.type}
                  </span>
                  {p.bhk && p.bhk !== 'na' && (
                    <span
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '700',
                      }}
                    >
                      {p.bhk.toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📍</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.location}</span>
                </div>
                <button
                  onClick={() => onPropertySelect(p)}
                  style={{
                    width: '100%',
                    background: '#0B0F19',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 0',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#D7242A')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#0B0F19')}
                >
                  Inspect Listing
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
