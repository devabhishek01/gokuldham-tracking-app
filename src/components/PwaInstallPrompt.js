"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, CheckCircle, Share } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if app is already running in standalone PWA mode
    const inStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");
      
    setIsStandalone(inStandalone);
    if (inStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent || "";
    const isIosDevice = /iPhone|iPad|iPod/i.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for Chrome / Edge / Android install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowBanner(false);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if user dismissed prompt in this session
    const isDismissed = sessionStorage.getItem("pwa_prompt_dismissed");
    if (!isDismissed) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      alert("iOS par Install karne ke liye:\n1. Safari me Share icon (📤) par tap karein\n2. 'Add to Home Screen' select karein!");
    } else {
      alert("App install karne ke liye Browser Menu (3 Dots ⋮) par tap karke 'Install App' ya 'Add to Home Screen' select karein!");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (isStandalone) return null;

  if (installedSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[9999] bg-emerald-600 text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-200" />
        <span className="text-[12.5px] font-bold">Gokuldham App Home Screen par successfully install ho gaya!</span>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-[420px] z-[9999] bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-3.5 px-4 rounded-2xl shadow-2xl border border-orange-400/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-white animate-bounce" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-black tracking-tight flex items-center gap-1.5 truncate">
            Install Gokuldham App
            <span className="bg-white/25 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full flex-shrink-0">PWA</span>
          </span>
          <span className="text-[11px] text-orange-100 font-medium leading-tight truncate">
            {isIos
              ? "Share (📤) ➔ 'Add to Home Screen' select karein"
              : "Direct Mobile / Desktop App Install Karein"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-white text-orange-600 hover:bg-orange-50 px-3.5 py-2 rounded-xl text-[12px] font-black flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
        >
          {isIos ? <Share className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>Install</span>
        </button>

        <button
          onClick={handleDismiss}
          className="w-7 h-7 text-white/80 hover:text-white rounded-lg flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
