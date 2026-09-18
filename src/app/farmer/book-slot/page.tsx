"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import FarmerBottomNav from "@/components/farmer/FarmerBottomNav";
import { MOCK_MANDI_CENTRES, MOCK_TIME_SLOTS } from "@/lib/mockData";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Scale,
  Loader2,
} from "lucide-react";

export default function BookSlotPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [centres, setCentres] = useState<any[]>(MOCK_MANDI_CENTRES);
  const [selectedCentre, setSelectedCentre] = useState(MOCK_MANDI_CENTRES[0].id);
  const [selectedDate, setSelectedDate] = useState("20 Sept 2026");
  const [selectedSlot, setSelectedSlot] = useState(MOCK_TIME_SLOTS[2].id);
  const [cropType, setCropType] = useState("Paddy (PR-126)");
  const [quintals, setQuintals] = useState<number>(65);
  const [vehicleNo, setVehicleNo] = useState("HR-05-AA-1234");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication Guard: Redirect to /farmer/login if not logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("kisansetu_token");
      if (!token) {
        router.push("/farmer/login");
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchCentres = async () => {
      const res = await api.centres.getAll();
      if (res.success && res.data?.centres && res.data.centres.length > 0) {
        const mapped = res.data.centres.map((c: any) => ({
          id: c._id || c.id || c.centreCode,
          name: c.name,
          nameHi: c.name,
          district: c.district,
          distanceKm: 3.5,
          activeCounters: c.activeFarmers || 3,
          status: c.status || "NORMAL",
          availableSlotsCount: 14,
        }));
        setCentres(mapped);
        setSelectedCentre(mapped[0].id);
      }
    };
    fetchCentres();
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const selectedSlotObj = MOCK_TIME_SLOTS.find((s) => s.id === selectedSlot);
    const slotWindow = selectedSlotObj ? selectedSlotObj.timeWindow : "10:00 AM - 11:00 AM";

    const res = await api.queue.bookSlot({
      procurementCentreId: selectedCentre,
      cropType,
      quantityQuintals: quintals,
      vehicleNumber: vehicleNo,
      bookingDate: "2026-09-20",
      scheduledSlot: slotWindow,
    });

    setIsSubmitting(false);
    if (res.success && res.data?.booking) {
      if (typeof window !== "undefined") {
        localStorage.setItem("latest_booking", JSON.stringify(res.data.booking));
      }
      router.push("/farmer/booking-confirmation");
    } else {
      router.push("/farmer/booking-confirmation");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 md:pb-8 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="max-w-md md:max-w-3xl mx-auto w-full px-4 pt-4 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors touch-target flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {lang === "hi" ? "खरीद स्लॉट बुक करें" : "Book Procurement Slot"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "hi"
                ? "मंडी, तिथि एवं समय स्लॉट चुनें"
                : "Select procurement centre, date & time slot"}
            </p>
          </div>
        </div>

        {/* Step 1: Select Procurement Centre */}
        <div className="public-card p-4 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>1. {lang === "hi" ? "खरीद केंद्र चुनें" : "Select Procurement Centre"}</span>
          </label>

          <div className="space-y-2">
            {centres.map((centre) => (
              <div
                key={centre.id}
                onClick={() => setSelectedCentre(centre.id)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedCentre === centre.id
                    ? "border-emerald-700 bg-emerald-50/70"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {lang === "hi" ? centre.nameHi || centre.name : centre.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {centre.district} • {centre.distanceKm || 4.2} km away • {centre.activeCounters || 3} Active Counters
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedCentre === centre.id
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {selectedCentre === centre.id && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Date */}
        <div className="public-card p-4 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>2. {lang === "hi" ? "खरीद तिथि चुनें" : "Select Procurement Date"}</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {["19 Sept 2026", "20 Sept 2026", "21 Sept 2026"].map((d, i) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all text-center ${
                  selectedDate === d
                    ? "border-emerald-700 bg-emerald-700 text-white shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="opacity-80 text-[10px] uppercase">
                  {i === 0 ? "Today" : i === 1 ? "Tomorrow" : "Day After"}
                </div>
                <div className="text-sm mt-0.5">{d.split(" ")[0]} {d.split(" ")[1]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Select Available Time Slot & Capacity */}
        <div className="public-card p-4 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>3. {lang === "hi" ? "समय स्लॉट चुनें" : "Select Available Time Slot"}</span>
          </label>

          <div className="space-y-2.5">
            {MOCK_TIME_SLOTS.map((slot) => (
              <div
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedSlot === slot.id
                    ? "border-emerald-700 bg-emerald-50/70"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {slot.timeWindow}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        slot.crowdLevel === "Low"
                          ? "bg-emerald-100 text-emerald-800"
                          : slot.crowdLevel === "Moderate"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      Wait ~{slot.expectedWaitMin} min
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    <strong className="text-emerald-800 font-bold">{slot.availableSlots} slots available</strong> (Capacity: {slot.totalCapacity})
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedSlot === slot.id
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {selectedSlot === slot.id && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Crop Type, Estimated Quantity & Vehicle Number */}
        <div className="public-card p-4 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-700" />
            <span>4. {lang === "hi" ? "फसल का प्रकार एवं वाहन विवरण" : "Crop, Quantity & Vehicle Details"}</span>
          </label>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {lang === "hi" ? "फसल चुनें" : "Select Crop Type"}
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="Paddy (PR-126)">Paddy (PR-126) / धान</option>
                <option value="Wheat (PBW-725)">Wheat (PBW-725) / गेहूं</option>
                <option value="Maize / मक्का">Maize / मक्का</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {lang === "hi" ? "अनुमानित मात्रा (क्विंटल में)" : "Estimated Quantity (in Quintals)"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={quintals}
                  onChange={(e) => setQuintals(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold text-lg text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  min={5}
                  max={500}
                />
                <span className="font-bold text-slate-600 text-sm whitespace-nowrap bg-slate-200 px-3 py-3 rounded-xl">
                  {lang === "hi" ? "क्विंटल" : "Quintals"}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {lang === "hi" ? "वाहन नंबर" : "Tractor / Vehicle Number"}
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                placeholder="e.g. HR-05-AA-1234"
              />
            </div>
          </div>
        </div>

        {/* Confirmation Action CTA */}
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-70 text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-lg text-lg flex items-center justify-center gap-2 touch-target"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>{lang === "hi" ? "प्रसंस्करण हो रहा है..." : "Processing Booking..."}</span>
            </>
          ) : (
            <>
              <span>{lang === "hi" ? "पुष्टि करें और टोकन प्राप्त करें" : "Confirm Booking & Generate Token"}</span>
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>
      </main>

      <FarmerBottomNav lang={lang} />
    </div>
  );
}
