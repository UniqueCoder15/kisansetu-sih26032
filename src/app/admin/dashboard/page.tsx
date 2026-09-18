"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import {
  BarChart3,
  Building2,
  Clock,
  Download,
  IndianRupee,
  Play,
  Scale,
  TrendingUp,
  Users,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [isAnimKey, setIsAnimKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Live Admin Metrics State connected to API
  const [metrics, setMetrics] = useState({
    totalCentres: 4,
    totalFarmers: 14250,
    totalBookings: 125,
    activeQueueCount: 42,
    completedProcurements: 83,
    totalCapacityQuintals: 4500,
    currentLoadQuintals: 2410,
    capacityUtilizationPercentage: 54,
  });

  const [centresData, setCentresData] = useState<any[]>([
    {
      name: "Karnal Main Paddy Procurement Centre",
      district: "Karnal",
      waitingQueue: 42,
      capacityPct: 82,
      avgWaitMin: 28,
      status: "NORMAL",
      totalTonnage: "16,585 Qtl",
    },
    {
      name: "Gharaunda Grain Mandi",
      district: "Karnal",
      waitingQueue: 68,
      capacityPct: 94,
      avgWaitMin: 45,
      status: "LIMITED",
      totalTonnage: "3,210 Qtl",
    },
    {
      name: "Assandh Co-operative Mandi",
      district: "Karnal",
      waitingQueue: 110,
      capacityPct: 98,
      avgWaitMin: 78,
      status: "HIGH CONGESTION",
      totalTonnage: "6,100 Qtl",
    },
    {
      name: "Taraori Wheat Procurement Hub",
      district: "Karnal",
      waitingQueue: 15,
      capacityPct: 45,
      avgWaitMin: 10,
      status: "NORMAL",
      totalTonnage: "2,400 Qtl",
    },
  ]);

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    const [metricsRes, centresRes, auditRes] = await Promise.all([
      api.admin.getMetrics(),
      api.admin.getCentres(),
      api.admin.getAuditLogs(15),
    ]);
    setIsRefreshing(false);

    if (metricsRes.success && metricsRes.data) {
      setMetrics((prev) => ({
        ...prev,
        ...metricsRes.data,
      }));
      setIsAnimKey((k) => k + 1);
    }

    if (centresRes.success && centresRes.data?.centres && centresRes.data.centres.length > 0) {
      const mapped = centresRes.data.centres.map((c: any) => ({
        name: c.name,
        district: c.district,
        waitingQueue: c.activeFarmers || 12,
        capacityPct: c.dailyCapacityQuintals > 0
          ? Math.round((c.currentLoadQuintals / c.dailyCapacityQuintals) * 100)
          : 50,
        avgWaitMin: 25,
        status: c.status || "NORMAL",
        totalTonnage: `${(c.currentLoadQuintals || 450).toLocaleString()} Qtl`,
      }));
      setCentresData(mapped);
    }

    if (auditRes.success && auditRes.data?.logs) {
      setAuditLogs(auditRes.data.logs);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Socket.IO Listener Setup for Admin Real-Time Metrics & Audit Updates
  useEffect(() => {
    const socket = getSocket();

    const handleUpdate = () => {
      fetchAdminData();
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

  // Simulate Live Metric Data Update
  const handleSimulateUpdate = () => {
    setMetrics((prev) => ({
      ...prev,
      activeQueueCount: Math.max(10, prev.activeQueueCount - 3),
      currentLoadQuintals: prev.currentLoadQuintals + 450,
    }));
    setIsAnimKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-5">
        {/* RESTRAINED OFFICIAL ADMINISTRATIVE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                District Agriculture Administration
              </span>
              <span className="text-xs text-slate-400 font-mono">• Karnal Region</span>
              <span className="live-dot animate-pulse bg-emerald-600 ml-1" />
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Socket.IO Live Sync</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Procurement Operations & Compliance Audit Portal
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateUpdate}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors touch-target shadow-xs"
              title="Simulate Live Metric Update"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Update</span>
            </button>

            <button
              onClick={fetchAdminData}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors touch-target"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => alert("Exporting Procurement Operations Summary (CSV)")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors touch-target"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Summary</span>
            </button>
          </div>
        </div>

        {/* PRACTICAL OPERATIONAL KPIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="public-card p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Registered Farmers</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {metrics.totalFarmers.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">District Total</span>
          </div>

          <div className="public-card p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Today&apos;s Procured</span>
              <Scale className="w-4 h-4 text-emerald-800" />
            </div>
            <div
              key={`tonnage-${isAnimKey}`}
              className="text-xl font-extrabold text-slate-900 animate-number-update"
            >
              {metrics.currentLoadQuintals.toLocaleString()} Qtl
            </div>
            <span className="text-[10px] text-emerald-800 font-bold">{metrics.totalCentres} Active Mandis</span>
          </div>

          <div className="public-card p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Active Queue Count</span>
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <div
              key={`avgwait-${isAnimKey}`}
              className="text-xl font-extrabold text-amber-950 animate-number-update"
            >
              {metrics.activeQueueCount} Farmers
            </div>
            <span className="text-[10px] text-slate-500">Currently in process</span>
          </div>

          <div className="public-card p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Capacity Utilization</span>
              <IndianRupee className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {metrics.capacityUtilizationPercentage}%
            </div>
            <span className="text-[10px] text-slate-500">Max limit: {metrics.totalCapacityQuintals} Qtl</span>
          </div>
        </div>

        {/* MANDI MONITORING TABLE */}
        <div className="public-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Procurement Centre Capacity & Workload Monitoring</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Updated live from database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Procurement Centre</th>
                  <th className="py-2.5 px-3">Queue Length</th>
                  <th className="py-2.5 px-3">Capacity Utilization</th>
                  <th className="py-2.5 px-3">Average Wait</th>
                  <th className="py-2.5 px-3">Total Procured</th>
                  <th className="py-2.5 px-3">Congestion Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {centresData.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-100/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {c.name}
                      <span className="text-[11px] text-slate-500 font-normal block">{c.district}</span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      <span key={`q-${isAnimKey}`} className="animate-number-update inline-block">
                        {c.waitingQueue} Farmers
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full transition-all duration-500 ${
                            c.capacityPct > 90
                              ? "bg-red-600"
                              : c.capacityPct > 80
                              ? "bg-amber-600"
                              : "bg-emerald-700"
                          }`}
                          style={{ width: `${c.capacityPct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{c.capacityPct}% Capacity</span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      ~{c.avgWaitMin} mins
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-900 font-bold">{c.totalTonnage}</td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          c.status === "HEAVY_CONGESTION" || c.status === "HIGH CONGESTION"
                            ? "bg-red-100 text-red-900 border border-red-300"
                            : c.status === "BUSY" || c.status === "LIMITED"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AUDIT LOG STREAM & SYSTEM AUDIT COMPLIANCE */}
        <div className="public-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>Immutable Operational Audit Trail Stream</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium font-mono">Live MongoDB Audit Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity Type</th>
                  <th className="py-2.5 px-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log: any, idx: number) => (
                    <tr key={log._id || idx} className="hover:bg-slate-100/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {new Date(log.createdAt).toLocaleTimeString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{log.entityType}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {JSON.stringify(log.metadata || {})}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 px-3 text-center text-slate-400 italic">
                      No recent audit log entries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRACTICAL OPERATIONAL CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="public-card p-4 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              Hourly Queue Arrival Load vs Capacity
            </h4>

            <div className="h-36 w-full bg-slate-50 rounded-lg border border-slate-200 p-3 flex items-end justify-between gap-2">
              {[25, 40, 75, 95, 88, 65, 50, 42, 30].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-slate-800 rounded-t transition-all duration-500"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">{8 + i}:00</span>
                </div>
              ))}
            </div>
          </div>

          <div className="public-card p-4 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              Daily Procurement Tonnage Tally
            </h4>

            <div className="h-36 w-full bg-slate-50 rounded-lg border border-slate-200 p-3 flex items-end justify-between gap-2">
              {[50, 65, 80, 70, 90, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-amber-600 rounded-t transition-all duration-500"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-500">Day {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
