"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Truck, Battery, Radio, Zap, Clock, Key, RefreshCw, 
  Compass, AlertCircle, CheckCircle, Navigation, Plus, Sliders, 
  ChevronLeft, ChevronRight, Eye, Edit3, MoreVertical
} from "lucide-react";
import { DRIVERS_LIST, enrichGpsVehicle } from "@/lib/gpsUtils";

// Inline SVG representing a premium side-view profile of an ambulance van
const AmbulanceVanIcon = () => (
  <svg viewBox="0 0 64 36" className="w-12 h-8 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10h40v20H4z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M44 14h11l3 5v11H44z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M4 20h51v2.5H4z" fill="#00875A" />
    <path d="M46 16h5.5v3H46z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.2" />
    <path d="M30 13h8v4.5h-8z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.2" />
    <path d="M20 8h4v2h-4z" fill="#ef4444" />
    <circle cx="14" cy="30" r="4.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.2" />
    <circle cx="14" cy="30" r="1.5" fill="#ffffff" />
    <circle cx="48" cy="30" r="4.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.2" />
    <circle cx="48" cy="30" r="1.5" fill="#ffffff" />
    <path d="M12 14v4M10 16h4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Map dynamic initial list of 40 vehicles, ensuring each gets assigned a driver
const initialAmbulancesRegistry = Array.from({ length: 40 }, (_, idx) => {
  const num = idx + 1;
  const drv = DRIVERS_LIST[(num - 1) % DRIVERS_LIST.length];
  return {
    id: `AMB-${String(num).padStart(3, "0")}`,
    vehicleName: `Ambulance ${String(num).padStart(2, "0")}`,
    registration: `HR-55-${1000 + num}`,
    typeName: num % 3 === 0 ? "Tata Winger" : num % 3 === 1 ? "Force Traveller" : "Maruti Eeco",
    typeDesc: "Rescue Van",
    driverName: drv.name,
    driverPhone: drv.phone,
    status: "Active",
    battery: 100,
    ignition: false,
    coordinates: "Calculating...",
    gpsImei: ""
  };
});

export default function AmbulancesPage() {
  const [ambulances, setAmbulances] = useState(initialAmbulancesRegistry);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [driverFilter, setDriverFilter] = useState("All Drivers");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [lastUpdated, setLastUpdated] = useState("");

  const fetchAmbulanceData = async () => {
    try {
      const res = await fetch("/api/gps?t=" + Date.now());
      const json = await res.json();
      if (json.success && json.data?.object) {
        // Build a map of driverName -> enriched GPS data
        const gpsVehicles = json.data.object.map(v => enrichGpsVehicle(v)).filter(Boolean);
        const driverGpsMap = {};
        gpsVehicles.forEach(v => {
          driverGpsMap[v.driverName] = v;
        });

        // Map GPS data properties onto our list dynamically
        const updated = initialAmbulancesRegistry.map((amb) => {
          const gpsMatch = driverGpsMap[amb.driverName];
          
          if (gpsMatch) {
            return {
              ...amb,
              registration: gpsMatch.plate,
              status: "Active",
              gpsImei: gpsMatch.deviceUniqueId,
              battery: gpsMatch.batteryPct,
              ignition: gpsMatch.isIgnitionOn,
              gpsPlate: gpsMatch.plate,
              coordinates: gpsMatch.latitude && gpsMatch.longitude 
                ? `${gpsMatch.latitude.toFixed(5)}, ${gpsMatch.longitude.toFixed(5)}` 
                : "Online",
            };
          }
          return amb;
        });

        setAmbulances(updated);
        setError(null);
      } else {
        setError("GPS service unavailable.");
      }
    } catch (err) {
      console.error(err);
      setError("Network sync error with GPS network.");
    } finally {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    }
  };

  useEffect(() => {
    fetchAmbulanceData();
    const interval = setInterval(fetchAmbulanceData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredAmbulances = ambulances.filter(a => {
    const matchesSearch = 
      a.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.typeName.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = 
      statusFilter === "All Status" ? true : a.status === statusFilter;
      
    const matchesType = 
      typeFilter === "All Types" ? true : a.typeDesc === typeFilter || a.typeName === typeFilter;
      
    const matchesDriver = 
      driverFilter === "All Drivers" ? true : a.driverName === driverFilter;
      
    return matchesSearch && matchesStatus && matchesType && matchesDriver;
  });

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setTypeFilter("All Types");
    setDriverFilter("All Drivers");
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalItems = filteredAmbulances.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedAmbulances = filteredAmbulances.slice(startIndex, startIndex + itemsPerPage);

  // Stats calculation
  const totalCount = ambulances.length;
  const activeCount = ambulances.filter(a => a.status === "Active").length;
  const maintenanceCount = ambulances.filter(a => a.status === "Maintenance").length;
  const inactiveCount = ambulances.filter(a => a.status === "Inactive").length;

  return (
    <div className="flex flex-col gap-6 w-full text-[#1e293b] relative">
      
      {/* Title & Breadcrumbs + Add Ambulance Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-black text-slate-900 tracking-tight">Ambulances</h1>
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mt-1">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-gray-600">Ambulances</span>
          </div>
        </div>
        <button className="bg-[#00875A] hover:bg-[#00704a] text-white px-4 py-2.5 rounded-lg text-[12px] font-extrabold flex items-center gap-2 shadow-2xs transition active:scale-[0.98] cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add New Ambulance</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Ambulances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875A] flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Total Ambulances</span>
            <span className="text-[25px] font-black text-slate-900 mt-0.5 leading-tight">{totalCount}</span>
            <span className="text-[10px] text-gray-455 font-semibold mt-1">All Registered</span>
          </div>
        </div>

        {/* Active Ambulances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Active Ambulances</span>
            <span className="text-[25px] font-black text-blue-600 mt-0.5 leading-tight">{activeCount}</span>
            <span className="text-[10px] text-gray-455 font-semibold mt-1">Currently in Service</span>
          </div>
        </div>

        {/* Under Maintenance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Under Maintenance</span>
            <span className="text-[25px] font-black text-amber-500 mt-0.5 leading-tight">{maintenanceCount}</span>
            <span className="text-[10px] text-gray-455 font-semibold mt-1">Not Available</span>
          </div>
        </div>

        {/* Inactive Ambulances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Inactive Ambulances</span>
            <span className="text-[25px] font-black text-purple-500 mt-0.5 leading-tight">{inactiveCount}</span>
            <span className="text-[10px] text-gray-455 font-semibold mt-1">Not in Use</span>
          </div>
        </div>
      </div>

      {/* Filter Options Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[280px]">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ambulance number or name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="h-10 pl-10 pr-4 bg-gray-50 border border-slate-200 rounded-xl text-[12px] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 transition-all w-full"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 bg-gray-50 border border-slate-200 rounded-xl text-[12px] font-bold text-gray-650 focus:outline-none focus:bg-white focus:border-gray-300 transition-all cursor-pointer min-w-[120px]"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="flex flex-col">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 bg-gray-50 border border-slate-200 rounded-xl text-[12px] font-bold text-gray-650 focus:outline-none focus:bg-white focus:border-gray-300 transition-all cursor-pointer min-w-[120px]"
            >
              <option value="All Types">All Types</option>
              <option value="Tata Winger">Tata Winger</option>
              <option value="Force Traveller">Force Traveller</option>
              <option value="Maruti Eeco">Maruti Eeco</option>
            </select>
          </div>

          {/* Driver Dropdown */}
          <div className="flex flex-col">
            <select
              value={driverFilter}
              onChange={(e) => { setDriverFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 bg-gray-50 border border-slate-200 rounded-xl text-[12px] font-bold text-gray-650 focus:outline-none focus:bg-white focus:border-gray-300 transition-all cursor-pointer min-w-[150px]"
            >
              <option value="All Drivers">All Drivers</option>
              {DRIVERS_LIST.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side Buttons group */}
        <div className="flex items-center gap-2">
          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-gray-650 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-3xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            <span>Reset</span>
          </button>

          {/* Additional Filter Button */}
          <button
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-gray-650 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-3xs cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-gray-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Ambulance Registry Table */}
      {loading && ambulances.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs font-semibold">Connecting ambulance registry...</div>
      ) : error ? (
        <div className="py-12 text-center text-rose-500 text-xs font-semibold">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto w-full bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-gray-450 bg-slate-50/50">
                  <th className="py-4 px-5">Ambulance Details</th>
                  <th className="py-4 px-5">Registration No.</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Assigned Driver</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[12.5px] text-slate-700 font-medium">
                {paginatedAmbulances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-semibold">No ambulance records found matching filters.</td>
                  </tr>
                ) : (
                  paginatedAmbulances.map(amb => {
                    const initials = amb.driverName !== "Not Assigned"
                      ? amb.driverName.split(" ").map(n => n[0]).join("")
                      : "";

                    return (
                      <tr key={amb.id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Ambulance Details */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <AmbulanceVanIcon />
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-900 leading-tight">{amb.vehicleName}</span>
                              <span className="text-[10px] text-gray-400 mt-[3px] font-semibold flex items-center gap-1.5">
                                <span>{amb.typeDesc}</span>
                                {amb.gpsImei && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 text-emerald-600 font-extrabold bg-emerald-50 px-1 py-0.25 rounded text-[9px]">
                                      <Battery className="w-2.5 h-2.5 inline" /> {amb.battery}%
                                    </span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Registration Number */}
                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{amb.registration}</span>
                            {amb.gpsImei && (
                              <span className="text-[9px] text-gray-400 mt-[3px] font-semibold tracking-wide">
                                IMEI: {amb.gpsImei}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-850 leading-tight">{amb.typeName}</span>
                            {amb.gpsImei ? (
                              <span className="text-[9.5px] text-blue-600 font-extrabold mt-[2px] tracking-tight">
                                {amb.coordinates}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 mt-[2px] font-semibold">{amb.typeDesc}</span>
                            )}
                          </div>
                        </td>

                        {/* Assigned Driver */}
                        <td className="py-3.5 px-5">
                          {amb.driverName === "Not Assigned" ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-rose-500 text-[12px]">Not Assigned</span>
                              <span className="text-[10px] text-gray-455 mt-[2px] font-semibold">-</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-600 shadow-3xs flex-shrink-0">
                                {initials}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-800 leading-tight">{amb.driverName}</span>
                                <span className="text-[10px] text-gray-455 mt-[3px] font-semibold">{amb.driverPhone}</span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-md text-[10px] font-bold border ${
                              amb.status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : amb.status === "Maintenance"
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                amb.status === "Active"
                                  ? "bg-emerald-500"
                                  : amb.status === "Maintenance"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              }`} />
                              {amb.status}
                            </span>
                            {amb.gpsImei && (
                              <span className="text-[9px] text-slate-500 font-extrabold flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                <span className={`w-1 h-1 rounded-full ${amb.ignition ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                ENG: {amb.ignition ? "IGNITION ON" : "IGNITION OFF"}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <a 
                              href={`/admin/live-tracking?selected=${encodeURIComponent(amb.gpsPlate || amb.registration)}`}
                              title="View Live Track"
                              className="w-7.5 h-7.5 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-gray-550 hover:bg-slate-50 hover:text-slate-800 shadow-3xs transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                            <button 
                              title="Edit Ambulance"
                              className="w-7.5 h-7.5 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-gray-550 hover:bg-slate-50 hover:text-slate-800 shadow-3xs transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              title="More Options"
                              className="w-7.5 h-7.5 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-gray-550 hover:bg-slate-50 hover:text-slate-800 shadow-3xs transition cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="h-[56px] border-t border-slate-100 px-6 flex items-center justify-between text-[11.5px] font-bold text-gray-400 bg-slate-50/20">
              <span>Showing {startIndex + 1} - {endIndex} of {totalItems} ambulances</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-slate-800 px-1">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
