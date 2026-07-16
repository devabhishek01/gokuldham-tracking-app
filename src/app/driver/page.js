"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, Play, Navigation, AlertTriangle, Battery, Clock, MapPin, Phone, Camera, Upload, CheckCircle2
} from "lucide-react";
import { enrichGpsVehicle } from "@/lib/gpsUtils";

export default function DriverDashboard() {
  const [myCases, setMyCases] = useState([]);
  const [gpsData, setGpsData] = useState(null);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [photoFiles, setPhotoFiles] = useState({}); // key: caseId, value: base64/url
  const [uploadError, setUploadError] = useState({});

  const [driverName, setDriverName] = useState("Raj Kumar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDriver = localStorage.getItem("currentDriverName");
      if (savedDriver) {
        setDriverName(savedDriver);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch GPS
        const gpsRes = await fetch("/api/gps?t=" + Date.now());
        const gpsJson = await gpsRes.json();
        if (gpsJson.success && gpsJson.data?.object) {
          // Find vehicle mapped to current driver name
          const allEnriched = gpsJson.data.object.map(o => enrichGpsVehicle(o)).filter(Boolean);
          const vehicle = allEnriched.find(v => v.driverName === driverName);
          if (vehicle) {
            setGpsData(vehicle);
          }
        }

        // Fetch Cases
        const casesRes = await fetch("/api/cases?t=" + Date.now());
        const casesJson = await casesRes.json();
        if (casesJson.success && casesJson.data) {
          // Filter only cases assigned to current logged in driver
          const assignedToMe = casesJson.data.filter(c => c.driver === driverName);
          setMyCases(assignedToMe);
        }
      } catch (err) {
        console.error("GPS/Cases Fetch Error on Driver Dashboard:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [driverName]);

  const updateCaseStatus = async (caseId, newStatus, photoUrl = null) => {
    try {
      const response = await fetch("/api/cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: caseId,
          status: newStatus,
          photo: photoUrl
        })
      });
      const json = await response.json();
      if (json.success && json.data) {
        setMyCases(prev => prev.map(c => c.id === caseId ? json.data : c));
      }
    } catch (err) {
      console.error("Failed to update case status:", err);
    }
  };

  const handlePhotoUpload = (caseId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate reading file and setting state
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoFiles(prev => ({ ...prev, [caseId]: reader.result }));
      setUploadError(prev => ({ ...prev, [caseId]: null }));
    };
    reader.readAsDataURL(file);
  };

  const triggerAnimalPickup = (caseId) => {
    const uploadedPhoto = photoFiles[caseId];
    if (!uploadedPhoto) {
      setUploadError(prev => ({ ...prev, [caseId]: "Please upload or capture a photo of the animal before pickup!" }));
      return;
    }
    // Update case status to Animal Picked and attach photo
    updateCaseStatus(caseId, "Animal Picked", uploadedPhoto);
  };

  const getNextStatusAction = (caseItem) => {
    const status = caseItem.status;
    switch (status) {
      case "Assigned": return { label: "Start Trip", next: "En Route", icon: Play, color: "bg-blue-600 hover:bg-blue-700", action: () => updateCaseStatus(caseItem.id, "En Route") };
      case "En Route": return { label: "Arrived at Location", next: "Reached Location", icon: MapPin, color: "bg-orange-600 hover:bg-orange-700", action: () => updateCaseStatus(caseItem.id, "Reached Location") };
      case "Reached Location": return { label: "Confirm Animal Pickup", next: "Animal Picked", icon: CheckCircle, color: "bg-violet-600 hover:bg-violet-700", action: () => triggerAnimalPickup(caseItem.id) };
      case "Animal Picked": return { label: "Confirm Hospital Arrival", next: "Hospital Reached", icon: Navigation, color: "bg-emerald-600 hover:bg-emerald-700", action: () => updateCaseStatus(caseItem.id, "Hospital Reached") };
      default: return null;
    }
  };

  const pendingCases = myCases.filter(c => c.status !== "Hospital Reached");
  const completedCases = myCases.filter(c => c.status === "Hospital Reached");

  return (
    <div className="flex flex-col gap-6 w-full text-slate-800">
      {/* Top Diagnostics bar for the driver */}
      {gpsData && (
        <div className="bg-orange-500 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-orange-500/20">
          <div className="flex flex-col">
            <span className="text-[11px] text-orange-200 font-bold uppercase tracking-wider">Active Ambulance Telemetry</span>
            <span className="text-[17px] font-black mt-1">Ambulance 01 ({gpsData.plate})</span>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">Ignition</span>
              <span className="text-[13px] font-black mt-0.5">{gpsData.isIgnitionOn ? "ON 🟢" : "OFF 🔴"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">Today's Run</span>
              <span className="text-[13px] font-black mt-0.5">{gpsData.todayDistDisplay}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">Battery</span>
              <span className="text-[13px] font-black mt-0.5">{gpsData.batteryDisplay}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-orange-100 gap-6">
        <button 
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 text-[13px] font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "PENDING" ? "border-orange-500 text-orange-650" : "border-transparent text-gray-400"
          }`}
        >
          Pending Tasks ({pendingCases.length})
        </button>
        <button 
          onClick={() => setActiveTab("COMPLETED")}
          className={`pb-3 text-[13px] font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "COMPLETED" ? "border-orange-500 text-orange-650" : "border-transparent text-gray-400"
          }`}
        >
          Completed Tasks ({completedCases.length})
        </button>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-4">
        {(activeTab === "PENDING" ? pendingCases : completedCases).map((c) => {
          const action = getNextStatusAction(c);
          const ActionIcon = action?.icon;
          return (
            <div key={c.id} className="bg-white border border-orange-100 rounded-2xl p-6 shadow-3xs flex flex-col gap-6 hover:border-orange-200 transition">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[13.5px] font-black text-slate-800">{c.id}</span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                      {c.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[13.5px] font-bold text-slate-700">{c.caller} • <a href={`tel:${c.phone}`} className="text-orange-600 font-bold">{c.phone}</a></span>
                    <p className="text-[12.5px] text-slate-500 leading-relaxed font-medium mt-1">
                      <span className="font-bold text-slate-700">Animal: </span>{c.animal} ({c.condition})
                    </p>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-gray-450 mt-2 font-bold">
                      <MapPin className="w-4 h-4 text-orange-500" /> {c.location}
                    </div>
                  </div>
                </div>

                {/* Status-specific options (e.g. Photo upload at Reached Location) */}
                {c.status === "Reached Location" && (
                  <div className="flex flex-col gap-3 bg-orange-50/40 border border-orange-100 p-4 rounded-xl max-w-sm w-full">
                    <span className="text-[11px] font-black text-orange-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Camera className="w-4 h-4" /> Animal Pickup Photo Requirement
                    </span>
                    <p className="text-[11px] text-orange-600 font-medium">Please capture/upload a picture of the animal to confirm the pickup.</p>
                    
                    <div className="flex items-center gap-3">
                      <label className="h-9 px-3 bg-white border border-orange-250 hover:bg-orange-50 text-orange-700 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs">
                        <Upload className="w-3.5 h-3.5" />
                        Select Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handlePhotoUpload(c.id, e)} 
                          className="hidden" 
                        />
                      </label>
                      
                      {photoFiles[c.id] && (
                        <span className="text-[11.5px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Loaded
                        </span>
                      )}
                    </div>

                    {uploadError[c.id] && (
                      <span className="text-[10px] text-rose-500 font-bold mt-1">{uploadError[c.id]}</span>
                    )}
                  </div>
                )}

                {/* Display uploaded animal photo if exists */}
                {c.photo && (
                  <div className="w-[120px] h-[90px] rounded-xl overflow-hidden border border-slate-200/60 flex-shrink-0">
                    <img 
                      src={c.photo} 
                      alt="Rescue animal" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
              </div>

              {action && (
                <div className="border-t border-slate-50 pt-4 flex justify-end">
                  <button 
                    onClick={action.action}
                    className={`h-10 px-5 text-white rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer ${action.color}`}
                  >
                    <ActionIcon className="w-4 h-4" />
                    {action.label}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {(activeTab === "PENDING" ? pendingCases : completedCases).length === 0 && (
          <div className="text-center p-12 bg-white border border-dashed border-orange-200 rounded-2xl text-gray-400 font-bold">
            No rescue tasks found in this section.
          </div>
        )}
      </div>
    </div>
  );
}
