"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneCall, AlertCircle, CheckCircle2, Navigation, Send } from "lucide-react";

export default function NewCallPage() {
  const router = useRouter();
  const [callerName, setCallerName] = useState("");
  const [callerPhone, setCallerPhone] = useState("");
  const [animalType, setAnimalType] = useState("Cow");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedDriver, setAssignedDriver] = useState("Raj Kumar");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
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
      if (json.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          router.push("/telecaller");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to submit new case:", err);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto w-full bg-white border border-gray-200/60 p-8 rounded-3xl shadow-3xs flex flex-col gap-6 mt-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <PhoneCall className="w-5.5 h-5.5" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[17px] font-black text-gray-800 leading-tight">Log Rescue Case</h2>
          <p className="text-[12px] text-gray-400 mt-1 font-medium">Record incident details and dispatch nearby ambulance.</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[12.5px] font-bold">Case Logged Successfully!</span>
            <span className="text-[11px] text-emerald-600 mt-0.5">Ambulance dispatched. Redirecting back to dashboard...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Caller Full Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Ramesh Kumar" 
              value={callerName} 
              onChange={(e) => setCallerName(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[13px] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Contact Number</label>
            <input 
              type="text" 
              placeholder="e.g. +91 98765 43210" 
              value={callerPhone} 
              onChange={(e) => setCallerPhone(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[13px] transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Animal Species</label>
            <select 
              value={animalType} 
              onChange={(e) => setAnimalType(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[13px] font-bold text-slate-700"
            >
              <option value="Cow">Cow 🐄</option>
              <option value="Dog">Dog 🐕</option>
              <option value="Cat">Cat 🐈</option>
              <option value="Buffalo">Buffalo 🦬</option>
              <option value="Bird">Bird 🦅</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Severity Level</label>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[13px] font-bold text-slate-700"
            >
              <option value="LOW">Low Priority (Minor issue)</option>
              <option value="MEDIUM">Medium Priority (Stable wound)</option>
              <option value="HIGH">High Priority (Severe bleeding / fracture)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Incident Location Spot</label>
          <div className="relative flex items-center">
            <Navigation className="w-4 h-4 text-gray-400 absolute left-4" />
            <input 
              type="text" 
              required 
              placeholder="e.g. Near Sector 15 Metro Station, Noida" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[13px] transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Injury / Emergency Description</label>
          <textarea 
            required 
            placeholder="e.g. Stray dog hit by a bike, unable to walk, deep cut on right leg." 
            value={condition} 
            onChange={(e) => setCondition(e.target.value)}
            className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[13px] transition-all resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Dispatch Ambulance / Driver</label>
          <select 
            value={assignedDriver} 
            onChange={(e) => setAssignedDriver(e.target.value)}
            className="w-full h-11 px-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none rounded-xl text-[13px] font-bold text-slate-700"
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
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer mt-3"
        >
          <Send className="w-4 h-4" />
          Log Incident & Dispatch Fleet
        </button>
      </form>
    </div>
  );
}
