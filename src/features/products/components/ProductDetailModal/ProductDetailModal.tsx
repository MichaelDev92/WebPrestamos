"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal/Modal";
import { useT } from "@/shared/hooks/useT";
import { formatCurrency, formatNumber } from "@/shared/lib/format/format";
import type { Product } from "@/features/products/types";
import styles from "./ProductDetailModal.module.css";

/** Solo esquemas seguros para el `src` (evita javascript:, etc.). */
const SAFE_IMAGE_SRC = /^(https?:\/\/|data:image\/)/i;

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Panel emergente con los datos del producto y un carrusel de imágenes. Está
 * preparado para varias imágenes (flechas + puntos aparecen si hay más de una),
 * pero funciona con una sola. El área de imagen tiene aspecto fijo para que el
 * modal no reflowee al cargar (aparece/desaparece desde el centro vía Modal).
 */
export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const { t } = useT();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const images = (product?.imageUrls ?? []).filter((url) => SAFE_IMAGE_SRC.test(url));
  const count = images.length;

  // Reinicia el carrusel al abrir o cambiar de producto (diferido → sin setState en render).
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setIndex(0);
      setFailed({});
    });
    return () => cancelAnimationFrame(frame);
  }, [open, product?.id]);

  if (!product) return null;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);
  const current = images[index];
  const showImage = Boolean(current) && !failed[index];

  const fields: Array<{ label: string; value: string | null }> = [
    { label: t("products.columns.code"), value: product.code },
    { label: t("products.columns.type"), value: product.productType?.name ?? null },
    { label: t("products.columns.brand"), value: product.brand ?? null },
    { label: t("products.columns.model"), value: product.model ?? null },
    { label: t("products.columns.salePrice"), value: formatCurrency(product.salePrice) },
    {
      label: t("products.columns.costPrice"),
      value: product.costPrice != null ? formatCurrency(product.costPrice) : null,
    },
    { label: t("products.columns.stock"), value: formatNumber(product.stock) },
  ];

  return (
    <Modal open={open} onClose={onClose} title={product.name} size="lg">
      <div className={styles.layout}>
        <div className={styles.carousel} aria-label={t("products.detail.images")}>
          <div className={styles.stage}>
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={current}
                alt={product.name}
                className={styles.image}
                onError={() => setFailed((f) => ({ ...f, [index]: true }))}
              />
            ) : (
              <div className={styles.fallback}>
                <ImageOff size={40} />
              </div>
            )}

            {count > 1 && (
              <>
                <button
                  type="button"
                  className={clsx(styles.navBtn, styles.navPrev)}
                  onClick={prev}
                  aria-label={t("products.detail.prevImage")}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className={clsx(styles.navBtn, styles.navNext)}
                  onClick={next}
                  aria-label={t("products.detail.nextImage")}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {count > 1 && (
            <div className={styles.dots}>
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={clsx(styles.dot, i === index && styles.dotActive)}
                  onClick={() => setIndex(i)}
                  aria-label={String(i + 1)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <dl className={styles.grid}>
            {fields.map((field) => (
              <div key={field.label} className={styles.field}>
                <dt>{field.label}</dt>
                <dd>{field.value ?? "—"}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.descBlock}>
            <span className={styles.descLabel}>{t("products.detail.description")}</span>
            <p className={styles.descText}>
              {product.description || t("products.detail.noDescription")}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
