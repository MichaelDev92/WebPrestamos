"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { MoreVertical, Pencil, Search, Trash2 } from "lucide-react";
import { Popover } from "@/shared/components/ui/Popover/Popover";
import { useT } from "@/shared/hooks/useT";
import type { Product } from "@/features/products/types";
import styles from "./ProductActionsMenu.module.css";

interface ProductActionsMenuProps {
  product: Product;
  onDetails: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  /** Si es false, solo muestra "Ver detalles" (no dueño / no superadmin). */
  canModify?: boolean;
}

/** Menú de acciones tipo kebab (3 puntos) para las tarjetas pequeñas. */
export function ProductActionsMenu({
  product,
  onDetails,
  onEdit,
  onDelete,
  canModify = true,
}: ProductActionsMenuProps) {
  const { t } = useT();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const run = (fn: (product: Product) => void) => {
    setOpen(false);
    fn(product);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t("products.columns.actions")}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreVertical size={16} />
      </button>

      <Popover anchorRef={triggerRef} open={open} onClose={() => setOpen(false)} matchWidth={false}>
        <div className={styles.menu}>
          <button type="button" className={styles.item} onClick={() => run(onDetails)}>
            <Search size={14} />
            {t("products.card.details")}
          </button>
          {canModify && (
            <>
              <button type="button" className={styles.item} onClick={() => run(onEdit)}>
                <Pencil size={14} />
                {t("common.actions.edit")}
              </button>
              <button
                type="button"
                className={clsx(styles.item, styles.danger)}
                onClick={() => run(onDelete)}
              >
                <Trash2 size={14} />
                {t("common.actions.delete")}
              </button>
            </>
          )}
        </div>
      </Popover>
    </>
  );
}
