"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Boxes } from "lucide-react";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { Skeleton } from "@/shared/components/ui/Skeleton/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState/EmptyState";
import { useT } from "@/shared/hooks/useT";
import type { ProductsByTypeBucket } from "@/features/overview/hooks/useOverviewData";
import styles from "./ProductsByTypeChart.module.css";

interface ProductsByTypeChartProps {
  data: ProductsByTypeBucket[];
  loading: boolean;
}

export function ProductsByTypeChart({ data, loading }: ProductsByTypeChartProps) {
  const { t } = useT();
  return (
    <GlassCard className={styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t("overview.charts.productsByTypeTitle")}</h2>
      </header>

      {loading ? (
        <div className={styles.skeleton}>
          <Skeleton height={280} radius="var(--radius-md)" />
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<Boxes size={36} />}
          title={t("overview.charts.productsByTypeEmpty")}
        />
      ) : (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
              barSize={28}
            >
              <defs>
                <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="typeName"
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: "var(--border-subtle)" }}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(14, 165, 233, 0.08)" }}
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "var(--text-secondary)" }}
              />
              <Bar
                dataKey="count"
                fill="url(#barFill)"
                radius={[6, 6, 0, 0]}
                animationDuration={650}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}
