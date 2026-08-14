import React, { useState, useEffect } from 'react';
import { X, Search, MapPin, Sparkles, Star, MousePointerClick, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialName?: string;
}

// Mini Leaflet marker icon
const createMiniIcon = () => {
  const svgHtml = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(244, 63, 94, 0.4);
        filter: blur(4px);
      "></div>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'mini-leaflet-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

const MiniMapClickHandler: React.FC<{ onLocationPicked: (lat: number, lng: number) => void }> = ({ onLocationPicked }) => {
  useMapEvents({
    click(e) {
      onLocationPicked(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MiniMapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1 });
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [center, map]);
  return null;
};

export const AddPlaceModal: React.FC<AddPlaceModalProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialName,
}) => {
  const { addPlace, theme } = useApp();

  const [activeTab, setActiveTab] = useState<'search' | 'pinpoint'>(initialLat ? 'pinpoint' : 'search');
  const [searchQuery, setSearchQuery] = useState(initialName || '');
  const [name, setName] = useState(initialName || '');
  const [category, setCategory] = useState('Restaurant & Dining');
  const [address, setAddress] = useState('Quezon City, Metro Manila');
  const [latitude, setLatitude] = useState<number>(initialLat || 14.6407);
  const [longitude, setLongitude] = useState<number>(initialLng || 121.0744);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');
  const [initialThought, setInitialThought] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialLat && initialLng) {
      setLatitude(initialLat);
      setLongitude(initialLng);
      setActiveTab('pinpoint');
    }
    if (initialName) {
      setName(initialName);
      setSearchQuery(initialName);
    }
  }, [initialLat, initialLng, initialName]);

  if (!isOpen) return null;

  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const mockSearchResults = [
    {
      name: 'The Sunset Café',
      category: 'Café & Bakery',
      address: 'Katipunan Ave, Quezon City, Metro Manila',
      rating: '4.7 (231)',
      photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
      lat: 14.6407,
      lng: 121.0744,
    },
    {
      name: 'La Union Surf Cove',
      category: 'Beach & Surf',
      address: 'San Juan, La Union, Philippines',
      rating: '4.9 (412)',
      photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      lat: 16.6631,
      lng: 120.3204,
    },
    {
      name: 'The Black Room Speakeasy',
      category: 'Cocktail Bar',
      address: 'BGC, Taguig, Metro Manila',
      rating: '4.6 (188)',
      photo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
      lat: 14.5547,
      lng: 121.0480,
    },
  ];

  const handleSelectSearchResult = (spot: typeof mockSearchResults[0]) => {
    try {
      addPlace({
        name: spot.name,
        category: spot.category,
        address: spot.address,
        latitude: spot.lat,
        longitude: spot.lng,
        photos: [spot.photo],
        initialThought: initialThought.trim() || 'Excited to visit this spot!',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add place.');
    }
  };

  const handlePinpointPicked = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Place name is required.');
      return;
    }

    try {
      addPlace({
        name: name.trim(),
        category,
        address: address.trim() || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
        latitude,
        longitude,
        photos: photoUrl.trim() ? [photoUrl.trim()] : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
        initialThought: initialThought.trim() || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add place.');
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161f30] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add a Place</h3>
            <p className="text-xs text-slate-400">Search by name or pinpoint exact location on the map.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Search vs Pinpoint on Map */}
        <div className="p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Search Name
          </button>
          <button
            onClick={() => setActiveTab('pinpoint')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pinpoint'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Pinpoint on Map
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {activeTab === 'search' ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search e.g. Sunset Café, La Union..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setName(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Suggested Places
              </div>

              {mockSearchResults.map((spot, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center gap-3 hover:border-purple-300 transition-all"
                >
                  <img
                    src={spot.photo}
                    alt={spot.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {spot.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{spot.address}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{spot.rating}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectSearchResult(spot)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow shrink-0"
                  >
                    Add to Map
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* PINPOINT ON MAP TAB */
            <div className="space-y-4">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 shrink-0" />
                <span>Tap anywhere on the mini map to pinpoint exact location!</span>
              </div>

              {/* Mini Interactive Map Picker */}
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={13}
                  zoomControl={false}
                  className="w-full h-full"
                >
                  <MiniMapController center={[latitude, longitude]} />
                  <MiniMapClickHandler onLocationPicked={handlePinpointPicked} />
                  <TileLayer url={tileUrl} />
                  <Marker position={[latitude, longitude]} icon={createMiniIcon()} />
                </MapContainer>

                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-mono text-[10px] font-bold">
                  Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                </div>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Place Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter place name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none"
                    >
                      <option>Restaurant & Dining</option>
                      <option>Café & Bakery</option>
                      <option>Beach & Surf</option>
                      <option>Hiking & Camping</option>
                      <option>Cocktail Bar</option>
                      <option>Waterfall & Nature</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Address / Spot
                    </label>
                    <input
                      type="text"
                      placeholder="Address..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Initial Thought / Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder='e.g. "Best sunset view! Let us visit on Saturday."'
                    value={initialThought}
                    onChange={(e) => setInitialThought(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 focus:border-purple-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-glow-brand transition-all"
                >
                  + Pin This Location to Squad Map
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
