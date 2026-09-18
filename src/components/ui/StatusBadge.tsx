"use client";

import { QueueStatus } from "@/types/kisanSetu";
import { STATUS_MAP } from "@/lib/statusConfig";
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  Hourglass,
  Megaphone,
  Scale,
} from "lucide-react";

interface StatusBadgeProps {
  status: QueueStatus;
  lang?: "en" | "hi";
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({
  status,
  lang = "en",
  size = "md",
}: StatusBadgeProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.WAITING;

  // Icon mapping
  const renderIcon = () => {
    const iconProps = {
      className: size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4",
    };
    switch (config.iconName) {
      case "Clock":
        return <Clock {...iconProps} />;
      case "Megaphone":
        return <Megaphone {...iconProps} />;
      case "CheckCircle2":
        return <CheckCircle2 {...iconProps} />;
      case "Scale":
        return <Scale {...iconProps} />;
      case "FileCheck":
        return <FileCheck {...iconProps} />;
      case "Award":
        return <Award {...iconProps} />;
      case "Hourglass":
        return <Hourglass {...iconProps} />;
      case "BadgeCheck":
        return <BadgeCheck {...iconProps} />;
      case "AlertTriangle":
        return <AlertTriangle {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const label = lang === "hi" ? config.labelHi : config.labelEn;

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-0.5 text-xs gap-1.5"
      : size === "lg"
      ? "px-4 py-2 text-base font-bold gap-2.5"
      : "px-3 py-1 text-sm font-semibold gap-2";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.fgColor,
        borderColor: config.borderColor,
      }}
    >
      {renderIcon()}
      <span>{label}</span>
    </span>
  );
}
