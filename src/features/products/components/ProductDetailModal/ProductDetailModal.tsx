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

  return (
    <Modal open={open} onClose={onClose} size="lg">
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
          <div className={styles.head}>
            {product.productType?.name && (
              <span className={styles.typeBadge}>{product.productType.name}</span>
            )}
            <h2 className={styles.name}>{product.name}</h2>
            <span className={styles.code}>{product.code}</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>{formatCurrency(product.salePrice)}</span>
            {product.costPrice != null && (
              <span className={styles.cost}>
                {t("products.columns.costPrice")}: {formatCurrency(product.costPrice)}
              </span>
            )}
            <span className={styles.stock}>
              {t("products.columns.stock")}: <strong>{formatNumber(product.stock)}</strong>
            </span>
          </div>

          <dl className={styles.specs}>
            <div className={styles.spec}>
              <dt>{t("products.columns.brand")}</dt>
              <dd>{product.brand || "—"}</dd>
            </div>
            <div className={styles.spec}>
              <dt>{t("products.columns.model")}</dt>
              <dd>{product.model || "—"}</dd>
            </div>
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
