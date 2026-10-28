import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Maximize2, Compass } from 'lucide-react';

interface MapViewProps {
  latitude: number;
  longitude: number;
  accuracy: number;
  title: string;
  cityName: string;
  subLocality?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  accuracy,
  title,
  cityName,
  subLocality
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create custom pulsing beacon marker
      const customIcon = L.divIcon({
        className: 'custom-gps-pin',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 -translate-x-1/2 -translate-y-1/2">
            <span class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></span>
            <span class="absolute w-5 h-5 rounded-full bg-emerald-500/60 animate-pulse"></span>
            <div class="relative w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #0f172a; padding: 4px;">
          <b style="font-size: 13px;">${cityName}</b>
          <div style="font-size: 11px; color: #475569;">${subLocality || title}</div>
          <div style="font-size: 10px; margin-top: 4px; font-family: monospace;">${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°</div>
        </div>
      `);

      const circle = L.circle([latitude, longitude], {
        radius: Math.max(accuracy, 15),
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer based on mapType
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);
    }
  }, [mapType]);

  // Update marker position and view when coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    const circle = circleRef.current;

    if (map && marker && circle) {
      marker.setLatLng([latitude, longitude]);
      marker.setPopupContent(`
        <div style="font-family: sans-serif; color: #0f172a; padding: 4px;">
          <b style="font-size: 13px;">${cityName}</b>
          <div style="font-size: 11px; color: #475569;">${subLocality || title}</div>
          <div style="font-size: 10px; margin-top: 4px; font-family: monospace;">${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°</div>
        </div>
      `);

      circle.setLatLng([latitude, longitude]);
      circle.setRadius(Math.max(accuracy, 15));

      map.flyTo([latitude, longitude], 16, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [latitude, longitude, accuracy, cityName, subLocality, title]);

  const handleCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([latitude, longitude], 16);
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
      <div ref={mapContainerRef} className="w-full h-full z-0 min-h-[220px]" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg text-slate-300">
        <button
          onClick={() => setMapType(mapType === 'streets' ? 'satellite' : 'streets')}
          title="Toggle Satellite / Street View"
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors hover:text-emerald-400"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          onClick={handleCenter}
          title="Recenter GPS Pin"
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors hover:text-emerald-400"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom coordinate badge */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{latitude.toFixed(5)}° N, {longitude.toFixed(5)}° E</span>
        <span className="text-slate-500">|</span>
        <span className="text-emerald-400">±{Math.round(accuracy)}m</span>
      </div>
    </div>
  );
};
