'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  SlidersHorizontal,
  Maximize2,
  Phone,
  ExternalLink,
  Building2,
  Layers,
  Compass,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Home,
  Check
} from 'lucide-react';
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
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [property, onClose]);

  if (!property) return null;

  const p = property;
  const hasImages = p.gallery && p.gallery.length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Modal header */}
        <div className="bg-[#0B0F19] text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#D7242A]/20 border border-[#D7242A]/40 flex items-center justify-center text-[#ff6b70]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight line-clamp-1">{p.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D7242A] shrink-0" />
                <span className="truncate">{p.location}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Price & Primary Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">Portfolio Valuation</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#D7242A] tracking-tight">{formatPrice(p.price)}</span>
                {p.mode === 'rent' && <span className="text-xs text-slate-500 font-semibold">/ month</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                {p.type}
              </span>
              {p.bhk && p.bhk !== 'na' && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg">
                  {p.bhk.toUpperCase()}
                </span>
              )}
              <span
                className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                  p.mode === 'rent'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : p.mode === 'sell'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                For {p.mode}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                  p.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : p.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {p.status}
              </span>
            </div>
          </div>

          {/* Direct Sales Rep Call Bar */}
          {p.contactNumber && (
            <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-slate-50 border border-red-200/80 rounded-2xl p-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#D7242A] text-white flex items-center justify-center shadow-md shadow-[#D7242A]/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Dedicated Sales Desk</p>
                  <p className="text-base font-extrabold text-slate-900 tracking-wide">{p.contactNumber}</p>
                </div>
              </div>
              <a
                href={`tel:${p.contactNumber}`}
                className="px-4 py-2.5 bg-[#D7242A] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#99151A] transition-colors shadow-sm"
              >
                Call Hotline
              </a>
            </div>
          )}

          {/* Image Gallery */}
          {hasImages && (
            <div>
              <div className="relative rounded-2xl overflow-hidden mb-3 bg-slate-950 border border-slate-200 h-64">
                <img
                  src={p.gallery[imgIdx]}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-bold">
                  {imgIdx + 1} / {p.gallery.length}
                </div>
              </div>
              {p.gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {p.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === imgIdx ? 'border-[#D7242A] scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Key Specs Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Architectural Specs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {p.squareFootage && <SpecCard label="Super Area" value={`${p.squareFootage} sq ft`} />}
              {p.carpetArea && <SpecCard label="Carpet Area" value={`${p.carpetArea} sq ft`} />}
              {p.floorNumber && (
                <SpecCard
                  label="Floor Elevation"
                  value={p.totalFloors ? `${p.floorNumber} of ${p.totalFloors}` : `${p.floorNumber}`}
                />
              )}
              {p.parkingSpaces && <SpecCard label="Reserved Parking" value={`${p.parkingSpaces} Bay`} />}
              {p.furnishingStatus && (
                <SpecCard label="Furnishing" value={p.furnishingStatus.replace('-', ' ')} capitalize />
              )}
              {p.propertyCondition && (
                <SpecCard label="Condition" value={p.propertyCondition.replace('-', ' ')} capitalize />
              )}
              {p.yearBuilt && <SpecCard label="Year Built" value={p.yearBuilt} />}
              {p.developer && <SpecCard label="Developer" value={p.developer} />}
              {p.possession && <SpecCard label="Possession" value={p.possession} />}
              {p.bank && <SpecCard label="Preferred Bank" value={p.bank} />}
            </div>
          </div>

          {/* Description */}
          {p.description && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Executive Summary</h3>
              <p className="text-sm text-slate-600 leading-relaxed p-4 rounded-2xl bg-slate-50 border border-slate-100 line-clamp-4">
                {p.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {p.amenities?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Lifestyle Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {p.amenities.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-medium rounded-xl border border-slate-200/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Locations */}
          {p.nearbyLocations?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Target Territory Catchment</h3>
              <div className="flex flex-wrap gap-2">
                {p.nearbyLocations.map((loc, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-rose-50 text-[#D7242A] border border-rose-200/60 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3 text-[#D7242A]" />
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 px-6 bg-slate-50 border-t border-slate-200/80">
          <div>
            {p.mapLocationLink && (
              <a
                href={p.mapLocationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#D7242A] transition-colors"
              >
                <Compass className="w-4 h-4 text-[#D7242A]" />
                Open External Google Maps
              </a>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <Link
              href={`/admin/crm/property/${p._id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#0B0F19] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#D7242A] transition-all shadow-md"
            >
              View Property Dossier
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecCard({ label, value, capitalize }) {
  return (
    <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3">
      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">{label}</div>
      <div className={`text-xs font-bold text-slate-800 truncate ${capitalize ? 'capitalize' : ''}`}>{value}</div>
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
    if (!user) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== 'admin') {
      router.push('/');
      return;
    }
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

    // Phase 2: Nominatim for remaining (rate-limited to 1.1s)
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

        // Try 3: first word only + India
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
    setFitTrigger((t) => t + 1);
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
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-[#0B0F19]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#D7242A]/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-[#D7242A] animate-spin"></div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Geospatial Cartography...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-900">
      {/* ── Floating Executive HUD Bar ───────────────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2.5 flex-wrap justify-center">
        {/* Title pill */}
        <div className="bg-[#0B0F19]/90 backdrop-blur-md text-white shadow-xl rounded-full px-5 py-2.5 flex items-center gap-2.5 border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-[#D7242A] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Geospatial Intelligence</span>
          <span className="text-[11px] font-bold text-[#ff6b70] bg-[#D7242A]/20 px-2.5 py-0.5 rounded-full border border-[#D7242A]/30">
            {visibleWithCoords} / {allProperties.length} Indexed
          </span>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-md border ${
            activeFilterCount > 0
              ? 'bg-[#D7242A] text-white border-[#D7242A] shadow-md shadow-[#D7242A]/25'
              : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-[#D7242A] text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-black">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Fit Bounds Button */}
        <button
          onClick={() => setFitTrigger((t) => t + 1)}
          className="bg-white/95 hover:bg-white text-slate-800 shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2 border border-slate-200 text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-md"
          title="Fit view to all active coordinates"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
          <span>Reset Frame</span>
        </button>
      </div>

      {/* ── Filter Drawer ───────────────────────────────────────────────── */}
      {filtersOpen && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-slate-200/80 w-[92vw] max-w-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#D7242A]" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Territory Filters</h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ mode: 'all', type: 'all', bhk: 'all' })}
                className="text-xs text-[#D7242A] hover:underline font-bold"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Mode */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Transaction Mode
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {['all', 'buy', 'rent', 'sell'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilters((f) => ({ ...f, mode: m }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      filters.mode === m
                        ? 'bg-[#0B0F19] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m === 'all' ? 'All Modes' : `For ${m}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Typology
              </label>
              <div className="flex gap-1.5 flex-wrap max-h-36 overflow-y-auto pr-1">
                <button
                  onClick={() => setFilters((f) => ({ ...f, type: 'all' }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    filters.type === 'all'
                      ? 'bg-[#D7242A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Types
                </button>
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilters((f) => ({ ...f, type: t }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      filters.type === t
                        ? 'bg-[#D7242A] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* BHK */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                BHK Configuration
              </label>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilters((f) => ({ ...f, bhk: 'all' }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filters.bhk === 'all'
                      ? 'bg-[#0B0F19] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All BHK
                </button>
                {BHK_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilters((f) => ({ ...f, bhk: b }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      filters.bhk === b
                        ? 'bg-[#0B0F19] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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

      {/* ── Legend HUD ─────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-[#0B0F19]/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-800 text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Map Index</p>
        <div className="space-y-2">
          <LegendItem color="#D7242A" label="For Acquisition (Buy)" />
          <LegendItem color="#3B82F6" label="Leasing Portfolio (Rent)" />
          <LegendItem color="#F59E0B" label="Exclusive Mandate (Sell)" />
        </div>
      </div>

      {/* ── Coordinate Geocoding Telemetry HUD ────────────────────────── */}
      {resolving && (
        <div className="absolute bottom-6 right-6 z-[1000] bg-[#0B0F19]/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-800 text-white min-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D7242A] animate-ping" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Geocoding Nodes…</p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#D7242A] to-rose-400 h-1.5 rounded-full transition-all duration-300"
              style={{
                width:
                  resolveProgress.total > 0
                    ? `${(resolveProgress.done / resolveProgress.total) * 100}%`
                    : '0%',
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-semibold flex justify-between">
            <span>Resolving assets</span>
            <span>
              {resolveProgress.done} / {resolveProgress.total}
            </span>
          </p>
        </div>
      )}

      {/* ── Full Leaflet Map ────────────────────────────────────────── */}
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
    <div className="flex items-center gap-2.5">
      <div
        className="w-2.5 h-2.5 rounded-full shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-medium text-slate-300">{label}</span>
    </div>
  );
}
