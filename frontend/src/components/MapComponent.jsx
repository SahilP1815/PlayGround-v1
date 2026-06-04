"use client";

import { useEffect, useRef } from "react";

// Leaflet CSS must be imported inside the component to avoid SSR CSS conflicts
import "leaflet/dist/leaflet.css";

/**
 * MapComponent
 * ─────────────────────────────────────────────────────────────
 * • Search box   → Google Places Autocomplete (loaded via Script tag in layout)
 * • Map display  → Leaflet.js with OpenStreetMap tiles
 * • When a place is selected the map flies to it, drops a marker + popup,
 *   and fires onLocationSelect({ lat, lng, address }) so the parent form
 *   can store the coordinates.
 */
export default function MapComponent({ onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const searchInputRef  = useRef(null);
  const mapRef          = useRef(null);
  const markerRef       = useRef(null);

  // ─── 1. Initialise Leaflet map ────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Destroy any stale Leaflet instance stamped on the DOM node
      // (happens in React Strict Mode double-invoke or on Turbopack HMR)
      if (mapContainerRef.current._leaflet_id) {
        mapContainerRef.current._leaflet_id = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Fix broken default marker icons in Next.js / webpack
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629], // Centre of India
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      if (isMounted) mapRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ─── 2. Attach Google Places Autocomplete to the search input ─────────────
  useEffect(() => {
    if (!searchInputRef.current) return;

    // Poll until the Google Maps script has loaded (it's loaded via Script tag)
    const attachAutocomplete = () => {
      if (typeof window === "undefined") return;
      if (!window.google?.maps?.places) {
        // Retry every 200 ms until ready
        setTimeout(attachAutocomplete, 200);
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          // Return both specific places AND broad addresses
          types: ["establishment", "geocode"],
          // Bias results to India
          componentRestrictions: { country: "IN" },
          // Only request the fields we actually use
          fields: ["geometry", "name", "formatted_address"],
        }
      );

      autocomplete.addListener("place_changed", async () => {
        const place = autocomplete.getPlace();

        if (!place.geometry?.location) {
          // User pressed Enter without selecting a suggestion
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";

        // ── Drop / update the Leaflet marker ──
        const L = (await import("leaflet")).default;
        const map = mapRef.current;
        if (!map) return;

        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        // Smoothly fly to the selected location
        map.flyTo([lat, lng], 15, { duration: 1.2 });

        markerRef.current = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            `<div style="font-size:13px;font-weight:600;max-width:220px;line-height:1.5">
               <strong>${place.name || ""}</strong><br/>
               <span style="font-weight:400;color:#64748b">${address}</span>
             </div>`,
            { maxWidth: 240 }
          )
          .openPopup();

        // Notify parent form
        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address });
        }
      });
    };

    attachAutocomplete();
  }, [onLocationSelect]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Google Places Search Box ── */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            border: "1.5px solid var(--border, #e2e8f0)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {/* Search icon */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              color: "var(--text-muted, #94a3b8)",
              flexShrink: 0,
            }}
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for your ground's location…"
            style={{
              flex: 1,
              padding: "10px 10px",
              border: "none",
              outline: "none",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-primary, #1e293b)",
              background: "transparent",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* ── Leaflet Map ── */}
      <div
        ref={mapContainerRef}
        style={{
          height: 300,
          width: "100%",
          borderRadius: 10,
          overflow: "hidden",
          border: "1.5px solid var(--border, #e2e8f0)",
          // Keep map below the Places autocomplete dropdown (z-index 1000+)
          zIndex: 1,
        }}
      />
    </div>
  );
}
