"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Phone, CreditCard, ShieldCheck, Mail, Users, Compass, 
  AlertCircle, CheckCircle, RefreshCw, Plus, Sliders, 
  ChevronLeft, ChevronRight, Eye, Edit3, MoreVertical, Truck
} from "lucide-react";
import { DRIVERS_LIST, enrichGpsVehicle } from "@/lib/gpsUtils";

// Generate registry directly from the master telemetry list to eliminate static dummy data
const initialDriverRegistry = DRIVERS_LIST.map((drv, idx) => {
  const num = idx + 1;
  return {
    id: `DRV-${String(num).padStart(3, "0")}`,
    name: drv.name,
    email: `${drv.name.toLowerCase().replace(/\s+/g, "")}@resqtrack.org`,
    phone: drv.phone,
    license: `DL-${num}A-${1000 + num}`,
    vehicleName: `Ambulance ${String(num).padStart(2, "0")}`,
    plate: `HR-55-${1000 + num}`,
    status: "Active",
    availability: "Available",
    rescues: 10 + num * 5,
    avatar: `https://randomuser.me/api/portraits/men/${num}.jpg`
  };
});

export default function DriversPage() {
  const [drivers, setDrivers] = useState(initialDriverRegistry);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [ambulanceFilter, setAmbulanceFilter] = useState("All Ambulances");

  // Selection states
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [lastUpdated, setLastUpdated] = useState("");

  const fetchDriverData = async () => {
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

        // Map the vehicle objects dynamically to drivers roster
        const updated = initialDriverRegistry.map((driver) => {
          const gpsMatch = driverGpsMap[driver.name];
          
          if (gpsMatch) {
            return {
              ...driver,
              plate: gpsMatch.plate,
              vehicleName: `Ambulance ${String(gpsMatch.num).padStart(2, '0')}`,
              status: "Active",
              availability: gpsMatch.isIgnitionOn ? "On Duty" : "Available",
              speed: gpsMatch.speedKmh,
              todayDistance: gpsMatch.todayDistDisplay,
              gpsPlate: gpsMatch.plate,
            };
          }
          return driver;
        });

        setDrivers(updated);
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
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      d.license.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = 
      statusFilter === "All Status" ? true : d.status === statusFilter;
      
    const matchesAvailability = 
      availabilityFilter === "All" ? true : d.availability === availabilityFilter;
      
    const matchesAmbulance = 
      ambulanceFilter === "All Ambulances" ? true : d.vehicleName === ambulanceFilter;
      
    return matchesSearch && matchesStatus && matchesAvailability && matchesAmbulance;
  });

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setAvailabilityFilter("All");
    setAmbulanceFilter("All Ambulances");
    setCurrentPage(1);
    setSelectedDriverIds([]);
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDriverIds(paginatedDrivers.map(d => d.id));
    } else {
      setSelectedDriverIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedDriverIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Pagination calculation
  const totalItems = filteredDrivers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedDrivers = filteredDrivers.slice(startIndex, startIndex + itemsPerPage);

  // Stats calculation
  const totalDriversCount = drivers.length;
  const activeDriversCount = drivers.filter(d => d.status === "Active").length;
  const onDutyCount = drivers.filter(d => d.availability === "On Duty").length;
  const inactiveDriversCount = drivers.filter(d => d.status === "Inactive").length;

  return (
    <div className="flex flex-col gap-6 w-full text-[#1e293b] relative">
      
      {/* Title & Breadcrumbs + Add Driver Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-black text-slate-900 tracking-tight">Drivers</h1>
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mt-1">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-gray-600">Drivers</span>
          </div>
        </div>
        <button className="bg-[#00875A] hover:bg-[#00704a] text-white px-4 py-2.5 rounded-lg text-[12px] font-extrabold flex items-center gap-2 shadow-2xs transition active:scale-[0.98] cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add New Driver</span>
        </button>
      </div>

      {/* KPI Cards exactly matching the screenshot style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Drivers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00875A] flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Total Drivers</span>
            <span className="text-[25px] font-black text-slate-900 mt-0.5 leading-tight">{totalDriversCount}</span>
            <span className="text-[10px] text-gray-455 font-semibold mt-1">All Registered Drivers</span>
          </div>
        </div>

        {/* Active Drivers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Active Drivers</span>
            <span className="text-[25px] font-black text-blue-600 mt-0.5 leading-tight">{activeDriversCount}</span>
            <span className="text-[10px] text-gray-455 font-semibold mt-1">Currently Available</span>
          </div>
        </div>

        {/* On Duty */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">On Duty</span>
            <span className="text-[25px] font-black text-amber-500 mt-0.5 leading-tight">{onDutyCount}</span>
            <span className="text-[10px] text-gray-455 font-semibold mt-1">Currently on Rescue</span>
          </div>
        </div>

        {/* Inactive Drivers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Inactive Drivers</span>
            <span className="text-[25px] font-black text-purple-500 mt-0.5 leading-tight">{inactiveDriversCount}</span>
            <span className="text-[10px] text-gray-455 font-semibold mt-1">Not Available</span>
          </div>
        </div>

      </div>

      {/* Filter Options Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between flex-wrap gap-4">
        
        {/* Left Side Filters group */}
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[280px]">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or license..."
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
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Availability Dropdown */}
          <div className="flex flex-col">
            <select
              value={availabilityFilter}
              onChange={(e) => { setAvailabilityFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 bg-gray-50 border border-slate-200 rounded-xl text-[12px] font-bold text-gray-650 focus:outline-none focus:bg-white focus:border-gray-300 transition-all cursor-pointer min-w-[110px]"
            >
              <option value="All">All</option>
              <option value="On Duty">On Duty</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          {/* Ambulance Dropdown */}
          <div className="flex flex-col">
            <select
              value={ambulanceFilter}
              onChange={(e) => { setAmbulanceFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 bg-gray-50 border border-slate-200 rounded-xl text-[12px] font-bold text-gray-650 focus:outline-none focus:bg-white focus:border-gray-300 transition-all cursor-pointer min-w-[150px]"
            >
              <option value="All Ambulances">All Ambulances</option>
              <option value="Ambulance 01">Ambulance 01</option>
              <option value="Ambulance 02">Ambulance 02</option>
              <option value="Ambulance 03">Ambulance 03</option>
              <option value="Ambulance 04">Ambulance 04</option>
              <option value="Ambulance 05">Ambulance 05</option>
              <option value="Ambulance 06">Ambulance 06</option>
              <option value="Ambulance 07">Ambulance 07</option>
              <option value="Ambulance 08">Ambulance 08</option>
              <option value="Ambulance 09">Ambulance 09</option>
              <option value="Ambulance 10">Ambulance 10</option>
              <option value="Ambulance 11">Ambulance 11</option>
              <option value="Ambulance 12">Ambulance 12</option>
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

      {/* Driver Registry Table Container */}
      {loading && drivers.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs font-semibold">Connecting driver logs...</div>
      ) : error ? (
        <div className="py-12 text-center text-rose-500 text-xs font-semibold">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto w-full bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-gray-450 bg-slate-50/50">
                  <th className="py-4 px-5 w-[40px]">
                    <input 
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={paginatedDrivers.length > 0 && paginatedDrivers.every(d => selectedDriverIds.includes(d.id))}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-5">Driver Details</th>
                  <th className="py-4 px-5">Phone</th>
                  <th className="py-4 px-5">License No.</th>
                  <th className="py-4 px-5">Assigned Ambulance</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Availability</th>
                  <th className="py-4 px-5">Total Rescues</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[12.5px] text-slate-700 font-medium">
                {paginatedDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400 font-semibold">No driver records found matching filters.</td>
                  </tr>
                ) : (
                  paginatedDrivers.map(driver => (
                    <tr key={driver.id} className="hover:bg-slate-50/30 transition-colors">
                      
                      {/* Checkbox */}
                      <td className="py-3.5 px-5">
                        <input 
                          type="checkbox" 
                          checked={selectedDriverIds.includes(driver.id)}
                          onChange={() => handleSelectOne(driver.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Driver details (Men avatar + name + email) */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-150 flex-shrink-0 relative bg-slate-100 flex items-center justify-center shadow-3xs">
                            <img 
                              src={driver.avatar} 
                              alt={driver.name} 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900 leading-tight">{driver.name}</span>
                            <span className="text-[10px] text-gray-400 mt-[3px] font-semibold">{driver.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> 
                          {driver.phone}
                        </span>
                      </td>

                      {/* License */}
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-800 text-[11px]">
                        {driver.license}
                      </td>

                      {/* Assigned Ambulance */}
                      <td className="py-3.5 px-5">
                        {driver.vehicleName === "Unassigned" ? (
                          <span className="text-gray-400 font-medium italic">Unassigned</span>
                        ) : (
                          <div className="flex items-start gap-2.5">
                            <Truck className="w-4 h-4 text-slate-500 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-800 leading-tight text-[12px]">{driver.vehicleName}</span>
                              <span className="text-[10px] text-gray-400 mt-1 font-semibold">• {driver.plate}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span className={`inline-block px-2.5 py-[3px] rounded-md text-[9.5px] font-bold tracking-wide border ${
                          driver.status === "Active" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {driver.status}
                        </span>
                      </td>

                      {/* Availability */}
                      <td className="py-3.5 px-5">
                        <span className={`inline-block px-2.5 py-[3px] rounded-md text-[9.5px] font-bold tracking-wide border ${
                          driver.availability === "On Duty" 
                            ? "bg-emerald-55 text-[#00875A] border-emerald-150" 
                            : driver.availability === "Available"
                            ? "bg-blue-50/50 text-blue-600 border-blue-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}>
                          {driver.availability}
                        </span>
                      </td>

                      {/* Total Rescues */}
                      <td className="py-3.5 px-5 font-extrabold text-slate-900">
                        {driver.rescues}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a 
                            href={`/admin/live-tracking?selected=${encodeURIComponent(driver.gpsPlate || driver.plate)}`}
                            title="View Live Track"
                            className="w-7.5 h-7.5 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-gray-550 hover:bg-slate-50 hover:text-slate-800 shadow-3xs transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button 
                            title="Edit Driver"
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination footer exactly matching the screenshot style */}
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-white">
            <span className="text-[11.5px] font-bold text-gray-400">
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} entries
            </span>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="w-7.5 h-7.5 rounded-lg border border-slate-200 flex items-center justify-center text-gray-550 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7.5 h-7.5 rounded-lg text-[11.5px] font-extrabold transition cursor-pointer ${
                      currentPage === page
                        ? "bg-[#00875A] text-white shadow-3xs"
                        : "border border-slate-200 text-gray-650 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="w-7.5 h-7.5 rounded-lg border border-slate-200 flex items-center justify-center text-gray-550 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:hover:bg-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
