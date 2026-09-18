"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Languages, Sprout, LogIn, UserPlus, LogOut, User, CalendarPlus, Users, IndianRupee, FileText } from "lucide-react";

interface HeaderProps {
  currentLang: "en" | "hi";
  onToggleLang: () => void;
}

export default function Header({ currentLang, onToggleLang }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string; phone?: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("kisansetu_token");
      localStorage.removeItem("kisansetu_user");
    }
    setIsAuthenticated(false);
    setUser(null);
    router.push("/farmer/login");
  };

  const isOperator = pathname.startsWith("/operator");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Official Portal Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {currentLang === "hi"
                ? "भारत सरकार • राष्ट्रीय कृषि खरीद पोर्टल (किसानसेतु)"
                : "Govt. of India • KisanSetu National Procurement Portal"}
            </span>
          </div>

          {/* Role View Navigation Bar for Demo */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400 hidden sm:inline">Role View:</span>
            <Link
              href="/"
              className={`px-2 py-0.5 rounded ${
                !isOperator && !isAdmin
                  ? "bg-emerald-700 text-white font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Farmer
            </Link>
            <Link
              href="/operator/queue"
              className={`px-2 py-0.5 rounded ${
                isOperator
                  ? "bg-emerald-700 text-white font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Operator
            </Link>
            <Link
              href="/admin/dashboard"
              className={`px-2 py-0.5 rounded ${
                isAdmin
                  ? "bg-emerald-700 text-white font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                KisanSetu
              </span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                किसानसेतु
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
              {currentLang === "hi"
                ? "स्मार्ट मंडी टोकन एवं कतार प्रबंधन"
                : "Smart Procurement & Queue Management"}
            </p>
          </div>
        </Link>

        {/* Authenticated Farmer Desktop Navigation Links */}
        {isAuthenticated && !isOperator && !isAdmin && (
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
            <Link
              href="/farmer/book-slot"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === "/farmer/book-slot"
                  ? "bg-emerald-50 text-emerald-800 font-extrabold"
                  : "text-slate-600 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <CalendarPlus className="w-4 h-4 text-emerald-700" />
              <span>{currentLang === "hi" ? "स्लॉट बुक" : "Book Slot"}</span>
            </Link>

            <Link
              href="/farmer/queue"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === "/farmer/queue"
                  ? "bg-emerald-50 text-emerald-800 font-extrabold"
                  : "text-slate-600 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span>{currentLang === "hi" ? "लाइव कतार" : "Live Queue"}</span>
            </Link>

            <Link
              href="/farmer/procurement-status"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === "/farmer/procurement-status"
                  ? "bg-emerald-50 text-emerald-800 font-extrabold"
                  : "text-slate-600 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>{currentLang === "hi" ? "खरीद स्थिति" : "Procurement"}</span>
            </Link>

            <Link
              href="/farmer/payment-status"
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                pathname === "/farmer/payment-status"
                  ? "bg-emerald-50 text-emerald-800 font-extrabold"
                  : "text-slate-600 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>{currentLang === "hi" ? "भुगतान स्थिति" : "Payment Status"}</span>
            </Link>
          </nav>
        )}

        {/* Right Action Area */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors touch-target"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>{currentLang === "hi" ? "EN" : "हिंदी"}</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs transition-colors touch-target flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 p-3 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <span>{currentLang === "hi" ? "नवीनतम सूचनाएँ" : "Recent Notifications"}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                    1 New
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">
                    {currentLang === "hi" ? "कतार अद्यतन" : "Queue Update"}
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    {currentLang === "hi"
                      ? "टोकन PB-KHA-024: 7 किसान आगे हैं। अनुमानित प्रतीक्षा ~31 मिनट।"
                      : "Token PB-KHA-024: 7 farmers ahead of you. Est. wait ~31 mins."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* UNAUTHENTICATED FARMER: VISIBLE LOGIN & REGISTER BUTTONS */}
          {!isAuthenticated && !isOperator && !isAdmin && (
            <div className="flex items-center gap-1.5">
              <Link
                href="/farmer/login"
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>{currentLang === "hi" ? "लॉगिन" : "Login"}</span>
              </Link>
              <Link
                href="/farmer/register"
                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{currentLang === "hi" ? "पंजीकरण" : "Register"}</span>
              </Link>
            </div>
          )}

          {/* AUTHENTICATED FARMER: PROFILE INDICATOR & LOGOUT BUTTON */}
          {isAuthenticated && !isOperator && !isAdmin && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span className="truncate max-w-[100px]">{user?.name || "Farmer"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-extrabold flex items-center gap-1 transition-colors"
                title="Logout / लॉगआउट करें"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden sm:inline">{currentLang === "hi" ? "लॉगआउट" : "Logout"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

