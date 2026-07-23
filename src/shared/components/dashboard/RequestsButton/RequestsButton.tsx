"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { ClipboardList } from "lucide-react";
import { Popover } from "@/shared/components/ui/Popover/Popover";
import { useT } from "@/shared/hooks/useT";
import { useRequests } from "@/features/requests/context/RequestsProvider";
import { useRequestsQuery } from "@/features/requests/hooks/useRequestsData";
import { formatDateTime } from "@/features/requests/utils";
import type { RequestType } from "@/features/requests/types";
import type { TranslationKey } from "@/shared/lib/i18n/translate";
import styles from "./RequestsButton.module.css";

/** Bandeja de solicitudes del navbar (solo admin/superadmin). Badge = pendientes. */
export function RequestsButton() {
  const { t } = useT();
  const router = useRouter();
  const { isResolver, pendingCount } = useRequests();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // Carga las pendientes solo cuando el panel está abierto.
  const { data } = useRequestsQuery("pending", open);
  const pending = data?.data ?? [];

  if (!isResolver) return null;

  const goTo = (id: string) => {
    setOpen(false);
    router.push(`/solicitudes/${id}`);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={clsx(styles.trigger, open && styles.open)}
        aria-label={t("requests.inbox")}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <ClipboardList size={18} />
        {pendingCount > 0 && (
          <span className={styles.badge}>{pendingCount > 99 ? "99+" : pendingCount}</span>
        )}
      </button>

      <Popover anchorRef={triggerRef} open={open} onClose={() => setOpen(false)} matchWidth={false}>
        <div className={styles.panel}>
          <header className={styles.header}>
            <span className={styles.headerTitle}>{t("requests.inbox")}</span>
          </header>

          {pending.length === 0 ? (
            <div className={styles.empty}>{t("requests.emptyPending")}</div>
          ) : (
            <ul className={styles.list}>
              {pending.map((request) => (
                <li key={request.id}>
                  <button type="button" className={styles.item} onClick={() => goTo(request.id)}>
                    <span className={styles.itemBody}>
                      <span className={styles.itemType}>
                        {t(`requests.types.${request.type as RequestType}` as TranslationKey)}
                      </span>
                      <span className={styles.itemTitle}>{request.title}</span>
                      <span className={styles.itemMeta}>
                        {request.requestedBy?.fullName ?? request.requestedBy?.email ?? "—"} ·{" "}
                        {formatDateTime(request.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <footer className={styles.footer}>
            <Link href="/solicitudes" onClick={() => setOpen(false)}>
              {t("requests.viewAll")}
            </Link>
          </footer>
        </div>
      </Popover>
    </>
  );
}
