"use client";

import type { ReactNode } from "react";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { Skeleton } from "@/shared/components/ui/Skeleton/Skeleton";
import styles from "./KpiCard.module.css";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  loading?: boolean;
}

export function KpiCard({ label, value, icon, hint, loading = false }: KpiCardProps) {
  return (
    <GlassCard glow className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.value}>
        {loading ? <Skeleton width={120} height={28} /> : value}
      </div>
      {hint && !loading && <p className={styles.hint}>{hint}</p>}
    </GlassCard>
  );
}
