"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Shield, Lock, Mail, ArrowRight, User, Truck } from "lucide-react";
import { DRIVERS_LIST } from "@/lib/gpsUtils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("caller@resqtrack.org");
  const [password, setPassword] = useState("caller123");
  const [vehicleInput, setVehicleInput] = useState("Ambulance 01");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("TELECALLER");

  const findDriverByVehicleInput = (inputStr) => {
    if (!inputStr) return { name: "Raj Kumar", vehicleName: "Ambulance 01" };
    const clean = inputStr.trim().toLowerCase();
    
    // Check for exact matching or numeric digit parsing
    // Match plate number index: e.g. 1001-1040, or 1-40
    const digits = clean.match(/\d+/g);
    if (digits && digits.length > 0) {
      const lastNum = parseInt(digits[digits.length - 1], 10);
      let num = lastNum;
      if (num > 1000 && num <= 1040) {
        num = num - 1000;
      }
      if (num >= 1 && num <= 40) {
        const adjustedIdx = (num - 1) % DRIVERS_LIST.length;
        const drv = DRIVERS_LIST[adjustedIdx] || DRIVERS_LIST[0];
        return {
          name: drv.name,
          vehicleName: `Ambulance ${String(num).padStart(2, "0")}`
        };
      }
    }
    
    // Default fallback
    return { name: "Raj Kumar", vehicleName: "Ambulance 01" };
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (selectedRole === "ADMIN") {
        router.push("/admin");
      } else if (selectedRole === "TELECALLER") {
        router.push("/telecaller");
      } else if (selectedRole === "DRIVER") {
        // Resolve driver from vehicleInput text
        const resolved = findDriverByVehicleInput(vehicleInput);
        localStorage.setItem("currentDriverName", resolved.name);
        localStorage.setItem("currentVehicleName", resolved.vehicleName);
        router.push("/driver");
      }
    }, 800);
  };

  const fillDemoCredentials = (role) => {
    setSelectedRole(role);
    if (role === "ADMIN") {
      setEmail("admin@resqtrack.org");
      setPassword("admin123");
    } else if (role === "TELECALLER") {
      setEmail("caller@resqtrack.org");
      setPassword("caller123");
    } else if (role === "DRIVER") {
      setVehicleInput("Ambulance 01");
      setPassword("driver123");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0d0f12] overflow-hidden px-4 sm:px-6">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/5 blur-[120px]" />

      {/* Main Container */}
      <div className="w-full max-w-[520px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-13 h-13 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
            <HeartHandshake className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-[20px] font-black tracking-widest text-white uppercase leading-none">RESQTRACK</h2>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-2">Animal Rescue Operations CRM</p>
        </div>

        {/* Role Selector Panel — 3 Roles */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => fillDemoCredentials("TELECALLER")}
            className={`py-3.5 px-3 rounded-xl border text-[11px] font-bold tracking-wide flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              selectedRole === "TELECALLER"
                ? "bg-white text-black border-white shadow-md shadow-white/5"
                : "bg-white/[0.02] text-gray-400 border-white/[0.06] hover:bg-white/[0.04]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Telecaller</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials("DRIVER")}
            className={`py-3.5 px-3 rounded-xl border text-[11px] font-bold tracking-wide flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              selectedRole === "DRIVER"
                ? "bg-white text-black border-white shadow-md shadow-white/5"
                : "bg-white/[0.02] text-gray-400 border-white/[0.06] hover:bg-white/[0.04]"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Driver</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials("ADMIN")}
            className={`py-3.5 px-3 rounded-xl border text-[11px] font-bold tracking-wide flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              selectedRole === "ADMIN"
                ? "bg-white text-black border-white shadow-md shadow-white/5"
                : "bg-white/[0.02] text-gray-400 border-white/[0.06] hover:bg-white/[0.04]"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {selectedRole !== "DRIVER" ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-gray-500 absolute left-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter email"
                  className="w-full h-12 pl-11 pr-4 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500 focus:outline-none rounded-xl text-[13px] text-white transition-all placeholder-gray-600"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Vehicle / Ambulance Designation</label>
              <div className="relative flex items-center">
                <Truck className="w-4 h-4 text-gray-500 absolute left-4" />
                <input
                  type="text"
                  required
                  value={vehicleInput}
                  onChange={(e) => setVehicleInput(e.target.value)}
                  placeholder="e.g. Ambulance 01, A-3, or HR-55-1002"
                  className="w-full h-12 pl-11 pr-4 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500 focus:outline-none rounded-xl text-[13px] text-white transition-all placeholder-gray-600 font-bold"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Security Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-500 absolute left-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-4 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-orange-500 focus:outline-none rounded-xl text-[13px] text-white transition-all placeholder-gray-600"
              />
            </div>
          </div>

          {/* Form Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 mt-2 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? "Authenticating Session..." : `Log In as ${selectedRole === "ADMIN" ? "Admin" : selectedRole === "TELECALLER" ? "Telecaller" : "Driver"}`}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Quick Notice */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center flex flex-col items-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Secure Operations Portal</span>
          <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed max-w-[300px]">
            Demo credentials are automatically set. Choose a role above and press Log In.
          </p>
        </div>
      </div>
    </div>
  );
}
