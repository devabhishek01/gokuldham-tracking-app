"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck, ClipboardList, Map, Navigation, Heart, Battery, Radio,
  LogOut, Bell, Menu, X, Compass
} from "lucide-react";

import { DRIVERS_LIST } from "@/lib/gpsUtils";

function DriverSidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const [driverName, setDriverName] = useState("Raj Kumar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDriver = localStorage.getItem("currentDriverName");
      if (savedDriver) {
        setDriverName(savedDriver);
      }
    }
  }, []);

  const driverIndex = DRIVERS_LIST.findIndex(d => d.name === driverName);
  const ambulanceNum = driverIndex !== -1 ? driverIndex + 1 : 1;
  const initials = driverName.split(" ").map(n => n[0]).join("").toUpperCase();

  const navItems = [
    { href: "/driver", icon: ClipboardList, label: "My Tasks", exact: true },
    { href: "/driver/navigation", icon: Map, label: "Navigation Map", exact: true },
    { href: "/driver/vehicle-diagnostic", icon: Battery, label: "Vehicle Status", exact: true },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#1a0f05] text-amber-250 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    }`}>
      {/* Brand */}
      <div className="px-6 pt-6 pb-5 flex items-center justify-between flex-shrink-0">
        <Link href="/driver" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-500/20">
            <Truck className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-white tracking-wide">ResqTrack</span>
            <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest">Driver Console</span>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-orange-300 hover:text-white bg-transparent border-none cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-[2px]">
        <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest px-4 mb-2 block">DRIVER TASKS</span>
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13px] transition-all duration-150 ${
                isActive
                  ? "bg-orange-500 text-white font-semibold shadow-sm shadow-orange-500/20"
                  : "text-amber-200/60 hover:text-white hover:bg-white/[0.04] font-medium"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 flex flex-col gap-2 flex-shrink-0 border-t border-white/[0.06] pt-4 mt-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13px] font-medium text-amber-200/60 hover:text-rose-450 hover:bg-white/[0.04] transition-all">
          <LogOut className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
          <span>Logout</span>
        </Link>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-bold text-white truncate leading-tight">{driverName}</span>
              <span className="text-[10px] text-amber-500/60 truncate mt-[3px]">Ambulance {String(ambulanceNum).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DriverHeaderProfile() {
  const [driverName, setDriverName] = useState("Raj Kumar");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDriver = localStorage.getItem("currentDriverName");
      if (savedDriver) {
        setDriverName(savedDriver);
      }
    }
  }, []);

  const driverIndex = DRIVERS_LIST.findIndex(d => d.name === driverName);
  const ambulanceNum = driverIndex !== -1 ? driverIndex + 1 : 1;
  const initials = driverName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <>
      <div className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm">{initials}</div>
      <div className="hidden sm:flex flex-col">
        <span className="text-[13px] font-bold text-gray-900 leading-tight">{driverName}</span>
        <span className="text-[10px] text-orange-500 font-semibold leading-tight mt-[3px]">Ambulance {String(ambulanceNum).padStart(2, "0")}</span>
      </div>
    </>
  );
}

export default function DriverLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/driver") return "My Active Tasks";
    if (pathname.includes("navigation")) return "Route Navigation Map";
    if (pathname.includes("vehicle-diagnostic")) return "Ambulance Diagnostics";
    return "Driver Panel";
  };

  return (
    <div className="flex h-screen w-full bg-[#fcf9f6] text-gray-900 overflow-hidden">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-[1px]" />
      )}
      <DriverSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-[76px] bg-white border-b border-orange-100 px-6 sm:px-8 flex items-center justify-between z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-orange-600 hover:text-orange-800 bg-transparent border-none cursor-pointer p-1">
              <Menu className="w-5.5 h-5.5" style={{ strokeWidth: 1.8 }} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[17.5px] font-bold text-gray-900 leading-tight">{getPageTitle()}</h1>
              <p className="text-[12px] text-gray-400 mt-[3px] font-medium leading-none">Ambulance driver task dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-5 flex-shrink-0">
            <button className="relative w-9.5 h-9.5 bg-orange-50/50 hover:bg-orange-50 transition-colors rounded-full flex items-center justify-center border border-orange-100 cursor-pointer flex-shrink-0">
              <Bell className="w-[18px] h-[18px] text-orange-600" style={{ strokeWidth: 1.8 }} />
              <span className="absolute top-[-2px] right-[-2px] w-[16px] h-[16px] bg-rose-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center border border-white">2</span>
            </button>
            <div className="w-px h-8 bg-orange-100" />
            <div className="flex items-center gap-3 py-1 flex-shrink-0">
              <DriverHeaderProfile />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#fcf9f6] flex flex-col min-h-[calc(100vh-76px)]">
          <div className="p-6 sm:p-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-6">
            {children}
          </div>
          <footer className="h-[56px] bg-white border-t border-orange-100 px-6 sm:px-8 flex items-center justify-between flex-shrink-0 w-full mt-auto text-[11px] font-bold text-gray-400">
            <span>© {new Date().getFullYear()} RESQTRACK SYSTEMS.</span>
            <span className="flex items-center gap-1.5 text-orange-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Driver Connected
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
