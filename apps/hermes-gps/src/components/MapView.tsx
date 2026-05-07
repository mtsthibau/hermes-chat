"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

// Geographic center of Brazil — MapLibre uses [longitude, latitude]
const BRAZIL_CENTER: [number, number] = [-56.623855, -14.518694];
const BRAZIL_ZOOM = 4;

// PMTiles file must be placed at /public/brazil.pmtiles
// Override with NEXT_PUBLIC_PMTILES_URL env variable (relative path or absolute URL)
const PMTILES_RAW = process.env.NEXT_PUBLIC_PMTILES_URL ?? "/brazil.pmtiles";

// Register pmtiles:// protocol handler with MapLibre (once per page load)
let _protocolRegistered = false;
function ensureProtocol(): void {
  if (_protocolRegistered) return;
  const proto = new Protocol();
  maplibregl.addProtocol("pmtiles", proto.tile.bind(proto));
  _protocolRegistered = true;
}

// Read the stored theme without a React context (used during initial map creation)
function readStoredDark(): boolean {
  try {
    return localStorage.getItem("hermes_theme") === "dark";
  } catch {
    return false;
  }
}

/**
 * Build a fully offline MapLibre style using a local PMTiles source.
 * No glyphs, sprites, or external URLs — all resources served from the app.
 * Layer schema: Protomaps OSM tiles (https://protomaps.com)
 */
function buildStyle(dark: boolean): StyleSpecification {
  // pmtiles:// + relative path → pmtiles:///brazil.pmtiles → protocol strips
  // "pmtiles://" and browser resolves "/brazil.pmtiles" against the page origin.
  // For an absolute URL like https://host/file.pmtiles the same logic applies.
  const tilesUrl = `pmtiles://${PMTILES_RAW}`;

  const c = dark
    ? {
        bg:         "#0d1b2a",
        earth:      "#1a2535",
        water:      "#0f2a42",
        natural:    "#1a2e1a",
        landuse:    "#1e2e1e",
        roadMinor:  "#2a3a4a",
        roadMajor:  "#3a4e5a",
        boundary:   "#4a6878",
        boundaryRg: "#3a5870",
      }
    : {
        bg:         "#e8f0ea",
        earth:      "#f5f0ea",
        water:      "#aad3df",
        natural:    "#c8dfbc",
        landuse:    "#d8eecc",
        roadMinor:  "#e0d8cc",
        roadMajor:  "#cfc0a8",
        boundary:   "#8899aa",
        boundaryRg: "#aabbcc",
      };

  return {
    version: 8,
    // No "glyphs" or "sprite" keys → fully offline, no text labels needed
    sources: {
      protomaps: {
        type: "vector",
        url: tilesUrl,
        attribution:
          '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": c.bg },
      },
      {
        id: "earth",
        type: "fill",
        source: "protomaps",
        "source-layer": "earth",
        paint: { "fill-color": c.earth },
      },
      {
        id: "natural",
        type: "fill",
        source: "protomaps",
        "source-layer": "natural",
        paint: { "fill-color": c.natural, "fill-opacity": 0.7 },
      },
      {
        id: "landuse",
        type: "fill",
        source: "protomaps",
        "source-layer": "landuse",
        filter: ["==", "pmap:kind", "park"],
        paint: { "fill-color": c.landuse, "fill-opacity": 0.5 },
      },
      {
        id: "water",
        type: "fill",
        source: "protomaps",
        "source-layer": "water",
        paint: { "fill-color": c.water },
      },
      {
        id: "waterway",
        type: "line",
        source: "protomaps",
        "source-layer": "waterway",
        minzoom: 8,
        paint: { "line-color": c.water, "line-width": 0.8 },
      },
      {
        id: "roads-minor",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        minzoom: 10,
        filter: [
          "none",
          ["==", "pmap:kind", "highway"],
          ["==", "pmap:kind", "major_road"],
        ],
        paint: {
          "line-color": c.roadMinor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.4, 15, 2],
        },
      },
      {
        id: "roads-major",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: [
          "any",
          ["==", "pmap:kind", "highway"],
          ["==", "pmap:kind", "major_road"],
        ],
        paint: {
          "line-color": c.roadMajor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.6, 12, 4],
        },
      },
      {
        id: "boundaries-region",
        type: "line",
        source: "protomaps",
        "source-layer": "boundaries",
        minzoom: 4,
        filter: ["==", "pmap:kind", "region"],
        paint: {
          "line-color": c.boundaryRg,
          "line-width": 0.7,
          "line-opacity": 0.6,
        },
      },
      {
        id: "boundaries-country",
        type: "line",
        source: "protomaps",
        "source-layer": "boundaries",
        filter: ["==", "pmap:kind", "country"],
        paint: {
          "line-color": c.boundary,
          "line-width": 1.5,
        },
      },
    ],
  } as unknown as StyleSpecification;
}

interface MapViewProps {
  lat: number | null;
  lon: number | null;
  dark: boolean;
  onTileError?: (msg: string) => void;
}

export default function MapView({ lat, lon, dark, onTileError }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [tileError, setTileError] = useState<string | null>(null);

  // Initialize map once — read stored theme to avoid a dark/light flash
  useEffect(() => {
    if (!containerRef.current) return;
    ensureProtocol();

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(readStoredDark()),
      center: BRAZIL_CENTER,
      zoom: BRAZIL_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("error", (e) => {
      const msg: string =
        e?.error?.message ??
        (typeof e?.error === "string" ? e.error : "Map tile error");
      const isTileError =
        msg.includes("404") ||
        msg.includes("Bad response") ||
        msg.includes("pmtiles");
      if (isTileError) {
        const friendly =
          `Tile file not found (${PMTILES_RAW}). ` +
          `Place a Brazil PMTiles file at apps/hermes-gps/public/brazil.pmtiles ` +
          `or set NEXT_PUBLIC_PMTILES_URL in .env.local.`;
        setTileError(friendly);
        onTileError?.(friendly);
      }
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync map style with theme — MapLibre markers are HTML overlays and survive setStyle
  useEffect(() => {
    mapRef.current?.setStyle(buildStyle(dark));
  }, [dark]);

  // Place / move station marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat === null || lon === null) return;

    const lngLat: [number, number] = [lon, lat];

    const place = () => {
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
    };

    map.isStyleLoaded() ? place() : map.once("load", place);
  }, [lat, lon]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {tileError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-6">
          <div className="max-w-sm rounded-xl bg-white dark:bg-gray-900 shadow-xl px-6 py-5 text-sm space-y-3">
            <p className="font-semibold text-red-600 dark:text-red-400">Map tiles unavailable</p>
            <p className="text-gray-600 dark:text-gray-300 font-mono text-xs leading-relaxed break-all">
              {tileError}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Run{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                npm run download-tiles
              </code>{" "}
              from <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">apps/hermes-gps/</code> to download the tile file.
              It will be saved automatically and skipped on future runs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
