"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import StatusBadge from "@/components/ui/StatusBadge";
import FarmerBottomNav from "@/components/farmer/FarmerBottomNav";
import { MOCK_ACTIVE_FARMER_BOOKING } from "@/lib/mockData";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Hourglass,
  RefreshCw,
} from "lucide-react";

export default function PaymentStatusPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [paymentData, setPaymentData] = useState({
    amount: 150800,
    cropType: "Wheat (PBW 550)",
    quantityQuintals: 65,
    mspRate: 2320,
    utr: "SBIN-DBT-2026-98124012",
    status: "PAYMENT_PENDING",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPaymentDetails = async () => {
    setIsRefreshing(true);
    const res = await api.payments.getMyPayments();
    setIsRefreshing(false);

    if (res.success && res.data?.payments && res.data.payments.length > 0) {
      const p = res.data.payments[0];
      const proc = p.procurementId || {};
      setPaymentData({
        amount: p.amount || 150800,
        cropType: proc.crop || "Wheat (PBW 550)",
        quantityQuintals: proc.quantity || 65,
        mspRate: proc.ratePerQuintal || 2320,
        utr: p.transactionReference || "SBIN-DBT-2026-98124012",
        status: p.status || "PAYMENT_PENDING",
      });
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 md:pb-8 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="max-w-md md:max-w-2xl mx-auto w-full px-4 pt-4 space-y-5">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/farmer/procurement-status"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors touch-target flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                {lang === "hi" ? "सरकारी एमएसपी भुगतान रिकॉर्ड" : "Government MSP Payment Record"}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Direct Benefit Transfer (DBT) • National Procurement Portal
              </p>
            </div>
          </div>

          <button
            onClick={fetchPaymentDetails}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* GOVERNMENT OFFICIAL PROCUREMENT RECEIPT CARD */}
        <div className="public-card p-6 space-y-5 border-2 border-emerald-700/30">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">TOTAL PAYABLE VALUE</span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-900 tracking-tight flex items-center gap-1">
                <span>₹{paymentData.amount.toLocaleString()}</span>
              </div>
            </div>
            <StatusBadge status={paymentData.status as any} lang={lang} size="md" />
          </div>

          {/* Breakdown Table */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>{lang === "hi" ? "खरीद गणना विवरण" : "Procurement Calculation Tally"}</span>
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Crop Type:</span>
                <span className="font-bold text-slate-900">{paymentData.cropType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Accepted Net Weight:</span>
                <span className="font-mono font-bold text-slate-900">{paymentData.quantityQuintals} Quintals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Government MSP Rate:</span>
                <span className="font-mono font-bold text-slate-900">₹{paymentData.mspRate.toLocaleString()} / Quintal</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-900">Total Net Disbursal:</span>
                <span className="font-mono font-black text-emerald-900 text-base">₹{paymentData.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bank Account & Transaction UTR Details */}
          <div className="space-y-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 border-b border-emerald-200 pb-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>{lang === "hi" ? "आधार से जुड़ा बैंक खाता" : "Aadhaar Linked Bank Account"}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Bank Name:</span>
                <span className="font-bold">State Bank of India (Karnal Main Branch)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Account Number:</span>
                <span className="font-mono font-bold">XXXX-XXXX-4412</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Transaction Reference UTR:</span>
                <span className="font-mono font-bold text-emerald-900">
                  {paymentData.utr}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Progression Timeline */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === "hi" ? "भुगतान प्रगति समयरेखा" : "DBT Payment Timeline"}
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">J-Form Approved & Disbursal Initiated</span>
                  <span className="text-slate-500 text-[11px]">19 Sept 2026 • 10:30 AM</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <Hourglass className="w-5 h-5 text-amber-700 shrink-0 animate-spin" />
                <div>
                  <span className="font-bold text-amber-900 block">PFMS / Bank Clearing Processing</span>
                  <span className="text-amber-800 text-[11px]">Estimated credit within 24 hours</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                <BadgeCheck className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <span className="font-bold block">Funds Credited to Bank Account</span>
                  <span className="text-[11px]">Pending Bank Settlement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Official Receipt Action */}
          <button
            onClick={() => alert("Downloading Official Government Procurement Receipt (J-Form PDF)")}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 touch-target"
          >
            <Download className="w-4 h-4" />
            <span>{lang === "hi" ? "सरकारी जे-फॉर्म रसीद डाउनलोड करें" : "Download Official J-Form Receipt"}</span>
          </button>
        </div>
      </main>

      <FarmerBottomNav lang={lang} />
    </div>
  );
}
