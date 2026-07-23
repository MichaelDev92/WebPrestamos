"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, Check, X } from "lucide-react";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { Button } from "@/shared/components/ui/Button/Button";
import { Spinner } from "@/shared/components/ui/Spinner/Spinner";
import { EmptyState } from "@/shared/components/ui/EmptyState/EmptyState";
import { useT } from "@/shared/hooks/useT";
import { useRequests } from "@/features/requests/context/RequestsProvider";
import { useRequestQuery } from "@/features/requests/hooks/useRequestsData";
import { formatDateTime, formatResponseTime } from "@/features/requests/utils";
import type { RequestStatus, RequestType } from "@/features/requests/types";
import type { TranslationKey } from "@/shared/lib/i18n/translate";
import { ApproveModal } from "@/features/requests/components/ApproveModal/ApproveModal";
import { RejectModal } from "@/features/requests/components/RejectModal/RejectModal";
import styles from "./RequestDetail.module.css";

interface RequestDetailProps {
  id: string;
}

function statusLabelKey(status: RequestStatus): TranslationKey {
  return `requests.${status}` as TranslationKey;
}

export function RequestDetail({ id }: RequestDetailProps) {
  const { t } = useT();
  const { isResolver } = useRequests();
  const { data: request, isLoading, isError } = useRequestQuery(id);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const backLink = (
    <Link href="/solicitudes" className={styles.back}>
      <ArrowLeft size={16} />
      <span>{t("requests.backToList")}</span>
    </Link>
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        {backLink}
        <div className={styles.center}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className={styles.page}>
        {backLink}
        <EmptyState title={t("requests.loadError")} />
      </div>
    );
  }

  const typeLabel = t(`requests.types.${request.type as RequestType}` as TranslationKey);
  const isPending = request.status === "pending";

  return (
    <div className={styles.page}>
      {backLink}

      <GlassCard className={styles.card}>
        <header className={styles.header}>
          <div>
            <span className={styles.nature}>{typeLabel}</span>
            <h1 className={styles.title}>{request.title}</h1>
          </div>
          <span className={clsx(styles.badge, styles[request.status])}>
            {t(statusLabelKey(request.status))}
          </span>
        </header>

        {request.description && <p className={styles.description}>{request.description}</p>}

        <dl className={styles.grid}>
          <div className={styles.field}>
            <dt>{t("requests.detail.requestedBy")}</dt>
            <dd>{request.requestedBy?.fullName ?? request.requestedBy?.email ?? "—"}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t("requests.detail.createdAt")}</dt>
            <dd>{formatDateTime(request.createdAt)}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t("requests.detail.resolvedBy")}</dt>
            <dd>{request.resolvedBy?.fullName ?? request.resolvedBy?.email ?? "—"}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t("requests.detail.resolvedAt")}</dt>
            <dd>{formatDateTime(request.resolvedAt)}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t("requests.detail.responseTime")}</dt>
            <dd>{formatResponseTime(request.responseTimeMs)}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t("requests.detail.nature")}</dt>
            <dd>{typeLabel}</dd>
          </div>
          <div className={clsx(styles.field, styles.fieldWide)}>
            <dt>{t("requests.detail.resolutionNote")}</dt>
            <dd>{request.resolutionNote || t("requests.detail.noNote")}</dd>
          </div>
        </dl>

        {isPending && isResolver ? (
          <footer className={styles.actions}>
            <Button variant="danger" iconLeft={<X size={16} />} onClick={() => setRejectOpen(true)}>
              {t("requests.actions.reject")}
            </Button>
            <Button iconLeft={<Check size={16} />} onClick={() => setApproveOpen(true)}>
              {t("requests.actions.approve")}
            </Button>
          </footer>
        ) : isPending ? (
          <p className={styles.pendingHint}>{t("requests.detail.pendingHint")}</p>
        ) : null}
      </GlassCard>

      <ApproveModal open={approveOpen} onClose={() => setApproveOpen(false)} request={request} />
      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} request={request} />
    </div>
  );
}
