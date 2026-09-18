"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import { api } from "@/lib/api";
import { LogIn, Phone, Lock, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function FarmerLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "hi">("en");

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Form Validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError(lang === "hi" ? "कृपया 10-अंकीय मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.password) {
      setError(lang === "hi" ? "कृपया अपना पासवर्ड दर्ज करें।" : "Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.auth.login(formData.phone.trim(), formData.password);
      setIsSubmitting(false);

      if (!res.success) {
        // Safe generic error message for invalid credentials
        setError(lang === "hi" ? "अमान्य मोबाइल नंबर या पासवर्ड।" : "Invalid mobile number or password.");
        return;
      }

      if (typeof window !== "undefined" && res.data?.user) {
        localStorage.setItem("kisansetu_user", JSON.stringify(res.data.user));
      }

      // Successful Login -> Store auth & redirect
      router.push("/farmer/book-slot");
    } catch (err: any) {
      setIsSubmitting(false);
      setError(lang === "hi" ? "अमान्य मोबाइल नंबर या पासवर्ड।" : "Invalid mobile number or password.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-12 flex flex-col justify-center">
        <div className="public-card p-6 space-y-6 border border-slate-300 shadow-sm bg-white rounded-2xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center mx-auto shadow-xs">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {lang === "hi" ? "किसान लॉगिन" : "Farmer Portal Login"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "hi"
                ? "अपनी मंडी टोकन एवं खरीद स्थिति देखने के लिए लॉगिन करें"
                : "Log in to manage slot bookings and live queue tracking"}
            </p>
          </div>

          {/* Validation Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {lang === "hi" ? "10-अंकीय मोबाइल नंबर" : "10-Digit Mobile Number"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="9876543210"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {lang === "hi" ? "पासवर्ड" : "Password"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Demo Credentials Banner */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Demo Farmer Credentials / परीक्षण क्रेडेंशियल:</span>
              </span>
              <p className="font-mono text-[11px] text-slate-700">
                Mobile: <strong className="text-slate-900">9876543210</strong> | Password: <strong className="text-slate-900">farmer123</strong>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 touch-target mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{lang === "hi" ? "लॉगइन हो रहा है..." : "Logging in..."}</span>
              ) : (
                <>
                  <span>{lang === "hi" ? "किसान लॉगिन करें" : "Log In to Farmer Portal"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Register */}
          <div className="pt-4 border-t border-slate-200 text-center text-xs">
            <span className="text-slate-600 font-medium">
              {lang === "hi" ? "खाता नहीं है?" : "Don't have an account?"}{" "}
            </span>
            <Link
              href="/farmer/register"
              className="font-bold text-emerald-800 hover:text-emerald-900 underline"
            >
              {lang === "hi" ? "नया पंजीकरण करें" : "Register Account"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
