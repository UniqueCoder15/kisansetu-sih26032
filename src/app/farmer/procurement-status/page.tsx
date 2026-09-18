"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import StatusBadge from "@/components/ui/StatusBadge";
import FarmerBottomNav from "@/components/farmer/FarmerBottomNav";
import { MOCK_ACTIVE_FARMER_BOOKING } from "@/lib/mockData";
import { QueueStatus } from "@/types/kisanSetu";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  FileCheck,
  IndianRupee,
  Play,
  Scale,
  Truck,
  RefreshCw,
} from "lucide-react";

export default function ProcurementStatusPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [activeStageIndex, setActiveStageIndex] = useState(2); // Default: Quality Check
  const [booking, setBooking] = useState<any>(MOCK_ACTIVE_FARMER_BOOKING);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveStatus = async () => {
    setIsRefreshing(true);
    const res = await api.queue.getMyBookings();
    setIsRefreshing(false);

    if (res.success && res.data?.bookings && res.data.bookings.length > 0) {
      const active = res.data.bookings[0];
      setBooking({
        tokenNumber: active.tokenNumber || "KS-KRN-001-A",
        farmerName: active.farmerId?.name || "Rajinder Singh",
        cropType: active.cropType || "Wheat (PBW 550)",
        estimatedQuantityQuintals: active.quantityQuintals || 65,
        currentStatus: active.status || "QUALITY_CHECK",
      });

      const statusMap: Record<string, number> = {
        WAITING: 0,
        CALLED: 0,
        ARRIVED: 0,
        WEIGHING: 1,
        QUALITY_CHECK: 2,
        PROCUREMENT_COMPLETED: 3,
        PAYMENT_PENDING: 4,
        COMPLETED: 4,
      };

      if (statusMap[active.status] !== undefined) {
        setActiveStageIndex(statusMap[active.status]);
      }
    }
  };

  useEffect(() => {
    fetchLiveStatus();
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  const stepsList = [
    {
      id: "gate",
      titleEn: "Gate Entry Verification",
      titleHi: "गेट प्रवेश सत्यापन",
      time: "09:45 AM",
      descEn: "Vehicle HR-45-B-1024 checked in at Gate #1.",
      descHi: "वाहन HR-45-B-1024 गेट #1 पर प्रविष्ट।",
      icon: Truck,
      status: "COMPLETED" as QueueStatus,
    },
    {
      id: "weighing",
      titleEn: "Weighing Scale Bridge",
      titleHi: "धर्मकांटा तौल",
      time: "10:12 AM",
      descEn: "Gross weight 8,450 kg logged. Tare 1,950 kg. Net: 65 Quintals.",
      descHi: "सकल 8,450 किग्रा दर्ज। खाली 1,950 किग्रा। शुद्ध: 65 क्विंटल।",
      icon: Scale,
      status: "WEIGHING" as QueueStatus,
    },
    {
      id: "quality",
      titleEn: "Quality Check & Inspection",
      titleHi: "गुणवत्ता जांच एवं निरीक्षण",
      time: "In Progress",
      descEn: "Moisture content and grain purity inspection under way.",
      descHi: "नमी प्रतिशत एवं अनाज शुद्धता का परीक्षण जारी है।",
      icon: FileCheck,
      status: "QUALITY_CHECK" as QueueStatus,
    },
    {
      id: "procurement",
      titleEn: "Procurement Approval & Receipt",
      titleHi: "खरीद स्वीकृति एवं जे-फॉर्म रसीद",
      time: "Pending",
      descEn: "Generation of official digital J-Form procurement slip.",
      descHi: "आधिकारिक डिजिटल जे-फॉर्म खरीद रसीद जारी होगी।",
      icon: Award,
      status: "PROCUREMENT_COMPLETED" as QueueStatus,
    },
    {
      id: "payment",
      titleEn: "MSP Direct Payment Transfer",
      titleHi: "एमएसपी (MSP) बैंक हस्तांतरण",
      time: "Pending",
      descEn: "Direct Benefit Transfer (DBT) to your Aadhaar linked account.",
      descHi: "आपके आधार से जुड़े बैंक खाते में राशि भेजी जाएगी।",
      icon: IndianRupee,
      status: "PAYMENT_PENDING" as QueueStatus,
    },
  ];

  // Interactive Stage Advance Simulator for Motion Demonstration
  const handleAdvanceStage = () => {
    setActiveStageIndex((prev) => (prev < stepsList.length - 1 ? prev + 1 : prev));
  };

  const currentActiveStep = stepsList[activeStageIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="max-w-md md:max-w-2xl mx-auto w-full px-4 pt-4 space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/farmer/queue"
              className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors touch-target flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                {lang === "hi" ? "खरीद प्रगति की स्थिति" : "Procurement Progress Status"}
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                Token {booking.tokenNumber} • {booking.farmerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdvanceStage}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 touch-target"
              title="Simulate Next Stage"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Advance Stage</span>
            </button>

            <button
              onClick={fetchLiveStatus}
              className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors touch-target flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* PROMINENT CURRENT STAGE CARD */}
        <div className="public-card p-4 space-y-2.5 border-2 border-slate-300 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {lang === "hi" ? "वर्तमान चरण" : "CURRENT STAGE"}
            </span>
            <StatusBadge status={currentActiveStep.status} lang={lang} size="sm" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <currentActiveStep.icon className="w-5 h-5 text-emerald-800" />
              <span>{lang === "hi" ? currentActiveStep.titleHi : currentActiveStep.titleEn}</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {lang === "hi" ? currentActiveStep.descHi : currentActiveStep.descEn}
            </p>
          </div>
        </div>

        {/* VERTICAL TIMELINE STEPPER */}
        <div className="public-card p-4 space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
            {lang === "hi" ? "चरणबद्ध प्रगति समयरेखा" : "Stage Progress Timeline"}
          </h3>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {stepsList.map((step, idx) => {
              const isDone = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;

              return (
                <div key={step.id} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-800 text-white animate-checkmark"
                        : isCurrent
                        ? "bg-slate-900 text-white ring-4 ring-slate-200"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : isCurrent ? "→" : "○"}
                  </div>

                  <div className="space-y-0.5 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-bold ${
                          isCurrent
                            ? "text-slate-900 text-sm"
                            : isDone
                            ? "text-slate-800"
                            : "text-slate-400"
                        }`}
                      >
                        {lang === "hi" ? step.titleHi : step.titleEn}
                      </h4>
                      <span
                        className={`font-mono text-[11px] ${
                          isDone
                            ? "text-emerald-800 font-bold"
                            : isCurrent
                            ? "text-slate-900 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {isDone ? "Done" : isCurrent ? "Active" : step.time}
                      </span>
                    </div>

                    <p className={isCurrent ? "text-slate-700 font-medium" : "text-slate-500 text-[11px]"}>
                      {lang === "hi" ? step.descHi : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Link to Payment Status */}
        <Link
          href="/farmer/payment-status"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-colors text-xs flex items-center justify-center gap-2 touch-target"
        >
          <span>{lang === "hi" ? "भुगतान स्थिति देखें" : "View Payment Status & History"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </main>

      <FarmerBottomNav lang={lang} />
    </div>
  );
}
