"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Calendar, MapPin, Truck, AlertOctagon, Heart, HelpCircle, X, CheckSquare, Clock } from "lucide-react";
import { enrichGpsVehicle } from "@/lib/gpsUtils";

const initialCases = [
  { id: "CASE-260602-001", caller: "Ramesh Sharma", animal: "Cow", condition: "Fractured hind leg", priority: "HIGH", location: "Sector 45, Noida", driver: "Raj Kumar", status: "Assigned", time: "10:30 AM" },
  { id: "CASE-260602-002", caller: "Sita Devi", animal: "Buffalo", condition: "Deep neck laceration", priority: "HIGH", location: "Chipyana, Noida", driver: "Karan Singh", status: "En Route", time: "10:15 AM" },
  { id: "CASE-260602-003", caller: "Amit Verma", animal: "Cow", condition: "Dehydration & weakness", priority: "LOW", location: "Village Dadri", driver: "Pawan Singh", status: "Reached Location", time: "09:45 AM" },
  { id: "CASE-260602-004", caller: "Vikash Chaudhary", animal: "Dog", condition: "Skin disease / Mange", priority: "MEDIUM", location: "Knowledge Park, Noida", driver: "Amit Verma", status: "Animal Picked", time: "09:20 AM" },
  { id: "CASE-260602-005", caller: "Neha Gupta", animal: "Cow", condition: "Broken wing", priority: "LOW", location: "Greater Noida", driver: "Jatin Sharma", status: "Hospital Reached", time: "09:10 AM" }
];

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gpsData, setGpsData] = useState([]);

  // Fetch real-time GPS telemetry and persistent cases
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch GPS
        const gpsRes = await fetch("/api/gps?t=" + Date.now());
        const gpsJson = await gpsRes.json();
        if (gpsJson.success && gpsJson.data?.object) {
          setGpsData(gpsJson.data.object);
        }

        // Fetch Cases
        const casesRes = await fetch("/api/cases?t=" + Date.now());
        const casesJson = await casesRes.json();
        if (casesJson.success && casesJson.data) {
          setCases(casesJson.data);
        }
      } catch (err) {
        console.error("Data Fetch Error on Cases Page:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Form states
  const [newCaller, setNewCaller] = useState("");
  const [newAnimal, setNewAnimal] = useState("Cow");
  const [newCondition, setNewCondition] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [newDriver, setNewDriver] = useState("Raj Kumar");

  // Build the live lookup map for driver -> vehicle data using shared utils
  const driverLiveMap = {};
  gpsData.forEach((v) => {
    const enriched = enrichGpsVehicle(v);
    if (enriched) {
      driverLiveMap[enriched.driverName] = {
        ...enriched,
        location: enriched.address,
        speedKmh: enriched.speedDisplay,
      };
    }
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "HIGH": return "bg-rose-50 text-rose-600 border border-rose-100";
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

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caller: newCaller,
          animal: newAnimal,
          condition: newCondition,
          location: newLocation,
          priority: newPriority,
          driver: newDriver
        })
      });
      const json = await response.json();
      if (json.success && json.data) {
        setCases(prev => [json.data, ...prev]);
        setIsModalOpen(false);
        setNewCaller("");
        setNewCondition("");
        setNewLocation("");
      }
    } catch (err) {
      console.error("Failed to create case:", err);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.caller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.animal.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getAnimalEmoji = (animal) => {
    switch (animal) {
      case "Cow": return "🐄";
      case "Buffalo": return "🐃";
      case "Dog": return "🐕";
      case "Cat": return "🐈";
      default: return "🐾";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-[#1e293b] relative">
      
      {/* 4 Mini Cards on top */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Total Active Cases</span>
            <span className="text-[24px] font-black text-slate-900 mt-1">{cases.length}</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Critical Alerts</span>
            <span className="text-[24px] font-black text-rose-600 mt-1">
              {cases.filter(c => c.priority === "HIGH").length}
            </span>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">En Route / Picking</span>
            <span className="text-[24px] font-black text-orange-500 mt-1">
              {cases.filter(c => c.status === "En Route" || c.status === "Animal Picked").length}
            </span>
          </div>
          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Hospitals Reached</span>
            <span className="text-[24px] font-black text-purple-600 mt-1">
              {cases.filter(c => c.status === "Hospital Reached").length}
            </span>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Filter & Table area */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs flex flex-col w-full">
        
        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div className="flex flex-col">
            <h3 className="text-[15px] font-bold text-gray-900">Cases Registry</h3>
            <span className="text-[11px] text-gray-400 mt-[2px]">Log and assign incoming calls to rescue units.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 bg-gray-50 border border-slate-200 rounded-xl text-[12px] placeholder-gray-405 focus:outline-none focus:bg-white focus:border-gray-300 transition-all w-60"
              />
            </div>

            {/* Status filtering pills */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 border border-slate-200 rounded-xl">
              {["ALL", "Assigned", "En Route", "Hospital Reached"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                    statusFilter === status
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {status === "ALL" ? "ALL" : status}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-bold rounded-xl flex items-center gap-2 transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Call</span>
            </button>
          </div>
        </div>

        {/* Custom styled table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="pb-3 px-3">Case ID</th>
                <th className="pb-3 px-3">Caller Name</th>
                <th className="pb-3 px-3">Animal Details</th>
                <th className="pb-3 px-3">Severity</th>
                <th className="pb-3 px-3">Accident Spot</th>
                <th className="pb-3 px-3">Assigned Driver</th>
                <th className="pb-3 px-3">Milestone Status</th>
                <th className="pb-3 px-3">Logged Time</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700">
              {filteredCases.map((item) => {
                const liveInfo = driverLiveMap[item.driver];
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3 font-semibold text-slate-900">{item.id}</td>
                    <td className="py-4 px-3 text-slate-600 font-medium">{item.caller}</td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-[14px]">
                          {getAnimalEmoji(item.animal)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{item.animal}</span>
                          <span className="text-[10px] text-gray-400 font-normal mt-[1px]">{item.condition}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`inline-block px-2.5 py-[3px] rounded-md text-[10px] font-bold ${getPriorityStyle(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-gray-500 font-normal">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span>{item.location}</span>
                        </div>
                        {liveInfo && (
                          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <span className="text-[8.5px] text-indigo-500 font-bold uppercase">GPS:</span>
                            <span className="truncate max-w-[150px]">{liveInfo.location}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 text-blue-500 flex items-center justify-center text-[10px] font-bold">
                            {item.driver.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-semibold text-slate-850">{item.driver}</span>
                        </div>
                        {liveInfo && (
                          <div className={`text-[9px] font-extrabold flex items-center gap-1 pl-8 ${
                            liveInfo.status === "RUNNING" ? "text-emerald-600" : liveInfo.status === "IDLE" ? "text-amber-600" : "text-rose-500"
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              liveInfo.status === "RUNNING" ? "bg-emerald-500 animate-pulse" : liveInfo.status === "IDLE" ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                            }`}></span>
                            <span>{liveInfo.plate} ({liveInfo.status})</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block px-2.5 py-[3px] rounded-md text-[10px] font-bold tracking-wide ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                        {liveInfo && (
                          <span className={`text-[9px] font-extrabold flex items-center gap-1 ${
                            liveInfo.status === "RUNNING" ? "text-emerald-600" : liveInfo.status === "IDLE" ? "text-amber-600" : "text-rose-500"
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              liveInfo.status === "RUNNING" ? "bg-emerald-500 animate-pulse" : liveInfo.status === "IDLE" ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                            }`}></span>
                            <span>GPS: {liveInfo.speedKmh}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-400 text-[11px] font-medium">
                      {item.time}
                    </td>
                    <td className="py-4 px-3 text-right">
                      {liveInfo ? (
                        <a
                          href={`/admin/live-tracking?selected=${encodeURIComponent(liveInfo.plate)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-[10.5px] font-bold rounded-lg transition active:scale-[0.97]"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Live</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">Offline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Create Case Modal popup overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-[14.5px] font-bold text-gray-900">Create New Rescue Case</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="flex flex-col gap-4 text-[12.5px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wide">Caller Full Name</label>
                  <input
                    type="text"
                    required
                    value={newCaller}
                    onChange={(e) => setNewCaller(e.target.value)}
                    placeholder="e.g. Amit Verma"
                    className="h-10 px-3.5 bg-gray-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wide">Animal Classification</label>
                  <select
                    value={newAnimal}
                    onChange={(e) => setNewAnimal(e.target.value)}
                    className="h-10 px-3.5 bg-gray-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  >
                    <option value="Cow">Cow</option>
                    <option value="Buffalo">Buffalo</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wide">Injury Details / Symptoms</label>
                <input
                  type="text"
                  required
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. Bleeding neck laceration, leg injury"
                  className="h-10 px-3.5 bg-gray-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wide">Accident Spot Location</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Knowledge Park Sector 12, Noida"
                  className="h-10 px-3.5 bg-gray-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wide">Call Severity Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="h-10 px-3.5 bg-gray-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-500 uppercase text-[10px] tracking-wide">Ambulance Driver Allocation</label>
                  <select
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="h-10 px-3.5 bg-gray-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  >
                    <option value="Raj Kumar">Raj Kumar (A-1)</option>
                    <option value="Pawan Singh">Pawan Singh (A-3)</option>
                    <option value="Amit Verma">Amit Verma (A-4)</option>
                    <option value="Mohit Sharma">Mohit Sharma (A-7)</option>
                    <option value="Karan Singh">Karan Singh (A-9)</option>
                    <option value="Jatin Sharma">Jatin Sharma (A-12)</option>
                    <option value="Manoj Yadav">Manoj Yadav</option>
                    <option value="Suresh Pal">Suresh Pal</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-3 transition active:scale-[0.98] cursor-pointer flex items-center justify-center"
              >
                <span>Dispatch Crew & Log Case</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
