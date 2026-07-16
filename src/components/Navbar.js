"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";

export default function Navbar({ setSidebarOpen }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/cases")) return "Rescue Cases";
    if (pathname.startsWith("/admin/drivers")) return "Drivers Directory";
    if (pathname.startsWith("/admin/ambulances")) return "Ambulance Fleet";
    if (pathname.startsWith("/admin/reports")) return "Reports";
    return "Dashboard";
  };

  const getPageSubtitle = () => {
    if (pathname === "/admin") return "Welcome back, Admin!";
    if (pathname.startsWith("/admin/cases")) return "List of all cases logged in the system.";
    if (pathname.startsWith("/admin/drivers")) return "Active duty drivers database.";
    if (pathname.startsWith("/admin/ambulances")) return "Ambulance hardware trackers directory.";
    if (pathname.startsWith("/admin/reports")) return "Operations metrics and aggregations.";
    return "Welcome back, Admin!";
  };

  return (
    <header className="h-[76px] bg-white border-b border-gray-200/60 px-6 sm:px-8 flex items-center justify-between z-30 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer p-1"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5.5 h-5.5" style={{ strokeWidth: 1.8 }} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-[17.5px] font-bold text-gray-900 leading-tight tracking-[-0.01em]">
            {getPageTitle()}
          </h1>
          <p className="text-[12px] text-gray-400 mt-[3px] font-medium leading-none">
            {getPageSubtitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0">
        
        {/* Notifications Bell with 8 Counter */}
        <button 
          className="relative w-9.5 h-9.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-full flex items-center justify-center border border-gray-200/50 cursor-pointer flex-shrink-0"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-gray-500" style={{ strokeWidth: 1.8 }} />
          <span className="absolute top-[-2px] right-[-2px] w-[16px] h-[16px] bg-rose-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center border border-white">
            8
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200" />

        {/* User Details */}
        <div className="flex items-center gap-3 py-1 flex-shrink-0 cursor-pointer">
          <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm">
            A
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[13px] font-bold text-gray-900 leading-tight">Admin</span>
            <span className="text-[10px] text-gray-400 font-semibold leading-tight mt-[3px]">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
