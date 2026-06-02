'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/formatPrice';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

// ─── coordinate helpers ───────────────────────────────────────────────────────

function extractFromUrl(url) {
  if (!url) return null;
  const patterns = [
    /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  }
  return null;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Property Detail Modal ────────────────────────────────────────────────────

function PropertyDetailModal({ property, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setImgIdx(0);
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [property, onClose]);

  if (!property) return null;

  const p = property;
  const hasImages = p.gallery && p.gallery.length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{p.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">📍 {p.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Price + badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-extrabold text-blue-700">{formatPrice(p.price)}</span>
              {p.mode === 'rent' && <span className="text-sm text-gray-500">/month</span>}
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full capitalize">{p.type}</span>
              {p.bhk && p.bhk !== 'na' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">{p.bhk.toUpperCase()}</span>
              )}
              <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                p.mode === 'rent' ? 'bg-emerald-100 text-emerald-800'
                : p.mode === 'sell' ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
              }`}>
                For {p.mode}
              </span>
              {p.furnishingStatus && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full capitalize">
                  {p.furnishingStatus.replace('-', ' ')}
                </span>
              )}
              <span className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                p.status === 'approved' ? 'bg-green-100 text-green-700'
                : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
              }`}>
                {p.status}
              </span>
            </div>

            {/* Contact — most important for calling agents */}
            {p.contactNumber && (
              <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 font-medium">Contact Number</p>
                    <p className="text-lg font-extrabold text-red-800 tracking-wide">{p.contactNumber}</p>
                  </div>
                </div>
                <a
                  href={`tel:${p.contactNumber}`}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Call Now
                </a>
              </div>
            )}

            {/* Image gallery */}
            {hasImages && (
              <div>
                <div className="relative rounded-xl overflow-hidden mb-3" style={{ height: '220px' }}>
                  <img
                    src={p.gallery[imgIdx]}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {imgIdx + 1} / {p.gallery.length}
                  </div>
                </div>
                {p.gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {p.gallery.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                          i === imgIdx ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key specs grid */}
            <div className="grid grid-cols-2 gap-3">
              {p.squareFootage && (
                <SpecCard icon="📐" label="Area" value={`${p.squareFootage} sq ft`} />
              )}
              {p.carpetArea && (
                <SpecCard icon="🏠" label="Carpet Area" value={`${p.carpetArea} sq ft`} />
              )}
              {p.floorNumber && (
                <SpecCard
                  icon="🏢"
                  label="Floor"
                  value={p.totalFloors ? `${p.floorNumber} of ${p.totalFloors}` : p.floorNumber}
                />
              )}
              {p.parkingSpaces && (
                <SpecCard icon="🚗" label="Parking" value={p.parkingSpaces} />
              )}
              {p.furnishingStatus && (
                <SpecCard icon="🛋️" label="Furnishing" value={p.furnishingStatus.replace('-', ' ')} capitalize />
              )}
              {p.propertyCondition && (
                <SpecCard icon="✅" label="Condition" value={p.propertyCondition.replace('-', ' ')} capitalize />
              )}
              {p.yearBuilt && (
                <SpecCard icon="📅" label="Year Built" value={p.yearBuilt} />
              )}
              {p.developer && (
                <SpecCard icon="🏗️" label="Developer" value={p.developer} />
              )}
              {p.possession && (
                <SpecCard icon="🔑" label="Possession" value={p.possession} />
              )}
              {p.bank && (
                <SpecCard icon="🏦" label="Bank" value={p.bank} />
              )}
            </div>

            {/* Description */}
            {p.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{p.description}</p>
              </div>
            )}

            {/* Amenities */}
            {p.amenities?.length > 0 && (
              <TagSection title="Amenities" tags={p.amenities} color="blue" />
            )}

            {/* Nearby Amenities */}
            {p.nearbyAmenities?.length > 0 && (
              <TagSection title="Nearby Amenities" tags={p.nearbyAmenities} color="orange" />
            )}

            {/* Nearby Locations */}
            {p.nearbyLocations?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Also Serves Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {p.nearbyLocations.map((loc, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      📍 {loc}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-purple-500 mt-1">Use for leads interested in these areas</p>
              </div>
            )}

            {/* Highlights */}
            {p.highlights?.length > 0 && (
              <TagSection title="Highlights" tags={p.highlights} color="green" />
            )}

            {/* Footer actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              {p.mapLocationLink && (
                <a
                  href={p.mapLocationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Open in Maps
                </a>
              )}
              <a
                href={`/admin/crm/property/${p._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Full Details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecCard({ icon, label, value, capitalize }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <div className="text-xs text-gray-500 mb-1">{icon} {label}</div>
      <div className={`text-sm font-semibold text-gray-800 ${capitalize ? 'capitalize' : ''}`}>{value}</div>
    </div>
  );
}

function TagSection({ title, tags, color }) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
  };
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span key={i} className={`px-3 py-1 text-xs font-medium rounded-full ${colorMap[color] || colorMap.blue}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = ['apartments', 'flats', 'villas', 'plots', 'commercial', 'office', 'shop', 'warehouse', 'farmhouse', 'pg', 'studio'];
const BHK_OPTIONS = ['1bhk', '2bhk', '3bhk', '4bhk', '5bhk'];

export default function AdminMapPage() {
  const router = useRouter();
  const [allProperties, setAllProperties] = useState([]);
  const [resolvedProperties, setResolvedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveProgress, setResolveProgress] = useState({ done: 0, total: 0 });
  const [resolving, setResolving] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [filters, setFilters] = useState({ mode: 'all', type: 'all', bhk: 'all' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resolvedRef = useRef([]);

  // Auth check
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { router.push('/login'); return; }
    const parsed = JSON.parse(user);
    if (parsed.role !== 'admin') { router.push('/'); return; }
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/properties', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const props = data.properties || data.data || [];
      setAllProperties(props);
      setLoading(false);
      resolveAllCoordinates(props);
    } catch {
      setLoading(false);
    }
  };

  const resolveAllCoordinates = useCallback(async (props) => {
    setResolving(true);
    setResolveProgress({ done: 0, total: props.length });
    resolvedRef.current = [];

    // Phase 1: properties with mapLocationLink (try client-side first, then API)
    const withLink = props.filter((p) => p.mapLocationLink);
    const withoutLink = props.filter((p) => !p.mapLocationLink);

    // Parallel resolve for link-based properties
    const linkResults = await Promise.all(
      withLink.map(async (p) => {
        let coords = extractFromUrl(p.mapLocationLink);
        if (!coords) {
          try {
            const r = await fetch('/api/maps/extract-coordinates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: p.mapLocationLink }),
            });
            const d = await r.json();
            if (d.coordinates) coords = d.coordinates;
          } catch {}
        }
        return { ...p, coordinates: coords };
      })
    );

    resolvedRef.current = linkResults;
    setResolvedProperties([...resolvedRef.current]);
    setResolveProgress({ done: withLink.length, total: props.length });

    // Phase 2: Nominatim for remaining (rate-limited to 1/sec)
    for (const p of withoutLink) {
      let coords = null;
      if (p.location) {
        const nominatimSearch = async (query) => {
          await delay(1100);
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`,
              { headers: { 'User-Agent': 'A4Realty-AdminMap/1.0' } }
            );
            const d = await r.json();
            if (d?.[0]) return { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
          } catch {}
          return null;
        };

        // Try 1: exact location + India
        coords = await nominatimSearch(`${p.location}, India`);

        // Try 2: last part of location (city/area) + India
        if (!coords && p.location.includes(',')) {
          const parts = p.location.split(',');
          const city = parts[parts.length - 1].trim();
          if (city) coords = await nominatimSearch(`${city}, India`);
        }

        // Try 3: first word only + India (catches "Andheri West, Mumbai" → "Andheri")
        if (!coords) {
          const firstChunk = p.location.split(',')[0].trim();
          if (firstChunk && firstChunk !== p.location) {
            coords = await nominatimSearch(`${firstChunk}, India`);
          }
        }
      }
      resolvedRef.current = [...resolvedRef.current, { ...p, coordinates: coords }];
      setResolvedProperties([...resolvedRef.current]);
      setResolveProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    setResolving(false);
    setFitTrigger((t) => t + 1); // auto-fit once all done
  }, []);

  const filteredProperties = useMemo(() => {
    return resolvedProperties.filter((p) => {
      if (filters.mode !== 'all' && p.mode !== filters.mode) return false;
      if (filters.type !== 'all' && p.type !== filters.type) return false;
      if (filters.bhk !== 'all' && p.bhk !== filters.bhk) return false;
      return true;
    });
  }, [resolvedProperties, filters]);

  const visibleWithCoords = filteredProperties.filter((p) => p.coordinates).length;
  const activeFilterCount = Object.values(filters).filter((v) => v !== 'all').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* ── Floating top bar ───────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Title pill */}
        <div className="bg-white shadow-lg rounded-full px-5 py-2 flex items-center gap-2 border border-gray-200">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-sm font-bold text-gray-800">Property Map</span>
          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">
            {visibleWithCoords} / {allProperties.length} on map
          </span>
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 border text-sm font-medium transition-colors ${
            activeFilterCount > 0
              ? 'border-blue-400 text-blue-700'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Fit markers button */}
        <button
          onClick={() => setFitTrigger((t) => t + 1)}
          className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
          title="Fit map to visible markers"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Fit All
        </button>
      </div>

      {/* ── Filter panel ───────────────────────────────────────────────── */}
      {filtersOpen && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            minWidth: '340px',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Filter Properties</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ mode: 'all', type: 'all', bhk: 'all' })}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Mode */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Mode</label>
              <div className="flex gap-2 flex-wrap">
                {['all', 'buy', 'rent', 'sell'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilters((f) => ({ ...f, mode: m }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                      filters.mode === m
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {m === 'all' ? 'All Modes' : `For ${m}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Property Type</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilters((f) => ({ ...f, type: 'all' }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                    filters.type === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Types
                </button>
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilters((f) => ({ ...f, type: t }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                      filters.type === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* BHK */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">BHK</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilters((f) => ({ ...f, bhk: 'all' }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    filters.bhk === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All BHK
                </button>
                {BHK_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilters((f) => ({ ...f, bhk: b }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase transition-colors ${
                      filters.bhk === b ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '16px',
          zIndex: 1000,
          background: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb',
        }}
      >
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Legend</p>
        <div className="space-y-1.5">
          <LegendItem color="#2563eb" label="For Buy" />
          <LegendItem color="#16a34a" label="For Rent" />
          <LegendItem color="#d97706" label="For Sell" />
        </div>
      </div>

      {/* ── Resolve progress bar ────────────────────────────────────────── */}
      {resolving && (
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            right: '16px',
            zIndex: 1000,
            background: 'white',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid #e5e7eb',
            minWidth: '200px',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-xs font-semibold text-gray-700">Locating properties…</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: resolveProgress.total > 0
                  ? `${(resolveProgress.done / resolveProgress.total) * 100}%`
                  : '0%',
              }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {resolveProgress.done} / {resolveProgress.total}
          </p>
        </div>
      )}

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <MapComponent
        properties={filteredProperties}
        onPropertySelect={setSelectedProperty}
        fitTrigger={fitTrigger}
      />

      {/* ── Property Detail Modal ───────────────────────────────────────── */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
