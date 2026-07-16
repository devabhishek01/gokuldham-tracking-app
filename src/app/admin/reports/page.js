"use client";

import React, { useState } from "react";
import { FileText, Download, Calendar, BarChart3, TrendingUp, AlertTriangle, Clock, Activity, FileCheck } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("DAILY");

  return (
    <div className="flex flex-col gap-6 w-full text-[#1e293b]">
      
      {/* 3 Metrics Cards on top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Average Dispatch Time</span>
            <span className="text-[24px] font-black text-slate-900 mt-1">4.2 Mins</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1">Faster by 18% vs last week</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Ambulance Util Rate</span>
            <span className="text-[24px] font-black text-slate-900 mt-1">84.2%</span>
            <span className="text-[10px] text-gray-450 font-normal mt-1">Average shift active duty time</span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">Report Resolution</span>
            <span className="text-[24px] font-black text-slate-900 mt-1">98.4%</span>
            <span className="text-[10px] text-purple-650 font-semibold mt-1">Goal met (95% target)</span>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col">
          <h3 className="text-[15px] font-bold text-slate-900">Operations Analytics</h3>
          <span className="text-[11px] text-gray-400 mt-[2px]">Audit response intervals, dispatch reports, and performance parameters.</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 p-1 border border-slate-200 rounded-xl">
            {["DAILY", "DRIVER", "AMBULANCE"].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                  reportType === type
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {type} REPORT
              </button>
            ))}
          </div>

          <button className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-[12.5px] font-bold rounded-xl flex items-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-2xs">
            <Download className="w-4 h-4" />
            <span>Export Sheet</span>
          </button>
        </div>
      </div>

      {/* Graph Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Metric Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Metrics Chart</span>
              <h4 className="text-[14px] font-bold text-slate-900 mt-1">Monthly Case Distribution</h4>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.2% vs Q1</span>
            </div>
          </div>

          {/* Simple custom vector graph */}
          <div className="relative w-full h-52 flex flex-col justify-end pt-4">
            {/* Grid Y lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-[0.03] pointer-events-none pb-8">
              <div className="w-full border-t border-gray-900" />
              <div className="w-full border-t border-gray-900" />
              <div className="w-full border-t border-gray-900" />
              <div className="w-full border-t border-gray-900" />
            </div>

            <div className="flex items-end justify-between gap-4 h-40 pb-2 z-10">
              {[
                { label: "Jan", val: 65, active: false },
                { label: "Feb", val: 80, active: false },
                { label: "Mar", val: 95, active: false },
                { label: "Apr", val: 120, active: false },
                { label: "May", val: 145, active: false },
                { label: "Jun", val: 182, active: true }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="text-[9.5px] font-extrabold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.val} calls
                  </div>
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${
                      item.active ? "bg-orange-500 shadow-md shadow-orange-500/10" : "bg-slate-100 group-hover:bg-slate-200"
                    }`}
                    style={{ height: `${(item.val / 200) * 100}%` }}
                  />
                  <span className="text-[10.5px] font-bold text-gray-400 mt-1">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts & warnings panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="text-[14px] font-bold text-slate-900 pb-3 border-b border-slate-50 mb-4">Tactical Status Warnings</h4>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-[11.5px] text-rose-700 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span>GPS Signal Interruption</span>
                  <span className="text-[10px] text-rose-550 font-normal">Transponder AMB-103 reported lost packets in Sector B.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-[11.5px] text-amber-700 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span>Shift Schedule Gap</span>
                  <span className="text-[10px] text-amber-550 font-normal">Drivers shortage logged between 14:00 and 16:00 IST.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-5 pt-3.5 border-t border-slate-50">
            System status: nominal
          </div>
        </div>

      </div>

      {/* Audit Trails log table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs w-full flex flex-col">
        <h4 className="text-[14px] font-bold text-slate-900 pb-3 border-b border-slate-100 mb-5">System Audit Trail Logs</h4>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="pb-3 px-4">Log ID</th>
                <th className="pb-3 px-4">Action Type</th>
                <th className="pb-3 px-4">Assigned Crew</th>
                <th className="pb-3 px-4">Log Message details</th>
                <th className="pb-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px] text-slate-700">
              {[
                { id: "LOG-9283", type: "CASE_DISPATCH", crew: "Raj Kumar (AMB-101)", detail: "Dispatched to rescue case CASE-260602-001 (Cow)", time: "08-07-2026 16:15 IST" },
                { id: "LOG-9280", type: "IGNITION_ON", crew: "Manoj Yadav (AMB-102)", detail: "Ignition triggered ON at National Highway 48", time: "08-07-2026 16:02 IST" },
                { id: "LOG-9276", type: "CASE_REGISTRATION", crew: "Super Admin", detail: "New case logged for stray dog suffering from skin disease", time: "08-07-2026 15:45 IST" },
                { id: "LOG-9271", type: "CLINIC_CHECKIN", crew: "Pawan Singh (AMB-103)", detail: "Arrived at hospital ward with Buffalo patient", time: "08-07-2026 15:10 IST" }
              ].map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">{log.id}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-[3px] rounded-md bg-slate-50 text-slate-600 border border-slate-150 text-[10px] font-bold tracking-wide">
                      {log.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{log.crew}</td>
                  <td className="py-4 px-4 text-slate-500 font-normal">{log.detail}</td>
                  <td className="py-4 px-4 text-right text-gray-400 font-medium text-[11px]">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
