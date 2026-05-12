"use client";

import { Boxes, PackageCheck, Wallet } from "lucide-react";
import { useT } from "@/shared/hooks/useT";
import { formatCurrency, formatNumber } from "@/shared/lib/format/format";
import { useOverviewData } from "@/features/overview/hooks/useOverviewData";
import { KpiCard } from "@/features/overview/components/KpiCard/KpiCard";
import { ProductsByTypeChart } from "@/features/overview/components/ProductsByTypeChart/ProductsByTypeChart";
import styles from "./OverviewPage.module.css";

export function OverviewPage() {
  const { t } = useT();
  const { metrics, isLoading } = useOverviewData();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("overview.title")}</h1>
        <p className={styles.subtitle}>{t("overview.subtitle")}</p>
      </header>

      <section className={styles.kpis}>
        <KpiCard
          label={t("overview.kpis.activeProducts")}
          icon={<PackageCheck size={18} />}
          value={formatNumber(metrics.activeProducts)}
          loading={isLoading}
        />
        <KpiCard
          label={t("overview.kpis.totalStock")}
          icon={<Boxes size={18} />}
          value={formatNumber(metrics.totalStock)}
          loading={isLoading}
        />
        <KpiCard
          label={t("overview.kpis.inventoryValue")}
          icon={<Wallet size={18} />}
          value={formatCurrency(metrics.inventoryValue)}
          loading={isLoading}
        />
      </section>

      <ProductsByTypeChart data={metrics.productsByType} loading={isLoading} />
    </div>
  );
}
