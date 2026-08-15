import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Plus, MapPin, Heart, CheckCircle2, Crosshair, Filter, X, MousePointerClick } from 'lucide-react';
import { Place, PlaceStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { useApp } from '../../context/AppContext';

// Fix Leaflet default icon assets path in production Vite builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper custom SVG Leaflet markers matching Tuki mockup pin colors
const createCustomIcon = (status: PlaceStatus, isSelected: boolean) => {
  const colorMap: Record<PlaceStatus, { fill: string; stroke: string; glow: string }> = {
    saved: { fill: '#f43f5e', stroke: '#9f1239', glow: 'rgba(244, 63, 94, 0.4)' }, // Rose/Pink
    planning: { fill: '#8b5cf6', stroke: '#5b21b6', glow: 'rgba(139, 92, 246, 0.4)' }, // Purple
    visited: { fill: '#10b981', stroke: '#065f46', glow: 'rgba(16, 185, 129, 0.4)' }, // Emerald
  };

  const c = colorMap[status];
  const size = isSelected ? 42 : 36;

  const svgHtml = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${c.glow};
        filter: blur(4px);
        animation: pulse 2s infinite;
      "></div>
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const MapClickHandler: React.FC<{ isPinMode: boolean; onMapClick: (lat: number, lng: number) => void }> = ({ isPinMode, onMapClick }) => {
  useMapEvents({
    click(e) {
      if (isPinMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
};

interface GroupMapProps {
  places: Place[];
  onOpenAddModal?: (initialLat?: number, initialLng?: number, placeName?: string) => void;
}

export const GroupMap: React.FC<GroupMapProps> = ({ places, onOpenAddModal }) => {
  const { toggleInterest, currentUser, theme } = useApp();
  const [filterStatus, setFilterStatus] = useState<PlaceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5547, 121.0480]); // BGC Taguig default center
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isPinMode, setIsPinMode] = useState<boolean>(false);

  // Force Leaflet tile recalculation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Filter places
  const filteredPlaces = places.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    }
    return true;
  });

  useEffect(() => {
    if (places.length > 0) {
      const avgLat = places.reduce((sum, p) => sum + p.latitude, 0) / places.length;
      const avgLng = places.reduce((sum, p) => sum + p.longitude, 0) / places.length;
      setMapCenter([avgLat, avgLng]);
    }
  }, [places.length]);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapZoom(14);
        },
        () => {
          alert('Could not retrieve current location.');
        }
      );
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = places.find(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matched) {
      setMapCenter([matched.latitude, matched.longitude]);
      setMapZoom(14);
      setSelectedPlaceId(matched.id);
    } else {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setMapCenter([lat, lon]);
            setMapZoom(14);
            setTempMarker({ lat, lng: lon });
          } else {
            alert('No locations found.');
          }
        })
        .catch(() => {
          alert('Error searching for location.');
        });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!isPinMode) return;
    setTempMarker({ lat, lng });
    setIsPinMode(false);
    if (onOpenAddModal) {
      onOpenAddModal(lat, lng, searchQuery || 'New Spot');
    }
  };

  const handleActivatePinMode = () => {
    setIsPinMode(true);
  };

  const totalPlaces = places.length;
  const interestedCount = places.reduce((acc, p) => acc + p.interestedUserIds.length, 0);
  const visitedCount = places.filter((p) => p.status === 'visited').length;

  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div
      className={`relative w-full h-full min-h-[500px] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#090d16] shadow-xl ${isPinMode ? 'cursor-crosshair' : ''}`}
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    >
      {/* Pin Mode Indicator Banner */}
      {isPinMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1100] px-4 py-2 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-2xl flex items-center gap-3 animate-bounce">
          <MousePointerClick className="w-4 h-4" />
          <span>Click anywhere on the map to place your pin!</span>
          <button
            onClick={() => setIsPinMode(false)}
            className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white"
            title="Cancel Pin Mode"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between gap-3 pointer-events-auto">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search for a place on map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/90 dark:bg-[#111827]/90 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-800 backdrop-blur-md focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-lg"
          />
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Locate Me */}
        <button
          onClick={handleLocateUser}
          title="Find My Location"
          className="p-2.5 rounded-2xl bg-white/90 dark:bg-[#111827]/90 text-slate-700 dark:text-slate-200 hover:text-purple-600 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-md transition-all hover:scale-105"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        zoomControl={false}
        className="w-full h-full min-h-[500px]"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <MapClickHandler isPinMode={isPinMode} onMapClick={handleMapClick} />

        <TileLayer
          key={theme}
          url={tileUrl}
          subdomains={['a', 'b', 'c']}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {filteredPlaces.map((place) => {
          const isSelected = selectedPlaceId === place.id;
          const isInterested = place.interestedUserIds.includes(currentUser.id);

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={createCustomIcon(place.status, isSelected)}
              eventHandlers={{
                click: () => setSelectedPlaceId(place.id),
              }}
            >
              <Popup>
                <div className="w-64 p-3 bg-white dark:bg-[#161f30] text-slate-900 dark:text-slate-100 rounded-xl overflow-hidden shadow-2xl">
                  {place.photos[0] && (
                    <img
                      src={place.photos[0]}
                      alt={place.name}
                      className="w-full h-28 object-cover rounded-lg mb-2.5"
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{place.name}</h4>
                    <StatusBadge status={place.status} size="sm" />
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {place.address}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => toggleInterest(place.id)}
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        isInterested ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 hover:text-purple-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInterested ? 'fill-purple-600 text-purple-600' : ''}`} />
                      <span>{place.interestedUserIds.length} Interested</span>
                    </button>

                    <Link
                      to={`/places/${place.id}`}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-[11px] font-bold text-white transition-colors"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {tempMarker && (
          <Marker position={[tempMarker.lat, tempMarker.lng]} icon={createCustomIcon('saved', true)}>
            <Popup>
              <div className="w-56 p-3 bg-white dark:bg-[#161f30] text-slate-900 dark:text-slate-100 rounded-xl">
                <p className="font-bold text-xs text-rose-500">Selected Location</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Lat: {tempMarker.lat.toFixed(4)}, Lng: {tempMarker.lng.toFixed(4)}
                </p>
                {onOpenAddModal && (
                  <button
                    onClick={() => {
                      onOpenAddModal(tempMarker.lat, tempMarker.lng, searchQuery || 'New Spot');
                      setTempMarker(null);
                    }}
                    className="mt-3 w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow"
                  >
                    + Add to Group
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Bottom Stats Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] flex items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#111827]/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md text-xs font-bold">
          <div className="flex items-center gap-1.5 text-rose-500">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-900 dark:text-white font-extrabold">{totalPlaces}</span>
            <span className="text-slate-500 text-[11px]">Places</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-1.5 text-purple-500">
            <Heart className="w-3.5 h-3.5 fill-purple-500" />
            <span className="text-slate-900 dark:text-white font-extrabold">{interestedCount}</span>
            <span className="text-slate-500 text-[11px]">Interested</span>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-slate-900 dark:text-white font-extrabold">{visitedCount}</span>
            <span className="text-slate-500 text-[11px]">Visited</span>
          </div>
        </div>

        {onOpenAddModal && (
          <button
            onClick={handleActivatePinMode}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-white text-xs font-bold transition-all hover:scale-105 shrink-0 ${
              isPinMode
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-glow-emerald'
                : 'bg-purple-600 hover:bg-purple-700 shadow-glow-brand'
            }`}
          >
            <Plus className="w-4 h-4" /> {isPinMode ? 'Click Map Location' : 'Add Pin'}
          </button>
        )}
      </div>
    </div>
  );
};
