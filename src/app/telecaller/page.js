"use client";

import React, { useState, useEffect } from "react";
import { 
  PhoneCall, ClipboardList, MapPin, Users, Heart, AlertOctagon, 
  Clock, Plus, Search, ChevronRight, Phone, Send
} from "lucide-react";
import { enrichGpsVehicle } from "@/lib/gpsUtils";

const initialCases = [
  { id: "CASE-260602-001", caller: "Ramesh Sharma", animal: "Cow", condition: "Fractured hind leg", priority: "HIGH", location: "Sector 45, Noida", driver: "Raj Kumar", status: "Assigned", time: "10:30 AM" },
  { id: "CASE-260602-002", caller: "Sita Devi", animal: "Buffalo", condition: "Deep neck laceration", priority: "HIGH", location: "Chipyana, Noida", driver: "Karan Singh", status: "En Route", time: "10:15 AM" },
  { id: "CASE-260602-003", caller: "Amit Verma", animal: "Cow", condition: "Dehydration & weakness", priority: "LOW", location: "Village Dadri", driver: "Pawan Singh", status: "Reached Location", time: "09:45 AM" },
];

export default function TelecallerDashboard() {
  const [cases, setCases] = useState([]);
  const [gpsData, setGpsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // New call log form states
  const [callerName, setCallerName] = useState("");
  const [callerPhone, setCallerPhone] = useState("");
  const [animalType, setAnimalType] = useState("Cow");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedDriver, setAssignedDriver] = useState("Raj Kumar");

  // Fetch real-time GPS telemetry and persistent cases
  useEffect(() => {
    const fetchData = async () => {
      try {
        const gpsRes = await fetch("/api/gps?t=" + Date.now());
        const gpsJson = await gpsRes.json();
        if (gpsJson.success && gpsJson.data?.object) {
          setGpsData(gpsJson.data.object);
        }

        const casesRes = await fetch("/api/cases?t=" + Date.now());
        const casesJson = await casesRes.json();
        if (casesJson.success && casesJson.data) {
          setCases(casesJson.data);
        }
      } catch (err) {
        console.error("Data Fetch Error on Telecaller Dashboard:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!callerName || !location || !condition) return;

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caller: callerName,
          phone: callerPhone,
          animal: animalType,
          condition: condition,
          priority: priority,
          driver: assignedDriver
        })
      });
      const json = await response.json();
      if (json.success && json.data) {
        setCases(prev => [json.data, ...prev]);
        setCallerName("");
        setCallerPhone("");
        setCondition("");
        setLocation("");
      }
    } catch (err) {
      console.error("Failed to create case from telecaller form:", err);
    }
  };

  const getPriorityStyle = (prio) => {
    switch (prio) {
      case "HIGH": return "bg-rose-50 text-rose-600 border border-rose-100";
      case "MEDIUM": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "LOW": return "bg-gray-50 text-gray-500 border border-gray-150";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  const filteredCases = cases.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caller.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.animal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/60 p-5 rounded-2xl flex items-center justify-between shadow-3xs">
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Active Rescues</span>
            <span className="text-[24px] font-black text-gray-800 mt-1">{cases.length}</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 p-5 rounded-2xl flex items-center justify-between shadow-3xs">
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Drivers On Duty</span>
            <span className="text-[24px] font-black text-gray-800 mt-1">
              {Object.values(driverLiveMap).filter(d => d.isIgnitionOn).length} / 16
            </span>
          </div>
          <div className="w-11 h-11 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 p-5 rounded-2xl flex items-center justify-between shadow-3xs">
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Average Response</span>
            <span className="text-[24px] font-black text-gray-800 mt-1">18.5 Min</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 p-5 rounded-2xl flex items-center justify-between shadow-3xs">
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">High Priority Cases</span>
            <span className="text-[24px] font-black text-gray-800 mt-1">
              {cases.filter(c => c.priority === "HIGH").length}
            </span>
          </div>
          <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Logger Form */}
        <div className="lg:col-span-1 bg-white border border-gray-200/60 p-6 rounded-2xl shadow-3xs flex flex-col h-fit">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-800 leading-none">Log Incoming Rescue Call</h3>
          </div>

          <form onSubmit={handleCreateCase} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Caller Name</label>
              <input 
                type="text" 
                required 
                placeholder="Ramesh Sharma" 
                value={callerName} 
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[12.5px] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Caller Phone</label>
              <input 
                type="text" 
                placeholder="9876543210" 
                value={callerPhone} 
                onChange={(e) => setCallerPhone(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[12.5px] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Animal Type</label>
                <select 
                  value={animalType} 
                  onChange={(e) => setAnimalType(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[12.5px] font-bold text-slate-700"
                >
                  <option value="Cow">Cow 🐄</option>
                  <option value="Dog">Dog 🐕</option>
                  <option value="Cat">Cat 🐈</option>
                  <option value="Buffalo">Buffalo 🦬</option>
                  <option value="Bird">Bird 🦅</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[12.5px] font-bold text-slate-700"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Incident Spot / Location</label>
              <input 
                type="text" 
                required 
                placeholder="Sector 62, Noida (near metro station)" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[12.5px] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medical Emergency / Condition</label>
              <textarea 
                required 
                placeholder="Describe accident or injuries..." 
                value={condition} 
                onChange={(e) => setCondition(e.target.value)}
                className="w-full min-h-[70px] p-3 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[12.5px] transition-all resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assign Driver / Ambulance</label>
              <select 
                value={assignedDriver} 
                onChange={(e) => setAssignedDriver(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[12.5px] font-bold text-slate-700"
              >
                <option value="Raj Kumar">Raj Kumar (Ambulance 01)</option>
                <option value="Manoj Yadav">Manoj Yadav (Ambulance 02)</option>
                <option value="Pawan Singh">Pawan Singh (Ambulance 03)</option>
                <option value="Amit Verma">Amit Verma (Ambulance 04)</option>
                <option value="Karan Singh">Karan Singh (Ambulance 09)</option>
                <option value="Jatin Sharma">Jatin Sharma (Ambulance 10)</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer mt-2"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch & Create Case
            </button>
          </form>
        </div>

        {/* Live Rescue Cases List */}
        <div className="lg:col-span-2 bg-white border border-gray-200/60 p-6 rounded-2xl shadow-3xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-[15px] font-bold text-gray-800 leading-none">Active Cases Registry</h3>
            <div className="relative w-full sm:w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search cases..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-[12px] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Case ID</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Caller / Spot</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Animal / Issue</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Unit</th>
                  <th className="py-2.5 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCases.map((c) => {
                  const liveData = driverLiveMap[c.driver];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-black text-slate-800 leading-tight">{c.id}</span>
                          <span className="text-[9.5px] text-gray-400 mt-1">{c.time}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold text-slate-700 leading-tight">{c.caller}</span>
                          <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-gray-300" /> {c.location}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-slate-700">{c.animal}</span>
                          <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded-full ${getPriorityStyle(c.priority)}`}>
                            {c.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[150px]">{c.condition}</p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-black text-slate-850 leading-tight">{c.driver}</span>
                          <span className="text-[9.5px] font-bold text-emerald-600 mt-1">
                            {liveData ? `Ambulance ${String(liveData.num).padStart(2, '0')}` : "Ambulance --"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {liveData ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${liveData.isIgnitionOn ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                              {liveData.isIgnitionOn ? "ON DUTY" : "OFF DUTY"}
                            </span>
                            <span className="text-[9.5px] text-gray-400 mt-1">{liveData.speedDisplay} • {liveData.todayDistDisplay}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Offline</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
