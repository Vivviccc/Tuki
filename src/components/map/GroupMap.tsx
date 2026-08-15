import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, Plus, MapPin, Heart, CheckCircle2, Crosshair, Filter, X, MousePointerClick, Compass } from 'lucide-react';
import { Place, PlaceStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { useApp } from '../../context/AppContext';

// Helper custom HTML DOM markers matching Tuki pin colors
const createMarkerElement = (status: PlaceStatus, isSelected: boolean) => {
  const colorMap: Record<PlaceStatus, { fill: string; stroke: string; glow: string }> = {
    saved: { fill: '#f43f5e', stroke: '#9f1239', glow: 'rgba(244, 63, 94, 0.4)' },
    planning: { fill: '#8b5cf6', stroke: '#5b21b6', glow: 'rgba(139, 92, 246, 0.4)' },
    visited: { fill: '#10b981', stroke: '#065f46', glow: 'rgba(16, 185, 129, 0.4)' },
  };

  const c = colorMap[status];
  const size = isSelected ? 42 : 36;

  const el = document.createElement('div');
  el.className = 'custom-maplibre-marker';
  el.style.cursor = 'pointer';
  el.innerHTML = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
      <div style="
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${c.glow};
        filter: blur(4px);
      "></div>
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff"/>
      </svg>
    </div>
  `;
  return el;
};

interface GroupMapProps {
  places: Place[];
  onOpenAddModal?: (initialLat?: number, initialLng?: number, placeName?: string) => void;
}

export const GroupMap: React.FC<GroupMapProps> = ({ places, onOpenAddModal }) => {
  const { toggleInterest, currentUser, theme } = useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [filterStatus, setFilterStatus] = useState<PlaceStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([121.0480, 14.5547]); // [lng, lat]
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isPinMode, setIsPinMode] = useState<boolean>(false);

  const isPinModeRef = useRef(isPinMode);
  isPinModeRef.current = isPinMode;

  const onOpenAddModalRef = useRef(onOpenAddModal);
  onOpenAddModalRef.current = onOpenAddModal;

  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // Filter places
  const filteredPlaces = places.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate center on places change
  useEffect(() => {
    if (places.length > 0) {
      const avgLat = places.reduce((sum, p) => sum + p.latitude, 0) / places.length;
      const avgLng = places.reduce((sum, p) => sum + p.longitude, 0) / places.length;
      setMapCenter([avgLng, avgLat]);
    }
  }, [places.length]);

  // Vector map style URL
  const styleUrl =
    theme === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: mapCenter,
      zoom: mapZoom,
      pitch: 30, // 3D Mapbox tilt perspective
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

    map.on('click', (e: maplibregl.MapMouseEvent) => {
      if (isPinModeRef.current) {
        const { lat, lng } = e.lngLat;
        setTempMarker({ lat, lng });
        setIsPinMode(false);
        if (onOpenAddModalRef.current) {
          onOpenAddModalRef.current(lat, lng, searchQueryRef.current || 'New Spot');
        }
      }
    });

    mapRef.current = map;

    const timer = setTimeout(() => {
      map.resize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync theme vector style change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(styleUrl);
    }
  }, [theme]);

  // Sync markers on filteredPlaces change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredPlaces.forEach((place) => {
      const isSelected = selectedPlaceId === place.id;
      const el = createMarkerElement(place.status, isSelected);

      const isInterested = place.interestedUserIds.includes(currentUser.id);

      // Popup HTML content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'w-64 p-3 bg-white dark:bg-[#161f30] text-slate-900 dark:text-slate-100 rounded-xl overflow-hidden shadow-2xl';
      popupDiv.innerHTML = `
        ${place.photos[0] ? `<img src="${place.photos[0]}" alt="${place.name}" class="w-full h-28 object-cover rounded-lg mb-2.5" />` : ''}
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">${place.name}</h4>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">📍 ${place.address}</p>
        <div class="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span class="text-xs font-semibold ${isInterested ? 'text-purple-600' : 'text-slate-400'}">❤️ ${place.interestedUserIds.length} Interested</span>
          <a href="/places/${place.id}" class="px-2.5 py-1 rounded-lg bg-purple-600 text-[11px] font-bold text-white transition-colors">Details &rarr;</a>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setDOMContent(popupDiv);

      el.addEventListener('click', () => {
        setSelectedPlaceId(place.id);
      });

      if (mapRef.current) {
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([place.longitude, place.latitude])
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      }
    });

    // Add temp pin marker if present
    if (tempMarker && mapRef.current) {
      const tempEl = createMarkerElement('saved', true);
      const tempMarkerInst = new maplibregl.Marker({ element: tempEl })
        .setLngLat([tempMarker.lng, tempMarker.lat])
        .addTo(mapRef.current);
      markersRef.current.push(tempMarkerInst);
    }
  }, [filteredPlaces, selectedPlaceId, tempMarker, currentUser.id]);

  // Fly to center when center/zoom changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: mapCenter,
        zoom: mapZoom,
        duration: 1200,
        essential: true,
      });
    }
  }, [mapCenter, mapZoom]);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.longitude, pos.coords.latitude]);
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
      setMapCenter([matched.longitude, matched.latitude]);
      setMapZoom(14);
      setSelectedPlaceId(matched.id);
    } else {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setMapCenter([lon, lat]);
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

  const handleActivatePinMode = () => {
    setIsPinMode(true);
  };

  const totalPlaces = places.length;
  const interestedCount = places.reduce((acc, p) => acc + p.interestedUserIds.length, 0);
  const visitedCount = places.filter((p) => p.status === 'visited').length;

  return (
    <div
      className={`relative w-full h-full min-h-[500px] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl ${isPinMode ? 'cursor-crosshair' : ''}`}
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    >
      {/* Pin Mode Indicator Banner */}
      {isPinMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1100] px-4 py-2 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-2xl flex items-center gap-3 animate-bounce pointer-events-auto">
          <MousePointerClick className="w-4 h-4" />
          <span>Click anywhere on the vector map to place your pin!</span>
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
            placeholder="Search 3D vector map..."
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

      {/* MapLibre GL 3D Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[500px]"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      />

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
