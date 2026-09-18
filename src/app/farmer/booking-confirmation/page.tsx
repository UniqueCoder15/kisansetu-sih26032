"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import FarmerBottomNav from "@/components/farmer/FarmerBottomNav";
import { MOCK_ACTIVE_FARMER_BOOKING } from "@/lib/mockData";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  MapPin,
  QrCode,
  ShieldCheck,
} from "lucide-react";

export default function BookingConfirmationPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [sequenceStep, setSequenceStep] = useState<"submitted" | "confirmed" | "revealed">("submitted");
  const booking = MOCK_ACTIVE_FARMER_BOOKING;

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  // Purposeful Confirmation Sequence Transition (Submitted -> Confirmed -> Token Revealed)
  useEffect(() => {
    const t1 = setTimeout(() => setSequenceStep("confirmed"), 300);
    const t2 = setTimeout(() => setSequenceStep("revealed"), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="max-w-md md:max-w-2xl mx-auto w-full px-4 pt-5 space-y-5">
        {/* Trustworthy Official Confirmation Banner with Checkmark Reveal */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl text-center space-y-2 border border-slate-800 shadow-sm">
          {sequenceStep !== "submitted" && (
            <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center mx-auto mb-1 animate-checkmark">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          )}

          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
            {lang === "hi" ? "सफलतापूर्वक दर्ज" : "OFFICIAL RECEIPT CONFIRMED"}
          </span>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {lang === "hi" ? "आपकी खरीद टोकन जारी हो चुकी है" : "Procurement Token Issued"}
          </h1>

          <p className="text-xs text-slate-300 font-medium max-w-sm mx-auto">
            {lang === "hi"
              ? "कृपया अपने नियुक्त समय स्लॉट पर मंडी पहुंचें। SMS एसएमएस भेजा गया है।"
              : "Please report to Karnal Mandi on your scheduled slot. SMS confirmation sent."}
          </p>
        </div>

        {/* Digital Token & QR Card Reveal */}
        <div
          className={`public-card p-5 space-y-4 border-2 border-slate-300 transition-opacity duration-500 ${
            sequenceStep === "revealed" ? "opacity-100" : "opacity-30"
          }`}
        >
          {/* Token Highlight */}
          <div className="text-center pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              {lang === "hi" ? "डिजिटल टोकन संख्या" : "DIGITAL TOKEN NUMBER"}
            </span>
            <div className="text-4xl font-mono font-black text-slate-900 tracking-tight">
              {booking.tokenNumber}
            </div>
          </div>

          {/* QR Code Graphic Simulation */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="w-32 h-32 bg-white p-2 rounded-lg border border-slate-300 flex items-center justify-center">
              <QrCode className="w-28 h-28 text-slate-900" />
            </div>
            <span className="text-[11px] text-slate-500 font-mono font-semibold">
              Scan at Mandi Gate #1 for Instant Entry
            </span>
          </div>

          {/* Booking Summary Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">Procurement Centre</span>
              <span className="font-bold text-slate-900 block mt-0.5">{booking.centreName}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">Scheduled Slot</span>
              <span className="font-bold text-slate-900 block mt-0.5">{booking.slotTime}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">Crop & Quantity</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {booking.cropType} ({booking.estimatedQuantityQuintals} Qtl)
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">Queue Position</span>
              <span className="font-bold text-slate-900 block mt-0.5">
                Position #{booking.queuePosition} (~{booking.estimatedWaitMinutes}m)
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <Link
              href="/farmer/queue"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 px-4 rounded-xl transition-colors shadow-xs text-base flex items-center justify-center gap-2 touch-target"
            >
              <span>{lang === "hi" ? "मेरी लाइव कतार ट्रैक करें" : "TRACK MY QUEUE"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => alert("Token saved to offline storage / SMS sent")}
                className="py-2.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1.5 touch-target"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Save Offline</span>
              </button>

              <button
                onClick={() => alert("Directions sent to Google Maps")}
                className="py-2.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1.5 touch-target"
              >
                <MapPin className="w-4 h-4 text-slate-600" />
                <span>Directions</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <FarmerBottomNav lang={lang} />
    </div>
  );
}
