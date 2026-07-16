"use client";

import React, { useState, useEffect, useRef } from "react";
import { Compass, MapPin, Navigation, Map as MapIcon, ChevronRight } from "lucide-react";

export default function NavigationPage() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [driverName, setDriverName] = useState("Raj Kumar");
  const [coords, setCoords] = useState([28.58293, 76.67598]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDriver = localStorage.getItem("currentDriverName");
      if (savedDriver) {
        setDriverName(savedDriver);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const res = await fetch("/api/gps?t=" + Date.now());
        const json = await res.json();
        if (json.success && json.data?.object) {
          const { enrichGpsVehicle } = await import("@/lib/gpsUtils");
          const allEnriched = json.data.object.map(o => enrichGpsVehicle(o)).filter(Boolean);
          const vehicle = allEnriched.find(v => v.driverName === driverName);
          if (vehicle && vehicle.latitude && vehicle.longitude) {
            setCoords([vehicle.latitude, vehicle.longitude]);
          }
        }
      } catch (err) {
        console.error("Coords Fetch Error:", err);
      }
    };
    fetchCoords();
  }, [driverName]);

  // Initialize Map
  useEffect(() => {
    if (!isClient) return;

    const initMap = async () => {
      if (typeof window === "undefined") return;

      // Add Leaflet CSS dynamically if not present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const L = (await import("leaflet")).default;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(coords, 13);
        return;
      }

      // Center around current driver location
      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        attribution: "Google Maps",
      }).addTo(map);

      // Current location marker
      L.marker(coords).addTo(map).bindPopup(`${driverName} (You)`).openPopup();

      // Target case location pin (a little offset for demo visualization)
      L.marker([coords[0] + 0.015, coords[1] + 0.015]).addTo(map).bindPopup("Rescue Case Spot");

      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, coords, driverName]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-[calc(100vh-210px)] min-h-[450px]">
      {/* Route Instructions */}
      <div className="w-full lg:w-[320px] bg-white border border-orange-100 p-6 rounded-2xl shadow-3xs flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="text-[14px] font-black text-gray-800 leading-none">Turn-by-Turn Navigation</h3>
        </div>

        <div className="flex flex-col gap-3.5 mt-2">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-500 flex-shrink-0">1</div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-bold text-slate-700">Head North-East on Rohtak Road</span>
              <span className="text-[10px] text-gray-400 mt-0.5">2.5 km • Next in 5 mins</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-500 flex-shrink-0">2</div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-bold text-slate-700">Take left exit towards Bahadurgarh</span>
              <span className="text-[10px] text-gray-400 mt-0.5">1.2 km</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-500 flex-shrink-0">3</div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-bold text-slate-700">Keep right towards Sector 45, Noida</span>
              <span className="text-[10px] text-gray-400 mt-0.5">14.6 km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-3xs relative min-h-[300px]">
        <div ref={mapContainerRef} className="w-full h-full min-h-[300px] z-10" />
      </div>
    </div>
  );
}
