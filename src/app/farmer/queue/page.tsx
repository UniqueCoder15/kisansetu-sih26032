"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import StatusBadge from "@/components/ui/StatusBadge";
import FarmerBottomNav from "@/components/farmer/FarmerBottomNav";
import { MOCK_ACTIVE_FARMER_BOOKING } from "@/lib/mockData";
import { QueueStatus } from "@/types/kisanSetu";
import { api } from "@/lib/api";
import { getSocket, joinMandiRoom, joinFarmerRoom } from "@/lib/socket";
import {
  ArrowRight,
  Clock,
  Megaphone,
  Play,
  RefreshCw,
  Scale,
  UserCheck,
  Users,
} from "lucide-react";

export default function LiveQueuePage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnimKey, setIsAnimKey] = useState(0);

  // Live Queue State connected to Backend API & Socket.IO
  const [tokenNumber, setTokenNumber] = useState(MOCK_ACTIVE_FARMER_BOOKING.tokenNumber);
  const [position, setPosition] = useState(8);
  const [peopleAhead, setPeopleAhead] = useState(7);
  const [waitMinutes, setWaitMinutes] = useState(31);
  const [currentStatus, setCurrentStatus] = useState<QueueStatus>("WAITING");
  const [activeMandiId, setActiveMandiId] = useState<string>("");

  const fetchLiveBooking = async () => {
    setIsRefreshing(true);
    const res = await api.queue.getMyBookings();
    setIsRefreshing(false);

    if (res.success && res.data?.bookings && res.data.bookings.length > 0) {
      const active = res.data.bookings[0];
      setTokenNumber(active.tokenNumber || "KS-KRN-001-A");
      setPosition(active.queuePosition || 1);
      setPeopleAhead(Math.max(0, (active.queuePosition || 1) - 1));
      setWaitMinutes(active.estimatedWaitMinutes || 25);
      setCurrentStatus((active.status as QueueStatus) || "WAITING");
      setIsAnimKey((k) => k + 1);

      if (active.procurementCentreId) {
        const centreId = typeof active.procurementCentreId === "object" ? active.procurementCentreId._id : active.procurementCentreId;
        setActiveMandiId(centreId);
      }
    }
  };

  useEffect(() => {
    fetchLiveBooking();
  }, []);

  // Socket.IO Real-Time Listener Setup
  useEffect(() => {
    const socket = getSocket();

    if (activeMandiId) {
      joinMandiRoom(activeMandiId);
    }

    // Subscribe to Socket events
    const handleStatusUpdate = (payload: any) => {
      console.log("⚡ [Real-time Socket] queue:status_update received:", payload);
      fetchLiveBooking();
    };

    const handleTokenCalled = (payload: any) => {
      console.log("⚡ [Real-time Socket] queue:token_called received:", payload);
      fetchLiveBooking();
    };

    const handlePositionSync = (payload: any) => {
      if (payload.positionAhead !== undefined) {
        setPeopleAhead(payload.positionAhead);
        setPosition(payload.positionAhead + 1);
      }
      if (payload.estimatedWaitMinutes !== undefined) {
        setWaitMinutes(payload.estimatedWaitMinutes);
      }
      setIsAnimKey((k) => k + 1);
    };

    socket.on("queue:status_update", handleStatusUpdate);
    socket.on("queue:token_called", handleTokenCalled);
    socket.on("queue:position_sync", handlePositionSync);

    return () => {
      socket.off("queue:status_update", handleStatusUpdate);
      socket.off("queue:token_called", handleTokenCalled);
      socket.off("queue:position_sync", handlePositionSync);
    };
  }, [activeMandiId]);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  // Simulate Live Queue Progress (Demo Helper)
  const handleSimulateProgress = () => {
    if (position > 1) {
      setPosition((p) => p - 1);
      setPeopleAhead((pa) => Math.max(0, pa - 1));
      setWaitMinutes((w) => Math.max(2, w - 7));
      setIsAnimKey((k) => k + 1);
    }
  };

  // Simulate Called to Counter Status Shift
  const handleSimulateCalled = () => {
    setCurrentStatus("CALLED");
    setPosition(1);
    setPeopleAhead(0);
    setWaitMinutes(0);
    setIsAnimKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 md:pb-8 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="max-w-md md:max-w-3xl mx-auto w-full px-4 pt-4 space-y-4">
        {/* Automatic Position Update Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-800" />
              <span>{lang === "hi" ? "लाइव कतार ट्रैकर" : "Live Queue Tracker"}</span>
            </h1>
            <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="live-dot animate-pulse bg-emerald-600" />
              <span>
                {lang === "hi"
                  ? "आपकी कतार स्थिति स्वतः अद्यतन होती है (Socket.IO Live)"
                  : "Live Socket.IO Auto-Sync Active"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateProgress}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1 touch-target shadow-xs"
              title="Simulate Queue Movement"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Simulate Step</span>
            </button>

            <button
              onClick={fetchLiveBooking}
              className="p-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs touch-target flex items-center justify-center"
              aria-label="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* HERO QUEUE CARD */}
        <div
          className={`public-card p-5 space-y-5 border-2 transition-all duration-300 ${
            currentStatus === "CALLED" ? "border-blue-500 bg-blue-50/40 animate-status-shift" : "border-slate-300"
          }`}
        >
          {/* Header Row: Token & Status */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                YOUR TOKEN
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 tracking-tight mt-0.5">
                {tokenNumber}
              </div>
            </div>
            <StatusBadge status={currentStatus} lang={lang} size="md" />
          </div>

          {/* 3 DOMINANT METRICS */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* 1. POSITION */}
            <div className="p-3 bg-slate-900 text-white rounded-xl">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-bold uppercase mb-0.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>POSITION</span>
              </div>
              <div
                key={`pos-${isAnimKey}`}
                className="text-2xl sm:text-3xl font-black text-amber-400 animate-number-update"
              >
                #{position}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">In line</span>
            </div>

            {/* 2. PEOPLE AHEAD */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600 font-bold uppercase mb-0.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>AHEAD</span>
              </div>
              <div
                key={`ahead-${isAnimKey}`}
                className="text-2xl sm:text-3xl font-black text-slate-900 animate-number-update"
              >
                {peopleAhead}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Farmers</span>
            </div>

            {/* 3. ESTIMATED WAIT */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-900 font-bold uppercase mb-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>EST. WAIT</span>
              </div>
              <div
                key={`wait-${isAnimKey}`}
                className="text-2xl sm:text-3xl font-black text-amber-900 animate-number-update"
              >
                ~{waitMinutes}m
              </div>
              <span className="text-[10px] text-amber-800 block mt-0.5">Minutes</span>
            </div>
          </div>

          {/* Currently Processing Banner */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">
                  {lang === "hi" ? "वर्तमान में बुलाया गया:" : "Currently Processing:"}
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  Token KS-KRN-001-A (Tractor HR-05-AA-1234)
                </span>
              </div>
            </div>
            <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold text-[11px]">
              Gate #1
            </span>
          </div>

          {currentStatus === "WAITING" && (
            <div className="pt-1 text-center">
              <button
                onClick={handleSimulateCalled}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center justify-center gap-1 mx-auto"
              >
                <span>[ Demo: Trigger Counter Call ]</span>
              </button>
            </div>
          )}
        </div>

        {/* Link to Procurement Progress Timeline */}
        <Link
          href="/farmer/procurement-status"
          className="public-card p-3.5 flex items-center justify-between hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Scale className="w-4 h-4 text-emerald-800" />
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                {lang === "hi" ? "खरीद प्रक्रिया चरण समयरेखा" : "View Procurement Progress Timeline"}
              </span>
              <span className="text-[11px] text-slate-500">
                Gate Entry $\rightarrow$ Weighing $\rightarrow$ Quality $\rightarrow$ Payment
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </main>

      <FarmerBottomNav lang={lang} />
    </div>
  );
}
