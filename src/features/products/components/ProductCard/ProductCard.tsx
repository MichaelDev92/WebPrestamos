"use client";

import { useState } from "react";
import clsx from "clsx";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/shared/components/ui/IconButton/IconButton";
import { formatCurrency, formatNumber } from "@/shared/lib/format/format";
import type { Product } from "@/features/products/types";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  variant: "small" | "large";
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  /** Si es false, oculta las acciones de editar/eliminar (producto no propio). */
  canModify?: boolean;
  labels: {
    edit: string;
    delete: string;
    stock: string;
    noImage: string;
  };
}

/** Solo permite esquemas seguros para el `src` (evita javascript:, etc.). */
const SAFE_IMAGE_SRC = /^(https?:\/\/|data:image\/)/i;

function ProductImage({ url, alt, noImage }: { url?: string; alt: string; noImage: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed || !SAFE_IMAGE_SRC.test(url)) {
    return (
      <div className={styles.imageFallback} aria-label={noImage}>
        <ImageOff size={28} />
      </div>
    );
  }
  // Imágenes de URLs arbitrarias: <img> nativo con fallback (evita config de next/image).
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={styles.image} loading="lazy" onError={() => setFailed(true)} />;
}

export function ProductCard({
  product,
  variant,
  onEdit,
  onDelete,
  canModify = true,
  labels,
}: ProductCardProps) {
  const cover = product.imageUrls?.[0];

  const actions = canModify ? (
    <div className={styles.actions}>
      <IconButton label={labels.edit} size="sm" variant="subtle" onClick={() => onEdit(product)}>
        <Pencil size={14} />
      </IconButton>
      <IconButton label={labels.delete} size="sm" variant="danger" onClick={() => onDelete(product)}>
        <Trash2 size={14} />
      </IconButton>
    </div>
  ) : null;

  if (variant === "large") {
    return (
      <article className={clsx(styles.card, styles.large)}>
        <div className={styles.cover}>
          <ProductImage url={cover} alt={product.name} noImage={labels.noImage} />
          <span className={styles.codeBadge}>{product.code}</span>
        </div>
        <div className={styles.body}>
          <div className={styles.headRow}>
            <h3 className={styles.name}>{product.name}</h3>
            {actions}
          </div>
          {product.productType?.name && (
            <span className={styles.typeBadge}>{product.productType.name}</span>
          )}
          <div className={styles.metaRow}>
            <span className={styles.price}>{formatCurrency(product.salePrice)}</span>
            <span className={styles.stock}>
              {labels.stock}: {formatNumber(product.stock)}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={clsx(styles.card, styles.small)}>
      <div className={styles.thumb}>
        <ProductImage url={cover} alt={product.name} noImage={labels.noImage} />
      </div>
      <div className={styles.smallBody}>
        <div className={styles.headRow}>
          <h3 className={styles.name}>{product.name}</h3>
          {actions}
        </div>
        <span className={styles.codeText}>{product.code}</span>
        <div className={styles.metaRow}>
          <span className={styles.price}>{formatCurrency(product.salePrice)}</span>
          <span className={styles.stock}>
            {labels.stock}: {formatNumber(product.stock)}
          </span>
        </div>
      </div>
    </article>
  );
}
