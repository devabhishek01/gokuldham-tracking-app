"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Radio, Battery, Compass, CheckCircle } from "lucide-react";
import { enrichGpsVehicle, DRIVERS_LIST } from "@/lib/gpsUtils";

export default function DriverStatusPage() {
  const [gpsData, setGpsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchGps = async () => {
      try {
        const res = await fetch("/api/gps?t=" + Date.now());
        const json = await res.json();
        if (json.success && json.data?.object) {
          setGpsData(json.data.object);
        }
      } catch (err) {
        console.error("GPS Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGps();
    const interval = setInterval(fetchGps, 4000);
    return () => clearInterval(interval);
  }, []);

  const enrichedDrivers = gpsData.map(v => enrichGpsVehicle(v)).filter(Boolean);

  const filteredDrivers = enrichedDrivers.filter(d =>
    d.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.num && `Ambulance ${d.num}`.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-3xs flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-[15px] font-black text-gray-800 leading-tight">Driver & Ambulance Live Roster</h3>
          <p className="text-[11.5px] text-gray-400 mt-1">Real-time status tracking from the live GPS tracker networks.</p>
        </div>
        <div className="relative w-full sm:w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Driver / Vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9.5 pl-9.5 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          return (
            <div key={driver.deviceUniqueId} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-250 transition flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-[12px]">
                    A{driver.num}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-slate-800 leading-tight">Ambulance {String(driver.num).padStart(2, '0')}</span>
                    <span className="text-[10px] text-gray-400 font-bold tracking-wide mt-1">{driver.plate}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-[9.5px] font-black uppercase rounded-full inline-flex items-center gap-1 ${driver.status === "RUNNING"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : driver.status === "IDLE"
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${driver.status === "RUNNING"
                      ? "bg-emerald-500 animate-pulse"
                      : driver.status === "IDLE"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-rose-500"
                    }`} />
                  {driver.status}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-[12px] border-t border-b border-slate-50 py-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase text-[9.5px]">Driver Name</span>
                  <span className="font-bold text-slate-700">{driver.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase text-[9.5px]">Live Location</span>
                  <span className="font-bold text-slate-700 text-right truncate max-w-[180px]" title={driver.address}>
                    {driver.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase text-[9.5px]">Today's Speed</span>
                  <span className="font-bold text-slate-700">{driver.speedDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase text-[9.5px]">Distance Travelled</span>
                  <span className="font-bold text-slate-700">{driver.todayDistDisplay}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                  <Battery className="w-4 h-4 text-emerald-500" /> {driver.batteryDisplay}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                  <Radio className="w-4 h-4 text-sky-500" /> {driver.lastUpdate}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
