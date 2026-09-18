"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import StatusBadge from "@/components/ui/StatusBadge";
import FarmerBottomNav from "@/components/farmer/FarmerBottomNav";
import { MOCK_ACTIVE_FARMER_BOOKING, MOCK_MANDI_CENTRES } from "@/lib/mockData";
import {
  ArrowRight,
  Bell,
  CalendarPlus,
  Clock,
  Compass,
  MapPin,
  ShieldCheck,
  Truck,
  Users,
  LogIn,
  UserPlus,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function FarmerDashboard() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const booking = MOCK_ACTIVE_FARMER_BOOKING;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("kisansetu_token");
      const storedUser = localStorage.getItem("kisansetu_user");
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (e) {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="max-w-md md:max-w-3xl mx-auto w-full px-4 pt-4 space-y-4">
        {/* UNAUTHENTICATED FARMER ENTRY & ACTION CARD */}
        {!isAuthenticated ? (
          <div className="public-card p-6 space-y-5 border-2 border-emerald-700 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                  {lang === "hi" ? "सरकारी कृषि पोर्टल" : "GOVT. PROCUREMENT PORTAL"}
                </span>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {lang === "hi" ? "किसानसेतु मंडी स्लॉट बुकिंग" : "KisanSetu Mandi Token System"}
                </h1>
                <p className="text-xs text-slate-600">
                  {lang === "hi"
                    ? "कतार रहित खरीद, पारदर्शी तौल एवं सीधी डीबीटी भुगतान सेवा"
                    : "Smart Queue Scheduling, Transparent Weighing & Direct DBT Payments"}
                </p>
              </div>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{lang === "hi" ? "डिजिटल टोकन 24x7" : "Digital Token 24x7"}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{lang === "hi" ? "लाइव मंडी कतार ट्रैकिंग" : "Live Mandi Queue"}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{lang === "hi" ? "गुणवत्ता पास प्रमाणपत्र" : "Quality Assurance"}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{lang === "hi" ? "सीधा डीबीटी बैंक ट्रांसफर" : "Direct DBT Payment"}</span>
              </div>
            </div>

            {/* PROMINENT ACTION BUTTONS */}
            <div className="space-y-2.5 pt-2">
              <Link
                href="/farmer/login"
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all text-base flex items-center justify-center gap-2 touch-target"
              >
                <LogIn className="w-5 h-5" />
                <span>{lang === "hi" ? "किसान लॉगिन करें" : "Farmer Login"}</span>
              </Link>

              <Link
                href="/farmer/register"
                className="w-full bg-white hover:bg-slate-50 text-slate-900 font-extrabold py-3 px-4 rounded-xl border-2 border-slate-300 transition-all text-xs flex items-center justify-center gap-2 touch-target shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-emerald-800" />
                <span>{lang === "hi" ? "नए किसान हैं? पंजीकरण करें" : "New Farmer? Register"}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED FARMER GREETING & DASHBOARD CARD */
          <>
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {lang === "hi" ? "सत्यापित किसान रिकॉर्ड" : "Verified Farmer Account"}
                </span>
                <h1 className="text-xl font-extrabold text-slate-900">
                  {lang === "hi" ? "नमस्ते, " : "Namaste, "}
                  <span>{user?.name || (lang === "hi" ? booking.farmerNameHi : booking.farmerName)}</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user?.district || booking.district}</span>
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 font-extrabold text-sm">
                {(user?.name || "Farmer").substring(0, 2).toUpperCase()}
              </div>
            </div>

            {/* DOMINANT 2-SECOND QUEUE SUMMARY CARD */}
            <div className="public-card p-5 space-y-4 border-2 border-slate-300 bg-white rounded-2xl">
              {/* Header Row: Token Label & Status Badge */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {lang === "hi" ? "टोकन संख्या" : "ACTIVE TOKEN"}
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight mt-0.5">
                    {booking.tokenNumber}
                  </div>
                </div>
                <StatusBadge status={booking.currentStatus} lang={lang} size="md" />
              </div>

              {/* 3 DOMINANT METRICS */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    {lang === "hi" ? "कतार संख्या" : "POSITION"}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                    #{booking.queuePosition}
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    {lang === "hi" ? "आगे किसान" : "PEOPLE AHEAD"}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                    {booking.peopleAhead}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-900 uppercase block">
                    {lang === "hi" ? "अनुमानित प्रतीक्षा" : "EST. WAIT"}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-0.5">
                    ~{booking.estimatedWaitMinutes}m
                  </div>
                </div>
              </div>

              {/* LOWER VISUAL WEIGHT SECONDARY DETAILS */}
              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === "hi" ? "खरीद केंद्र:" : "Centre:"}</span>
                  <span className="font-semibold text-slate-900">
                    {lang === "hi" ? booking.centreNameHi : booking.centreName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === "hi" ? "स्लॉट एवं उपज:" : "Slot & Crop:"}</span>
                  <span className="font-semibold text-slate-900">
                    {booking.slotTime} • {booking.cropType} ({booking.estimatedQuantityQuintals} Qtl)
                  </span>
                </div>
              </div>

              {/* DOMINANT CTA BUTTONS */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/farmer/queue"
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 px-4 rounded-xl transition-colors shadow-xs text-base flex items-center justify-center gap-2 touch-target"
                >
                  <span>{lang === "hi" ? "मेरी कतार देखें" : "VIEW MY QUEUE"}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/farmer/book-slot"
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl border border-slate-300 transition-colors text-xs flex items-center justify-center gap-2 touch-target"
                >
                  <CalendarPlus className="w-4 h-4 text-slate-600" />
                  <span>{lang === "hi" ? "नया स्लॉट बुक करें" : "Book New Slot"}</span>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Recent Mandi Advisory Banner */}
        <div className="public-card p-3.5 flex items-start gap-3 bg-slate-50 rounded-xl border border-slate-200">
          <Bell className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-slate-900 block">
              {lang === "hi" ? "मंडी अद्यतन" : "Mandi Advisory"}
            </span>
            <p className="text-slate-600">
              {lang === "hi"
                ? "करनाल मंडी तौल कांटे #1 और #2 पर कार्य सुचारू रूप से चल रहा है।"
                : "Weighing bridges #1 & #2 are operating smoothly at Karnal Mandi."}
            </p>
          </div>
        </div>

        {/* Nearby Centres List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-800" />
              <span>{lang === "hi" ? "निकटतम खरीद केंद्र" : "Nearest Procurement Centres"}</span>
            </h3>
            <Link href="/farmer/book-slot" className="text-xs font-bold text-emerald-800 hover:underline">
              {lang === "hi" ? "सभी देखें" : "View All"}
            </Link>
          </div>

          <div className="space-y-2">
            {MOCK_MANDI_CENTRES.map((centre) => (
              <div
                key={centre.id}
                className="public-card p-3 flex items-center justify-between hover:border-slate-300 transition-colors bg-white rounded-xl border border-slate-200"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {lang === "hi" ? centre.nameHi : centre.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {centre.distanceKm} km away • {centre.availableSlotsCount} slots available
                  </p>
                </div>
                <Link
                  href="/farmer/book-slot"
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300"
                >
                  {lang === "hi" ? "बुक करें" : "Book"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <FarmerBottomNav lang={lang} />
    </div>
  );
}

