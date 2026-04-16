"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Geographic center of Brazil
const BRAZIL_CENTER: [number, number] = [-51.925, -14.235];
const BRAZIL_ZOOM = 4;

// Free vector tile style — no API key required
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

interface MapViewProps {
  lat: number | null;
  lon: number | null;
}

export default function MapView({ lat, lon }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: BRAZIL_CENTER,
      zoom: BRAZIL_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker whenever coords change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat === null || lon === null) return;

    const lngLat: [number, number] = [lon, lat];

    if (markerRef.current) {
      markerRef.current.setLngLat(lngLat);
    } else {
      const el = document.createElement("div");
      el.className = "hermes-marker";

      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .addTo(map);
    }

    map.flyTo({ center: lngLat, zoom: 10, duration: 1500 });
  }, [lat, lon]);

  return <div ref={containerRef} className="w-full h-full" />;
}
