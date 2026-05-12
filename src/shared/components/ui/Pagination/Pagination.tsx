"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const { t } = useT();
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const canPrev = page > 1 && !disabled;
  const canNext = page < totalPages && !disabled;

  return (
    <div className={styles.wrap}>
      <span className={styles.summary}>
        {t("common.pagination.showing")} <strong>{from}</strong>–<strong>{to}</strong>{" "}
        {t("common.pagination.of")} <strong>{total}</strong> {t("common.pagination.results")}
      </span>

      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          iconLeft={<ChevronLeft size={14} />}
          aria-label={t("common.pagination.previous")}
        >
          {t("common.pagination.previous")}
        </Button>
        <span className={clsx(styles.pageLabel)}>
          {t("common.pagination.page")} <strong>{page}</strong> {t("common.pagination.of")}{" "}
          <strong>{totalPages || 1}</strong>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          iconRight={<ChevronRight size={14} />}
          aria-label={t("common.pagination.next")}
        >
          {t("common.pagination.next")}
        </Button>
      </div>
    </div>
  );
}
