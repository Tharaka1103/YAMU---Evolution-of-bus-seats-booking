'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader } from 'lucide-react';

interface RouteMapProps {
  fromCoords: { lat: number; lng: number };
  toCoords: { lat: number; lng: number };
  waypoints: { lat: number; lng: number }[];
  from: string;
  to: string;
}

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full" style="background-color: ${color}; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Fetch actual road route from OSRM
const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
      const distance = (route.distance / 1000).toFixed(1); // in km
      const duration = (route.duration / 60).toFixed(0); // in minutes
      
      return { coordinates, distance, duration };
    }
    return null;
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
};

export default function RouteMap({
  fromCoords,
  toCoords,
  waypoints,
  from,
  to
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      // Initialize map
      map.current = L.map(mapContainer.current!).setView(
        [(fromCoords.lat + toCoords.lat) / 2, (fromCoords.lng + toCoords.lng) / 2],
        9
      );

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Fetch actual road route
      const route = await fetchRoute(fromCoords, toCoords);

      if (route) {
        setRouteInfo({ distance: route.distance, duration: route.duration });
        
        // Draw actual road route
        L.polyline(route.coordinates, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map.current);

        // Fit bounds to show entire route
        const bounds = L.latLngBounds(route.coordinates);
        map.current.fitBounds(bounds.pad(0.05));
      } else {
        // Fallback to simple polyline if routing fails
        const routeLatLngs = waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
        L.polyline(routeLatLngs, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map.current);

        const group = new L.FeatureGroup([
          L.marker([fromCoords.lat, fromCoords.lng]),
          L.marker([toCoords.lat, toCoords.lng])
        ]);
        map.current.fitBounds(group.getBounds().pad(0.1));
      }

      // Add start marker
      L.marker([fromCoords.lat, fromCoords.lng], {
        icon: createCustomIcon('#22c55e')
      })
        .bindPopup(`<b>${from}</b><br/>Start`)
        .addTo(map.current);

      // Add end marker
      L.marker([toCoords.lat, toCoords.lng], {
        icon: createCustomIcon('#ef4444')
      })
        .bindPopup(`<b>${to}</b><br/>Destination`)
        .addTo(map.current);

      setLoading(false);
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [fromCoords, toCoords, waypoints, from, to]);

  return (
    <div className="relative w-full h-80 bg-muted overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-6 h-6 text-white animate-spin" />
            <span className="text-white text-sm font-medium">Loading route...</span>
          </div>
        </div>
      )}
      
      {/* Location label with route info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 z-10 shadow-md">
        <MapPin className="w-4 h-4 text-green-500" />
        <div className="flex flex-col gap-0.5">
          <span>{from} → {to}</span>
          {routeInfo && (
            <span className="text-xs text-muted-foreground">
              {routeInfo.distance} km • {routeInfo.duration} min
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
