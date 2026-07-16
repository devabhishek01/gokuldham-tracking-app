"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HeartHandshake,
  Users,
  Truck,
  ShieldAlert,
  Plus,
  Home,
  MapPin,
  History,
  FileBarChart,
  LineChart,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  MoreVertical
} from "lucide-react";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();

  // Collapsible submenu states
  const [openSubmenus, setOpenSubmenus] = useState({
    cases: true,
    drivers: false,
    ambulances: false,
    users: false
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isCaseActive = pathname.startsWith("/admin/cases");
  const isDriverActive = pathname.startsWith("/admin/drivers");
  const isAmbulanceActive = pathname.startsWith("/admin/ambulances");

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0b1329] text-slate-300 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
      {/* Brand Header */}
      <div className="px-6 pt-6 pb-5 flex items-center justify-between flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          {/* Circular White Paw Print Container */}
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 text-blue-600 fill-current">
              <path d="M12 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm-4.5-5c-.83 0-1.5-.67-1.5-1.5S6.67 6 7.5 6s1.5.67 1.5 1.5S8.33 9 7.5 9zm9 0c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9zM4 14.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm14 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-white tracking-wide">Tracking & Rescue</span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-none px-4 py-3 flex flex-col gap-5">

        {/* Core Link */}
        <div className="flex flex-col gap-[2px]">
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] transition-all duration-150 ${pathname === "/admin"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium"
              }`}
          >
            <LayoutDashboard className="w-[18px] h-[18px]" style={{ strokeWidth: 2 }} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Category: MANAGEMENT */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-1 block">MANAGEMENT</span>

          {/* Rescue Cases Submenu */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSubmenu("cases")}
              className={`flex items-center justify-between px-4 py-[11px] rounded-xl text-[13.5px] font-medium transition-all ${isCaseActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
                <span>Rescue Cases</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSubmenus.cases ? "rotate-180" : ""}`} />
            </button>
            {openSubmenus.cases && (
              <div className="flex flex-col pl-9 mt-1 gap-1">
                <Link
                  href="/admin/cases"
                  onClick={() => setSidebarOpen(false)}
                  className={`text-[12.5px] py-1.5 hover:text-white transition-colors ${pathname === "/admin/cases" ? "text-blue-500 font-bold" : "text-slate-500"
                    }`}
                >
                  All Cases Registry
                </Link>
              </div>
            )}
          </div>

          {/* Drivers Submenu */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSubmenu("drivers")}
              className={`flex items-center justify-between px-4 py-[11px] rounded-xl text-[13.5px] font-medium transition-all ${isDriverActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
                <span>Drivers</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSubmenus.drivers ? "rotate-180" : ""}`} />
            </button>
            {openSubmenus.drivers && (
              <div className="flex flex-col pl-9 mt-1 gap-1">
                <Link
                  href="/admin/drivers"
                  onClick={() => setSidebarOpen(false)}
                  className={`text-[12.5px] py-1.5 hover:text-white transition-colors ${pathname === "/admin/drivers" ? "text-blue-500 font-bold" : "text-slate-500"
                    }`}
                >
                  Drivers Directory
                </Link>
              </div>
            )}
          </div>

          {/* Ambulances Submenu */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSubmenu("ambulances")}
              className={`flex items-center justify-between px-4 py-[11px] rounded-xl text-[13.5px] font-medium transition-all ${isAmbulanceActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              <div className="flex items-center gap-3">
                <Truck className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
                <span>Ambulances</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSubmenus.ambulances ? "rotate-180" : ""}`} />
            </button>
            {openSubmenus.ambulances && (
              <div className="flex flex-col pl-9 mt-1 gap-1">
                <Link
                  href="/admin/ambulances"
                  onClick={() => setSidebarOpen(false)}
                  className={`text-[12.5px] py-1.5 hover:text-white transition-colors ${pathname === "/admin/ambulances" ? "text-blue-500 font-bold" : "text-slate-500"
                    }`}
                >
                  Ambulance Fleet
                </Link>
              </div>
            )}
          </div>

          {/* Users Submenu */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSubmenu("users")}
              className="flex items-center justify-between px-4 py-[11px] rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
                <span>Users</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openSubmenus.users ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Hospitals Link */}
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <Home className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
            <span>Hospitals</span>
          </Link>
        </div>

        {/* Category: TRACKING */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-1 block">TRACKING</span>

          <Link
            href="/admin/live-tracking"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] font-medium transition-all ${pathname === "/admin/live-tracking"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
          >
            <MapPin className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
            <span>Live Tracking</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <History className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
            <span>GPS History</span>
          </Link>
        </div>

        {/* Category: REPORTS */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-1 block">REPORTS</span>

          <Link
            href="/admin/reports"
            className="flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <FileBarChart className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
            <span>Reports</span>
          </Link>

          <Link
            href="/admin/reports"
            className="flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <LineChart className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
            <span>Analytics</span>
          </Link>
        </div>

        {/* Category: SETTINGS */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-1 block">SETTINGS</span>

          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <Bell className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
            <span>Notifications</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <Settings className="w-[18px] h-[18px]" style={{ strokeWidth: 1.8 }} />
            <span>Settings</span>
          </Link>
        </div>

      </nav>

      {/* Sidebar Footer — User Avatar block */}
      <div className="px-4 pb-5 flex flex-col gap-2 flex-shrink-0 border-t border-white/[0.06] pt-4 mt-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-[11px] rounded-xl text-[13.5px] font-medium text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] transition-all"
        >
          <svg className="w-[18px] h-[18px] text-slate-400 hover:text-rose-450" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </Link>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0">
              A
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-bold text-white truncate leading-tight">Admin</span>
              <span className="text-[10px] text-slate-500 truncate mt-[3px]">Super Admin</span>
            </div>
          </div>
          <button className="text-slate-500 hover:text-white transition bg-transparent border-none cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
