"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Inbox } from "lucide-react";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { Spinner } from "@/shared/components/ui/Spinner/Spinner";
import { EmptyState } from "@/shared/components/ui/EmptyState/EmptyState";
import { useT } from "@/shared/hooks/useT";
import { useRequestsQuery } from "@/features/requests/hooks/useRequestsData";
import { formatDateTime } from "@/features/requests/utils";
import type { RequestStatus, RequestType } from "@/features/requests/types";
import type { TranslationKey } from "@/shared/lib/i18n/translate";
import styles from "./RequestsPage.module.css";

type Filter = "all" | RequestStatus;

const FILTERS: Filter[] = ["all", "pending", "approved", "rejected"];

export function RequestsPage() {
  const { t } = useT();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("pending");
  const { data, isLoading } = useRequestsQuery(filter === "all" ? undefined : filter);
  const rows = data?.data ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("requests.title")}</h1>
        <p className={styles.subtitle}>{t("requests.subtitle")}</p>
      </header>

      <div className={styles.tabs}>
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            className={clsx(styles.tab, filter === value && styles.tabActive)}
            onClick={() => setFilter(value)}
          >
            {t(`requests.filters.${value}` as TranslationKey)}
          </button>
        ))}
      </div>

      <GlassCard className={styles.card} compact>
        {isLoading ? (
          <div className={styles.center}>
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<Inbox size={36} />} title={t("requests.empty")} />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("requests.columns.type")}</th>
                <th>{t("requests.columns.title")}</th>
                <th>{t("requests.columns.requestedBy")}</th>
                <th>{t("requests.columns.createdAt")}</th>
                <th>{t("requests.columns.status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((request) => (
                <tr
                  key={request.id}
                  className={styles.row}
                  onClick={() => router.push(`/solicitudes/${request.id}`)}
                >
                  <td>{t(`requests.types.${request.type as RequestType}` as TranslationKey)}</td>
                  <td className={styles.titleCell}>{request.title}</td>
                  <td>{request.requestedBy?.fullName ?? request.requestedBy?.email ?? "—"}</td>
                  <td>{formatDateTime(request.createdAt)}</td>
                  <td>
                    <span className={clsx(styles.badge, styles[request.status])}>
                      {t(`requests.${request.status}` as TranslationKey)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
}
