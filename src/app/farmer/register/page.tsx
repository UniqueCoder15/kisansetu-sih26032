"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import { api } from "@/lib/api";
import { UserPlus, Phone, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function FarmerRegisterPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "hi">("en");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

    // 1. Frontend Validations
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError(lang === "hi" ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name (at least 2 characters).");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError(lang === "hi" ? "कृपया valid 10-अंकीय मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.");
      return;
    }

    if (formData.password.length < 6) {
      setError(lang === "hi" ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(lang === "hi" ? "पासवर्ड मेल नहीं खाते।" : "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.auth.register({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: "FARMER",
      });

      setIsSubmitting(false);

      if (!res.success) {
        if (res.error?.includes("already registered") || res.error?.includes("Validation failed")) {
          setError(lang === "hi" ? "इस मोबाइल नंबर से खाता पहले से मौजूद है।" : "An account with this mobile number already exists.");
        } else {
          setError(res.error || (lang === "hi" ? "खाता बनाने में असमर्थ। कृपया पुनः प्रयास करें।" : "Unable to create your account. Please try again."));
        }
        return;
      }

      if (typeof window !== "undefined" && res.data?.user) {
        localStorage.setItem("kisansetu_user", JSON.stringify(res.data.user));
      }

      // Successful Registration -> Redirect to Slot Booking
      router.push("/farmer/book-slot");
    } catch (err: any) {
      setIsSubmitting(false);
      setError(lang === "hi" ? "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।" : "Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header currentLang={lang} onToggleLang={toggleLang} />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 flex flex-col justify-center">
        <div className="public-card p-6 space-y-6 border border-slate-300 shadow-sm bg-white rounded-2xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center mx-auto shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {lang === "hi" ? "किसान नया खाता बनाएं" : "Create Farmer Account"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "hi"
                ? "सरकारी मंडी स्लॉट बुकिंग एवं कतार प्रबंधन सेवा"
                : "Register for Smart Procurement & Queue Scheduling"}
            </p>
          </div>

          {/* Validation Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {lang === "hi" ? "पूरा नाम" : "Full Name"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={lang === "hi" ? "उदा. राजिंदर सिंह" : "e.g. Rajinder Singh"}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all"
                />
              </div>
            </div>

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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {lang === "hi" ? "पासवर्ड की पुष्टि करें" : "Confirm Password"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 touch-target mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{lang === "hi" ? "पंजीकरण हो रहा है..." : "Creating Account..."}</span>
              ) : (
                <>
                  <span>{lang === "hi" ? "किसान पंजीकरण करें" : "Register Farmer Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Login */}
          <div className="pt-4 border-t border-slate-200 text-center text-xs">
            <span className="text-slate-600 font-medium">
              {lang === "hi" ? "पहले से खाता है?" : "Already have an account?"}{" "}
            </span>
            <Link
              href="/farmer/login"
              className="font-bold text-emerald-800 hover:text-emerald-900 underline"
            >
              {lang === "hi" ? "लॉग इन करें" : "Log In"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
