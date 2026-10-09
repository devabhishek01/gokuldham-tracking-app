"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, CheckCircle, Share, Info } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showModalGuide, setShowModalGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check standalone state
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
      setShowModalGuide(false);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    const isDismissed = sessionStorage.getItem("pwa_prompt_dismissed");
    if (!isDismissed) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === "accepted") {
          setShowBanner(false);
          setInstalledSuccess(true);
        }
        setDeferredPrompt(null);
      }).catch(() => {
        setShowModalGuide(true);
      });
    } else {
      setShowModalGuide(true);
    }
  };

  const handleDismiss = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowBanner(false);
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (isStandalone) return null;

  if (installedSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[9999] bg-emerald-600 text-white p-3.5 px-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-200" />
        <span className="text-[12.5px] font-bold">Gokuldham App successfully installed on Home Screen!</span>
      </div>
    );
  }

  return (
    <>
      {/* Floating Banner */}
      {showBanner && (
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
              type="button"
              onClick={handleInstallClick}
              className="bg-white text-orange-600 hover:bg-orange-50 px-3.5 py-2 rounded-xl text-[12px] font-black flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              {isIos ? <Share className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>Install</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-7 h-7 text-white/80 hover:text-white rounded-lg flex items-center justify-center hover:bg-white/10 transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal if Browser Doesn't Trigger Native Prompt Automatically */}
      {showModalGuide && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-[400px] w-full shadow-2xl border border-slate-100 flex flex-col gap-4 text-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-600 font-black text-[15px]">
                <Smartphone className="w-5 h-5" />
                <span>How to Install Gokuldham App</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModalGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIos ? (
              <div className="flex flex-col gap-3 text-[13px] text-slate-650 font-medium">
                <p>iOS (iPhone/iPad) Safari par app install karne ke liye:</p>
                <ol className="list-decimal pl-5 flex flex-col gap-2 font-bold text-slate-800 text-[12.5px]">
                  <li>Safari browser me Niche **Share Button (📤)** par tap karein.</li>
                  <li>Scroll karke **'Add to Home Screen'** select karein.</li>
                  <li>Top right me **'Add'** par click kar dein!</li>
                </ol>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-[13px] text-slate-650 font-medium">
                <p>Android / Chrome / Desktop par install karne ke liye:</p>
                <ol className="list-decimal pl-5 flex flex-col gap-2 font-bold text-slate-800 text-[12.5px]">
                  <li>Browser me Top-Right **3 Dots Menu (⋮)** par tap karein.</li>
                  <li>**'Install App'** ya **'Add to Home screen'** par click karein.</li>
                  <li>Confirm karke app Home screen par aakar ready ho jayegi!</li>
                </ol>
              </div>
            )}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-[11px] text-amber-800 font-semibold">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Note: PWA Installation ke liye domain par **HTTPS (SSL)** active hona zaroori hai.</span>
            </div>

            <button
              type="button"
              onClick={() => setShowModalGuide(false)}
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-[13px] transition cursor-pointer"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
