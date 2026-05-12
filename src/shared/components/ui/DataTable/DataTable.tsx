"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { Skeleton } from "@/shared/components/ui/Skeleton/Skeleton";
import styles from "./DataTable.module.css";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  /** Renderiza la celda. Si no se provee, usa item[key] como string. */
  render?: (item: T, rowIndex: number) => ReactNode;
  /** Alineación horizontal del contenido y header */
  align?: "left" | "center" | "right";
  /** Ancho fijo en CSS (e.g. "120px" o "1fr") */
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (item: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows = 5,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(styles.th, column.align && styles[`align-${column.align}`])}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <tr key={`skeleton-${rowIdx}`} className={styles.row}>
                {columns.map((column) => (
                  <td key={column.key} className={styles.td}>
                    <Skeleton height={14} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className={styles.empty}>{emptyState}</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(styles.th, column.align && styles[`align-${column.align}`])}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowKey(row)}
              className={clsx(styles.row, onRowClick && styles.clickable)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => {
                const value = column.render
                  ? column.render(row, rowIndex)
                  : ((row as Record<string, unknown>)[column.key] as ReactNode);
                return (
                  <td
                    key={column.key}
                    className={clsx(
                      styles.td,
                      column.align && styles[`align-${column.align}`],
                      column.className,
                    )}
                  >
                    {value ?? <span className={styles.muted}>—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
