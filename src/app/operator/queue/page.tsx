"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import StatusBadge from "@/components/ui/StatusBadge";
import { MOCK_OPERATOR_QUEUE } from "@/lib/mockData";
import { FarmerBooking, QueueStatus } from "@/types/kisanSetu";
import { api } from "@/lib/api";
import { getSocket, joinMandiRoom } from "@/lib/socket";
import {
  CheckCircle2,
  Megaphone,
  Search,
  RefreshCw,
} from "lucide-react";

export default function OperatorDashboardPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [queue, setQueue] = useState<FarmerBooking[]>(MOCK_OPERATOR_QUEUE);
  const [searchQuery, setSearchQuery] = useState("");
  const [callingTokenNum, setCallingTokenNum] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQueueData = async () => {
    setIsRefreshing(true);
    const res = await api.admin.getQueue();
    setIsRefreshing(false);

    if (res.success && res.data?.queue && res.data.queue.length > 0) {
      const mapped: FarmerBooking[] = res.data.queue.map((item: any) => ({
        tokenNumber: item.tokenNumber || "KS-KRN-001",
        farmerName: item.farmerId?.name || item.farmerName || "Farmer",
        farmerNameHi: item.farmerId?.name || "किसान",
        farmerPhone: item.farmerId?.phone || "9876543210",
        centreName: item.procurementCentreId?.name || "Karnal Mandi",
        centreNameHi: "करनाल मंडी",
        district: item.procurementCentreId?.district || "Karnal",
        cropType: item.cropType || "Wheat",
        cropTypeHi: item.cropType || "गेहूं",
        estimatedQuantityQuintals: item.quantityQuintals || 50,
        bookingDate: item.bookingDate || "2026-09-20",
        slotTime: item.scheduledSlot || "09:00 AM - 10:00 AM",
        queuePosition: item.queuePosition || 1,
        peopleAhead: Math.max(0, (item.queuePosition || 1) - 1),
        estimatedWaitMinutes: item.estimatedWaitMinutes || 15,
        currentStatus: (item.status as QueueStatus) || "WAITING",
        nextActionEn: "Call to Counter",
        nextActionHi: "काउंटर पर बुलाएं",
        vehicleNo: item.vehicleNumber || "HR-05-AA-1234",
        _id: item._id,
      } as any));
      setQueue(mapped);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  // Socket.IO Listener Setup for Operator Console
  useEffect(() => {
    const socket = getSocket();
    joinMandiRoom("650000000000000000000001"); // Default Karnal hub

    const handleUpdate = () => {
      fetchQueueData();
    };

    socket.on("queue:status_update", handleUpdate);
    socket.on("queue:token_called", handleUpdate);

    return () => {
      socket.off("queue:status_update", handleUpdate);
      socket.off("queue:token_called", handleUpdate);
    };
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  const handleStatusShift = async (tokenNumber: string, nextStatus: QueueStatus) => {
    if (nextStatus === "CALLED") {
      setCallingTokenNum(tokenNumber);
      setTimeout(() => setCallingTokenNum(null), 800);
    }

    setQueue((prev) =>
      prev.map((item) =>
        item.tokenNumber === tokenNumber
          ? { ...item, currentStatus: nextStatus }
          : item
      )
    );

    // Call Backend API to update status in MongoDB
    const foundItem = queue.find((q: any) => q.tokenNumber === tokenNumber || q._id);
    if (foundItem) {
      await api.admin.updateTokenStatus((foundItem as any)._id || tokenNumber, nextStatus);
    }
  };

  const filteredQueue = queue.filter((item) =>
    item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentlyServing = queue.find(
    (q) => q.currentStatus === "WEIGHING" || q.currentStatus === "QUALITY_CHECK"
  );
  const nextToken = queue.find(
    (q) => q.currentStatus === "WAITING" || q.currentStatus === "ARRIVED"
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-5">
        {/* OPERATOR STATION SUB-HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operational Counter #1
              </span>
              <span className="text-xs text-slate-400 font-mono">• Karnal Mandi Hub</span>
              <span className="live-dot animate-pulse bg-emerald-600 ml-1" />
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Real-Time Socket Sync</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Procurement Queue Operator Console
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Expected Today</span>
              <span className="text-slate-900 font-bold">125 Farmers</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px]">In Queue</span>
              <span className="text-amber-800 font-bold">{queue.length} Active Tokens</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <button
              onClick={fetchQueueData}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 font-bold text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* PRIMARY OPERATIONAL COMMAND CONTROL HIERARCHY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. CURRENTLY SERVING */}
          <div className="public-card p-4 space-y-2 border-2 border-slate-300">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              1. CURRENTLY SERVING
            </span>
            {currentlyServing ? (
              <div>
                <div className="text-2xl font-mono font-black text-slate-900">
                  {currentlyServing.tokenNumber}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {currentlyServing.farmerName} • {currentlyServing.vehicleNo}
                </div>
                <div className="mt-2">
                  <StatusBadge status={currentlyServing.currentStatus} lang={lang} size="sm" />
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2">No active farmer at counter</div>
            )}
          </div>

          {/* 2. NEXT TOKEN IN LINE */}
          <div className="public-card p-4 space-y-2 border-2 border-slate-300">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              2. NEXT TOKEN IN LINE
            </span>
            {nextToken ? (
              <div>
                <div className="text-2xl font-mono font-black text-slate-900">
                  {nextToken.tokenNumber}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {nextToken.farmerName} • {nextToken.cropType} ({nextToken.estimatedQuantityQuintals} Qtl)
                </div>
                <div className="mt-2">
                  <StatusBadge status={nextToken.currentStatus} lang={lang} size="sm" />
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2">No upcoming waiting tokens</div>
            )}
          </div>

          {/* 3. CALL NEXT TOKEN ACTION BUTTON WITH PURPOSEFUL INTERACTION FEEDBACK */}
          <div className="public-card p-4 flex flex-col justify-between bg-slate-900 text-white rounded-xl">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                3. PRIMARY OPERATIONAL ACTION
              </span>
              <p className="text-xs text-slate-300 mt-1">
                Broadcasting real-time call to farmer phone & gate counter.
              </p>
            </div>

            <button
              onClick={() => {
                const nextWaiting = queue.find((q) => q.currentStatus === "WAITING");
                if (nextWaiting) {
                  handleStatusShift(nextWaiting.tokenNumber, "CALLED");
                } else {
                  alert("No waiting tokens in line!");
                }
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-lg shadow-md transition-all text-base flex items-center justify-center gap-2 touch-target mt-3"
            >
              <Megaphone className="w-5 h-5 text-emerald-200" />
              <span>CALL NEXT TOKEN</span>
            </button>
          </div>
        </div>

        {/* HIGH-SCANABILITY OPERATOR LIVE QUEUE TABLE WITH ROW STATE TRANSITIONS */}
        <div className="public-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-600">
              Live Mandi Waiting Queue Stream
            </h3>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search token or farmer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Token #</th>
                  <th className="py-2.5 px-3">Farmer & Contact</th>
                  <th className="py-2.5 px-3">Crop & Quantity</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Counter Action Handoff</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredQueue.map((item) => {
                  const isBeingCalled = callingTokenNum === item.tokenNumber;

                  return (
                    <tr
                      key={item.tokenNumber}
                      className={`transition-colors duration-300 ${
                        isBeingCalled ? "bg-blue-100 animate-status-shift" : "hover:bg-slate-100/60"
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-black text-sm text-slate-900">
                        {item.tokenNumber}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs">{item.farmerName}</div>
                        <div className="text-[11px] text-slate-500">{item.farmerPhone}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{item.cropType}</div>
                        <div className="font-mono text-slate-900 font-bold">{item.estimatedQuantityQuintals} Qtl</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600">{item.vehicleNo}</td>

                      <td className="py-3 px-3">
                        <StatusBadge status={item.currentStatus} lang={lang} size="sm" />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {item.currentStatus === "WAITING" && (
                            <button
                              onClick={() => handleStatusShift(item.tokenNumber, "CALLED")}
                              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded font-bold text-xs transition-transform active:scale-95"
                            >
                              CALL
                            </button>
                          )}

                          {item.currentStatus === "CALLED" && (
                            <button
                              onClick={() => handleStatusShift(item.tokenNumber, "ARRIVED")}
                              className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded font-bold text-xs transition-transform active:scale-95"
                            >
                              GATE ENTRY
                            </button>
                          )}

                          {item.currentStatus === "ARRIVED" && (
                            <button
                              onClick={() => handleStatusShift(item.tokenNumber, "WEIGHING")}
                              className="bg-purple-800 hover:bg-purple-900 text-white px-3 py-1.5 rounded font-bold text-xs transition-transform active:scale-95"
                            >
                              LOG WEIGHING
                            </button>
                          )}

                          {item.currentStatus === "WEIGHING" && (
                            <button
                              onClick={() => handleStatusShift(item.tokenNumber, "QUALITY_CHECK")}
                              className="bg-sky-800 hover:bg-sky-900 text-white px-3 py-1.5 rounded font-bold text-xs transition-transform active:scale-95"
                            >
                              QUALITY CHECK
                            </button>
                          )}

                          {item.currentStatus === "QUALITY_CHECK" && (
                            <button
                              onClick={() => handleStatusShift(item.tokenNumber, "COMPLETED")}
                              className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded font-bold text-xs transition-transform active:scale-95"
                            >
                              COMPLETE
                            </button>
                          )}

                          {item.currentStatus === "COMPLETED" && (
                            <span className="text-emerald-800 font-bold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Ready for DBT
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
