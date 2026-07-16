"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Phone, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { enrichGpsVehicle } from "@/lib/gpsUtils";

const initialCases = [
  { id: "CASE-260602-001", caller: "Ramesh Sharma", phone: "9876543210", animal: "Cow", condition: "Fractured hind leg", priority: "HIGH", location: "Sector 45, Noida", driver: "Raj Kumar", status: "Assigned", time: "10:30 AM" },
  { id: "CASE-260602-002", caller: "Sita Devi", phone: "9911223344", animal: "Buffalo", condition: "Deep neck laceration", priority: "HIGH", location: "Chipyana, Noida", driver: "Karan Singh", status: "En Route", time: "10:15 AM" },
  { id: "CASE-260602-003", caller: "Amit Verma", phone: "9560012233", animal: "Cow", condition: "Dehydration & weakness", priority: "LOW", location: "Village Dadri", driver: "Pawan Singh", status: "Reached Location", time: "09:45 AM" },
  { id: "CASE-260602-004", caller: "Vikash Chaudhary", phone: "9711044556", animal: "Dog", condition: "Skin disease / Mange", priority: "MEDIUM", location: "Knowledge Park, Noida", driver: "Amit Verma", status: "Animal Picked", time: "09:20 AM" },
];

export default function ActiveCasesPage() {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [gpsData, setGpsData] = useState([]);

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
        console.error("Data Fetch Error on Telecaller Active Cases:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const driverLiveMap = {};
  gpsData.forEach((v) => {
    const enriched = enrichGpsVehicle(v);
    if (enriched) {
      driverLiveMap[enriched.driverName] = enriched;
    }
  });

  const getPriorityColor = (prio) => {
    switch (prio) {
      case "HIGH": return "bg-rose-50 text-rose-600 border border-rose-100";
      case "MEDIUM": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "LOW": return "bg-slate-50 text-slate-500 border border-slate-150";
      default: return "bg-slate-50 text-slate-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Assigned": return "bg-blue-50 text-blue-600 border border-blue-100";
      case "En Route": return "bg-orange-50 text-orange-600 border border-orange-100";
      case "Reached Location": return "bg-teal-50 text-teal-600 border border-teal-100";
      case "Animal Picked": return "bg-violet-50 text-violet-600 border border-violet-100";
      case "Hospital Reached": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      default: return "bg-slate-50 text-slate-600 border border-slate-150";
    }
  };

  const filteredCases = cases.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caller.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-3xs flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-[15px] font-black text-gray-800 leading-tight">All Active Cases</h3>
          <p className="text-[11.5px] text-gray-400 mt-1">Track case stages and coordination logs.</p>
        </div>
        <div className="relative w-full sm:w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search Caller or Location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9.5 pl-9.5 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((c) => {
          const liveDriver = driverLiveMap[c.driver];
          return (
            <div key={c.id} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 hover:shadow-3xs transition flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-black text-slate-800">{c.id}</span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(c.status)}`}>
                  {c.status}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-700">{c.caller}</span>
                  <span className="text-[11px] text-slate-400">• {c.phone}</span>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                  <span className="font-bold text-slate-700">Animal: </span>{c.animal} ({c.condition})
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gray-300" /> {c.location}
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                      {c.driver.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11.5px] font-bold text-slate-800">{c.driver}</span>
                      <span className="text-[9.5px] text-gray-400">Assigned Driver</span>
                    </div>
                  </div>
                  {liveDriver && (
                    <span className="text-[10px] font-black text-slate-700 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {liveDriver.speedDisplay} • {liveDriver.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <a href={`tel:${c.phone}`} className="flex-1 h-8 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition">
                    <Phone className="w-3 h-3" /> Call Reporter
                  </a>
                  <button className="flex-1 h-8 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition">
                    <MessageSquare className="w-3 h-3" /> Log Notes
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
