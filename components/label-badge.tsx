import React from "react";
import { LabelType } from "@/types/dataset";
import { ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle } from "lucide-react";

interface LabelBadgeProps {
  label: LabelType | null | undefined;
  size?: "sm" | "md" | "lg";
}

export function LabelBadge({ label, size = "md" }: LabelBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-0.5 gap-1",
    md: "text-xs sm:text-sm px-3 py-1 gap-1.5",
    lg: "text-sm sm:text-base px-3.5 py-1.5 gap-2",
  }[size];

  const iconSizes = {
    sm: "size-3",
    md: "size-3.5",
    lg: "size-4",
  }[size];

  if (!label) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-semibold tracking-wide bg-muted/80 text-muted-foreground border border-border/80 ${sizeClasses}`}
        title="Đánh giá mặc định chưa được chọn (null)"
      >
        <HelpCircle className={`${iconSizes} shrink-0 text-muted-foreground/80`} />
        CHƯA ĐÁNH GIÁ
      </span>
    );
  }

  switch (label) {
    case "SAFE":
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
        >
          <ShieldCheck className={`${iconSizes} shrink-0`} />
          SAFE
        </span>
      );
    case "OFFENSIVE":
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 ${sizeClasses}`}
        >
          <AlertTriangle className={`${iconSizes} shrink-0`} />
          OFFENSIVE
        </span>
      );
    case "HATE":
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold tracking-wide bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          <ShieldAlert className={`${iconSizes} shrink-0`} />
          HATE
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full font-bold bg-muted text-foreground border border-border ${sizeClasses}`}
        >
          {label}
        </span>
      );
  }
}
