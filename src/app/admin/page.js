"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  ChevronDown, 
  Phone, 
  FilePlus2, 
  Truck, 
  CheckCircle2, 
  MoreVertical,
  Plus,
  UserCheck,
  MapPin,
  FileBarChart2,
  Radio,
  Battery,
  Zap,
  Activity,
  Compass,
  AlertCircle
} from "lucide-react";

export default function AdminDashboard() {
  const [gpsData, setGpsData] = useState([]);
  const [loadingGps, setLoadingGps] = useState(true);
  const [gpsError, setGpsError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Fetch real-time GPS telemetry from our Next.js API proxy route
  const fetchGpsData = async () => {
    try {
      const res = await fetch("/api/gps");
      const json = await res.json();
      if (json.success && json.data?.object) {
        setGpsData(json.data.object);
        setGpsError(null);
        if (json.data.object.length > 0 && !selectedVehicle) {
          setSelectedVehicle(json.data.object[0]);
        }
      } else {
        setGpsError("Could not sync with Millitrack server.");
      }
    } catch (err) {
      console.error("Fetch GPS Error:", err);
      setGpsError("Network error. GPS sync failed.");
    } finally {
      setLoadingGps(false);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    }
  };

  useEffect(() => {
    fetchGpsData();
    // Poll the Millitrack API every 15 seconds (conforming to 10s rate limit)
    const interval = setInterval(fetchGpsData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate derived values from live API
  const activeRescuesCount = gpsData.filter(v => v.attributes?.ignition === true).length || 18; // fallback to 18 if offline
  const totalGpsDistanceToday = gpsData.reduce((sum, v) => sum + (v.attributes?.todayDistance || 0), 0) / 1000; // in km

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "HIGH": return "bg-red-50 text-red-650 border border-red-100";
      case "MEDIUM": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "LOW": return "bg-gray-50 text-gray-500 border border-gray-150";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Assigned": return "bg-blue-50 text-blue-600 border border-blue-100";
      case "En Route": return "bg-orange-50 text-orange-600 border border-orange-100";
      case "Reached Location": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Animal Picked": return "bg-amber-50 text-amber-700 border border-amber-150";
      case "Hospital Reached": return "bg-purple-50 text-purple-600 border border-purple-100";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-[#1e293b]">
      
      {/* Top filter controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-400">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>Millitrack GPS Live Feed: {loadingGps ? "Connecting..." : `Synced at ${lastUpdated} IST`}</span>
        </div>
        
        {/* Date picker dropdown */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white text-[12.5px] font-bold text-gray-600 cursor-pointer hover:border-gray-300 shadow-2xs">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>02 Jun, 2026 - 02 Jun, 2026</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* ===== 4 KPI CARDS ROW ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Total Calls Today */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12.5px] font-semibold text-gray-400">Total Calls Today</span>
            <span className="text-[28px] font-extrabold text-gray-900 leading-tight mt-1">28</span>
            <span className="text-[11.5px] text-blue-600 font-bold mt-1.5 flex items-center gap-0.5">
              +12% <span className="text-gray-400 font-normal">from yesterday</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Phone className="w-5.5 h-5.5 text-blue-500" />
          </div>
        </div>

        {/* 2. New Requests */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12.5px] font-semibold text-gray-400">New Requests</span>
            <span className="text-[28px] font-extrabold text-gray-900 leading-tight mt-1">12</span>
            <span className="text-[11.5px] text-emerald-600 font-bold mt-1.5 flex items-center gap-0.5">
              +8% <span className="text-gray-400 font-normal">from yesterday</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FilePlus2 className="w-5.5 h-5.5 text-emerald-500" />
          </div>
        </div>

        {/* 3. Active Rescues */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12.5px] font-semibold text-gray-400">Active Rescues</span>
            <span className="text-[28px] font-extrabold text-gray-900 leading-tight mt-1">
              {activeRescuesCount}
            </span>
            <span className="text-[11.5px] text-amber-500 font-bold mt-1.5 flex items-center gap-0.5">
              +15% <span className="text-gray-400 font-normal">from yesterday</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Truck className="w-5.5 h-5.5 text-amber-500" />
          </div>
        </div>

        {/* 4. Completed Cases */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12.5px] font-semibold text-gray-400">Completed Cases</span>
            <span className="text-[28px] font-extrabold text-gray-900 leading-tight mt-1">35</span>
            <span className="text-[11.5px] text-purple-600 font-bold mt-1.5 flex items-center gap-0.5">
              +20% <span className="text-gray-400 font-normal">from yesterday</span>
            </span>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5.5 h-5.5 text-purple-500" />
          </div>
        </div>

      </div>

      {/* ===== CHARTS ROW (Overview, Donut, Actions) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Rescue Overview Line Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14.5px] font-bold text-gray-900">Rescue Overview</h3>
            
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-500">New Requests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-gray-500">Active Rescues</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-gray-500">Completed</span>
              </div>
            </div>
          </div>

          {/* Clean Custom SVG Line Chart */}
          <div className="relative w-full h-56 flex flex-col justify-end pt-4">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03] pointer-events-none pb-8">
              <div className="w-full border-t border-gray-900" />
              <div className="w-full border-t border-gray-900" />
              <div className="w-full border-t border-gray-900" />
              <div className="w-full border-t border-gray-900" />
            </div>

            <svg className="w-full h-40 overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
              {/* Grid Horizontal axis markers */}
              <line x1="0" y1="180" x2="600" y2="180" stroke="#f1f5f9" strokeWidth="2" />
              
              {/* Dataset 1: New Requests (Blue) */}
              <path 
                d="M 0 100 L 100 110 L 200 90 L 300 80 L 400 110 L 500 90 L 600 70" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              {/* Dataset 2: Active Rescues (Green) */}
              <path 
                d="M 0 145 L 100 145 L 200 130 L 300 138 L 400 130 L 500 115 L 600 100" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              {/* Dataset 3: Completed (Purple) */}
              <path 
                d="M 0 160 L 100 168 L 200 155 L 300 162 L 400 152 L 500 140 L 600 128" 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Data points dots */}
              {[
                { x: 0, y: 100, color: "#3b82f6" }, { x: 100, y: 110, color: "#3b82f6" }, { x: 200, y: 90, color: "#3b82f6" }, { x: 300, y: 80, color: "#3b82f6" }, { x: 400, y: 110, color: "#3b82f6" }, { x: 500, y: 90, color: "#3b82f6" }, { x: 600, y: 70, color: "#3b82f6" },
                { x: 0, y: 145, color: "#10b981" }, { x: 100, y: 145, color: "#10b981" }, { x: 200, y: 130, color: "#10b981" }, { x: 300, y: 138, color: "#10b981" }, { x: 400, y: 130, color: "#10b981" }, { x: 500, y: 115, color: "#10b981" }, { x: 600, y: 100, color: "#10b981" },
                { x: 0, y: 160, color: "#a855f7" }, { x: 100, y: 168, color: "#a855f7" }, { x: 200, y: 155, color: "#a855f7" }, { x: 300, y: 162, color: "#a855f7" }, { x: 400, y: 152, color: "#a855f7" }, { x: 500, y: 140, color: "#a855f7" }, { x: 600, y: 128, color: "#a855f7" }
              ].map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill={p.color} stroke="#ffffff" strokeWidth="1.5" />
              ))}
            </svg>

            {/* X Axis Dates */}
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mt-2.5 pt-2.5 border-t border-gray-100">
              <span>27 May</span>
              <span>28 May</span>
              <span>29 May</span>
              <span>30 May</span>
              <span>31 May</span>
              <span>01 Jun</span>
              <span>02 Jun</span>
            </div>
          </div>
        </div>

        {/* Active Rescues by Status Donut Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <h3 className="text-[14.5px] font-bold text-gray-900 mb-2">Active Rescues by Status</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center gap-5 my-auto">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="11" />
                
                {/* En Route (33.33% - blue) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="11" strokeDasharray="79.5 238.76" strokeDashoffset="0" />
                {/* Reached Location (27.78% - green) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="11" strokeDasharray="66.3 238.76" strokeDashoffset="-79.5" />
                {/* Animal Picked (22.22% - orange) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f97316" strokeWidth="11" strokeDasharray="53 238.76" strokeDashoffset="-145.8" />
                {/* Hospital Reached (16.67% - purple) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="11" strokeDasharray="39.8 238.76" strokeDashoffset="-198.8" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none">18</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 leading-none">Total</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex flex-col gap-1.5 w-full text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-gray-500 font-semibold">En Route</span>
                </div>
                <span className="font-bold text-gray-800">6 <span className="text-gray-400 font-normal">(33.33%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-gray-500 font-semibold">Reached Location</span>
                </div>
                <span className="font-bold text-gray-800">5 <span className="text-gray-400 font-normal">(27.78%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className="text-gray-500 font-semibold">Animal Picked</span>
                </div>
                <span className="font-bold text-gray-800">4 <span className="text-gray-400 font-normal">(22.22%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-gray-500 font-semibold">Hospital Reached</span>
                </div>
                <span className="font-bold text-gray-800">3 <span className="text-gray-400 font-normal">(16.67%)</span></span>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col">
          <h3 className="text-[14.5px] font-bold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="flex flex-col gap-3 flex-1 justify-center">
            <button className="w-full py-3.5 px-4 bg-white border border-gray-200 hover:border-gray-300 rounded-xl flex items-center justify-between text-[12.5px] font-bold text-gray-700 transition active:scale-[0.98] cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-500" />
                </div>
                <span>Add New Rescue Case</span>
              </div>
            </button>

            <button className="w-full py-3.5 px-4 bg-white border border-gray-200 hover:border-gray-300 rounded-xl flex items-center justify-between text-[12.5px] font-bold text-gray-700 transition active:scale-[0.98] cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <span>Assign Driver</span>
              </div>
            </button>

            <button 
              onClick={() => setShowLiveTracking(!showLiveTracking)}
              className={`w-full py-3.5 px-4 border rounded-xl flex items-center justify-between text-[12.5px] font-bold transition active:scale-[0.98] cursor-pointer ${
                showLiveTracking 
                  ? "bg-orange-500 text-white border-orange-500" 
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${showLiveTracking ? "bg-white/20" : "bg-orange-50"}`}>
                  <MapPin className={`w-4 h-4 ${showLiveTracking ? "text-white" : "text-orange-500"}`} />
                </div>
                <span>Live Tracking Feed</span>
              </div>
            </button>

            <button className="w-full py-3.5 px-4 bg-white border border-gray-200 hover:border-gray-300 rounded-xl flex items-center justify-between text-[12.5px] font-bold text-gray-700 transition active:scale-[0.98] cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileBarChart2 className="w-4 h-4 text-purple-500" />
                </div>
                <span>View Reports</span>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* ===== LIVE GPS TELEMETRY FROM MILLITRACK API (Synced dynamically!) ===== */}
      {showLiveTracking && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg text-white flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-orange-500 animate-pulse" />
              <div>
                <h3 className="text-[14.5px] font-bold">Millitrack API Telemetry Link</h3>
                <span className="text-[11px] text-zinc-400 mt-[2px] block">Live coordinates from the active hardware tracking devices.</span>
              </div>
            </div>
            <button 
              onClick={() => setShowLiveTracking(false)}
              className="text-zinc-500 hover:text-white text-[11px] font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* GPS Devices List */}
            <div className="lg:col-span-5 flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-none border-r border-slate-800 pr-4">
              {loadingGps ? (
                <span className="text-zinc-400 text-xs py-4">Syncing with Millitrack...</span>
              ) : gpsError ? (
                <span className="text-rose-400 text-xs py-4">{gpsError}</span>
              ) : (
                gpsData.map((v, i) => {
                  const isSelected = selectedVehicle?.deviceUniqueId === v.deviceUniqueId;
                  return (
                    <div 
                      key={i}
                      onClick={() => setSelectedVehicle(v)}
                      className={`p-3 rounded-xl cursor-pointer flex items-center justify-between border transition-all ${
                        isSelected 
                          ? "bg-orange-500/10 border-orange-500 text-white" 
                          : "bg-slate-950 border-slate-800 text-zinc-450 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold">{v.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono mt-1">IMEI: {v.deviceUniqueId}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wide uppercase ${
                        v.attributes?.ignition ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {v.attributes?.ignition ? "IGN ON" : "IGN OFF"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected device details */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/80 p-5 rounded-xl border border-slate-800">
              {selectedVehicle ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-[13.5px] font-bold text-white">{selectedVehicle.name}</span>
                    <span className="text-[11px] text-zinc-450">{selectedVehicle.companyName}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[12px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Device Lat / Lng</span>
                      <span className="font-mono text-zinc-200 mt-1 font-semibold">
                        {selectedVehicle.latitude?.toFixed(6)}, {selectedVehicle.longitude?.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Speedometer</span>
                      <span className="font-bold text-orange-400 mt-1">{selectedVehicle.speed || 0.0} km/h</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5" /> Tracker Charge
                      </span>
                      <span className="font-bold text-zinc-200 mt-1">{selectedVehicle.attributes?.batteryLevel || 100}%</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Distance Today</span>
                      <span className="font-bold text-zinc-250 mt-1">{(selectedVehicle.attributes?.todayDistance || 0).toLocaleString()} m</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Mileage</span>
                      <span className="font-bold text-zinc-250 mt-1">{((selectedVehicle.attributes?.totalDistance || 0) / 1000).toFixed(2)} km</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> External Battery
                      </span>
                      <span className="font-bold text-zinc-200 mt-1">{selectedVehicle.attributes?.power || 0}V</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Last Update: {new Date(selectedVehicle.timestamp).toLocaleString("en-IN")}</span>
                    <a 
                      href={`https://maps.google.com/?q=${selectedVehicle.latitude},${selectedVehicle.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      Open in Maps
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-500 text-xs">Select a vehicle from the list to view telemetry logs.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ===== BOTTOM TABLES & RANKS ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Latest Rescue Requests Table (EXACT layout and data from screenshot!) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col w-full">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-[14.5px] font-bold text-gray-900">Latest Rescue Requests</h3>
            <button className="text-[12.5px] font-bold text-blue-600 hover:underline bg-transparent border-none cursor-pointer">
              View All Cases
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="pb-3 px-3">Case ID</th>
                  <th className="pb-3 px-3">Caller Name</th>
                  <th className="pb-3 px-3">Animal Type</th>
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Assigned Driver</th>
                  <th className="pb-3 px-3 text-right">Time</th>
                  <th className="pb-3 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[12.5px] text-gray-700">
                {/* 1. Ramesh Sharma */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-gray-900">CASE-260602-001</td>
                  <td className="py-4 px-3 text-gray-600">Ramesh Sharma</td>
                  <td className="py-4 px-3 font-medium text-gray-800 flex items-center gap-1.5">
                    {/* Cow emoji icon representation */}
                    <span className="text-[15px]">🐄</span> Cow
                  </td>
                  <td className="py-4 px-3 text-gray-500">Sector 45, Noida</td>
                  <td className="py-4 px-3">
                    <span className={`inline-block px-2.5 py-[3px] rounded-md text-[10.5px] font-bold tracking-wide ${getStatusStyle("Assigned")}`}>
                      Assigned
                    </span>
                  </td>
                  <td className="py-4 px-3 text-gray-800 font-medium">Raj Kumar</td>
                  <td className="py-4 px-3 text-right text-gray-450 font-medium">10:30 AM</td>
                  <td className="py-4 px-2 text-gray-450 hover:text-gray-700 cursor-pointer text-center">
                    <MoreVertical className="w-4 h-4 inline" />
                  </td>
                </tr>

                {/* 2. Sita Devi */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-gray-900">CASE-260602-002</td>
                  <td className="py-4 px-3 text-gray-600">Sita Devi</td>
                  <td className="py-4 px-3 font-medium text-gray-800 flex items-center gap-1.5">
                    <span className="text-[15px]">🐃</span> Buffalo
                  </td>
                  <td className="py-4 px-3 text-gray-500">Chipyana, Noida</td>
                  <td className="py-4 px-3">
                    <span className={`inline-block px-2.5 py-[3px] rounded-md text-[10.5px] font-bold tracking-wide ${getStatusStyle("En Route")}`}>
                      En Route
                    </span>
                  </td>
                  <td className="py-4 px-3 text-gray-800 font-medium">Manoj Yadav</td>
                  <td className="py-4 px-3 text-right text-gray-450 font-medium">10:15 AM</td>
                  <td className="py-4 px-2 text-gray-450 hover:text-gray-700 cursor-pointer text-center">
                    <MoreVertical className="w-4 h-4 inline" />
                  </td>
                </tr>

                {/* 3. Amit Verma */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-gray-900">CASE-260602-003</td>
                  <td className="py-4 px-3 text-gray-600">Amit Verma</td>
                  <td className="py-4 px-3 font-medium text-gray-800 flex items-center gap-1.5">
                    <span className="text-[15px]">🐄</span> Cow
                  </td>
                  <td className="py-4 px-3 text-gray-500">Village Dadri</td>
                  <td className="py-4 px-3">
                    <span className={`inline-block px-2.5 py-[3px] rounded-md text-[10.5px] font-bold tracking-wide ${getStatusStyle("Reached Location")}`}>
                      Reached Location
                    </span>
                  </td>
                  <td className="py-4 px-3 text-gray-800 font-medium">Pawan Singh</td>
                  <td className="py-4 px-3 text-right text-gray-450 font-medium">09:45 AM</td>
                  <td className="py-4 px-2 text-gray-450 hover:text-gray-700 cursor-pointer text-center">
                    <MoreVertical className="w-4 h-4 inline" />
                  </td>
                </tr>

                {/* 4. Vikash Chaudhary */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-gray-900">CASE-260602-004</td>
                  <td className="py-4 px-3 text-gray-600">Vikash Chaudhary</td>
                  <td className="py-4 px-3 font-medium text-gray-800 flex items-center gap-1.5">
                    <span className="text-[15px]">🐕</span> Dog
                  </td>
                  <td className="py-4 px-3 text-gray-500">Knowledge Park, Noida</td>
                  <td className="py-4 px-3">
                    <span className={`inline-block px-2.5 py-[3px] rounded-md text-[10.5px] font-bold tracking-wide ${getStatusStyle("Animal Picked")}`}>
                      Animal Picked
                    </span>
                  </td>
                  <td className="py-4 px-3 text-gray-800 font-medium">Raj Kumar</td>
                  <td className="py-4 px-3 text-right text-gray-450 font-medium">09:20 AM</td>
                  <td className="py-4 px-2 text-gray-450 hover:text-gray-700 cursor-pointer text-center">
                    <MoreVertical className="w-4 h-4 inline" />
                  </td>
                </tr>

                {/* 5. Neha Gupta */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-gray-900">CASE-260602-005</td>
                  <td className="py-4 px-3 text-gray-600">Neha Gupta</td>
                  <td className="py-4 px-3 font-medium text-gray-800 flex items-center gap-1.5">
                    <span className="text-[15px]">🐄</span> Cow
                  </td>
                  <td className="py-4 px-3 text-gray-500">Greater Noida</td>
                  <td className="py-4 px-3">
                    <span className={`inline-block px-2.5 py-[3px] rounded-md text-[10.5px] font-bold tracking-wide ${getStatusStyle("Hospital Reached")}`}>
                      Hospital Reached
                    </span>
                  </td>
                  <td className="py-4 px-3 text-gray-800 font-medium">Manoj Yadav</td>
                  <td className="py-4 px-3 text-right text-gray-450 font-medium">09:10 AM</td>
                  <td className="py-4 px-2 text-gray-450 hover:text-gray-700 cursor-pointer text-center">
                    <MoreVertical className="w-4 h-4 inline" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Drivers ranking list (EXACT layout and names from screenshot!) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2.5">
              <h3 className="text-[14.5px] font-bold text-gray-900">Top Drivers</h3>
              <button className="text-[11.5px] font-bold text-blue-650 hover:underline bg-transparent border-none cursor-pointer">
                View All
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-3">
              {[
                { rank: 1, name: "Raj Kumar", rescues: 12 },
                { rank: 2, name: "Manoj Yadav", rescues: 9 },
                { rank: 3, name: "Pawan Singh", rescues: 8 },
                { rank: 4, name: "Suresh Pal", rescues: 6 },
                { rank: 5, name: "Deepak Tyagi", rescues: 5 }
              ].map((driver) => (
                <div key={driver.rank} className="flex items-center justify-between text-[12.5px] border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {/* Rank label */}
                    <span className="w-6 h-6 bg-slate-50 border border-gray-200/60 rounded flex items-center justify-center text-[11px] font-bold text-gray-550 flex-shrink-0">
                      {driver.rank}
                    </span>
                    {/* Circle Avatar matching prototype */}
                    <div className="w-8.5 h-8.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                      {driver.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-bold text-gray-800">{driver.name}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-bold">{driver.rescues} Rescues</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between text-[11.5px] text-blue-800 font-semibold mt-4">
            <span>Total GPS Distance Logged:</span>
            <span>{totalGpsDistanceToday.toFixed(2)} km</span>
          </div>
        </div>

      </div>

    </div>
  );
}
