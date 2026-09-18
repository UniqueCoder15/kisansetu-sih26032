"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, Home, IndianRupee, User, Users } from "lucide-react";

interface FarmerBottomNavProps {
  lang?: "en" | "hi";
}

export default function FarmerBottomNav({ lang = "en" }: FarmerBottomNavProps) {
  const pathname = usePathname();

  // Hide bottom nav on operator and admin routes
  if (pathname.startsWith("/operator") || pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      labelEn: "Home",
      labelHi: "होम",
      icon: Home,
      isPrimaryQueue: false,
    },
    {
      href: "/farmer/book-slot",
      labelEn: "Book",
      labelHi: "बुक स्लॉट",
      icon: CalendarPlus,
      isPrimaryQueue: false,
    },
    {
      href: "/farmer/queue",
      labelEn: "Live Queue",
      labelHi: "लाइव कतार",
      icon: Users,
      isPrimaryQueue: true, // Strongest visual priority
    },
    {
      href: "/farmer/payment-status",
      labelEn: "Payments",
      labelHi: "भुगतान",
      icon: IndianRupee,
      isPrimaryQueue: false,
    },
    {
      href: "/farmer/procurement-status",
      labelEn: "Status",
      labelHi: "स्थिति",
      icon: User,
      isPrimaryQueue: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const label = lang === "hi" ? item.labelHi : item.labelEn;

          // Special styling for the HERO Queue item
          if (item.isPrimaryQueue) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5 group"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                    isActive
                      ? "bg-emerald-700 text-white ring-4 ring-emerald-100 scale-105"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <span
                  className={`text-xs mt-1 font-extrabold ${
                    isActive ? "text-emerald-800" : "text-slate-600"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors touch-target justify-center ${
                isActive ? "text-emerald-800 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-700" : "text-slate-500"}`} />
              <span className="text-[11px] mt-0.5 font-semibold tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
