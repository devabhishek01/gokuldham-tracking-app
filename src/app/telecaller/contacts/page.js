"use client";

import React, { useState } from "react";
import { Search, Phone, Mail, User, ShieldCheck } from "lucide-react";
import { DRIVERS_LIST } from "@/lib/gpsUtils";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = DRIVERS_LIST.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  return (
    <div className="bg-white border border-gray-200/60 p-6 rounded-3xl shadow-3xs flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-[15px] font-black text-gray-800 leading-tight">Quick Contacts Roster</h3>
          <p className="text-[11.5px] text-gray-400 mt-1">Direct tele-communication directory for rescue drivers.</p>
        </div>
        <div className="relative w-full sm:w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search Name or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9.5 pl-9.5 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredContacts.map((c, index) => {
          return (
            <div key={index} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black text-[14px]">
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-slate-800 leading-tight">{c.name}</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1">Ambulance {String(index + 1).padStart(2, '0')} Driver</span>
              </div>

              <div className="flex flex-col gap-2 w-full border-t border-slate-50 pt-3 mt-1">
                <a 
                  href={`tel:${c.phone}`} 
                  className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11.5px] font-bold flex items-center justify-center gap-1.5 shadow-3xs transition active:scale-[0.98]"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Driver
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
