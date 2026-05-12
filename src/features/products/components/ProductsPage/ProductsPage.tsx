"use client";

import { useEffect, useState } from "react";
import { Boxes, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from "@/shared/components/ui/Input/Input";
import { Select } from "@/shared/components/ui/Select/Select";
import { IconButton } from "@/shared/components/ui/IconButton/IconButton";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable/DataTable";
import { Pagination } from "@/shared/components/ui/Pagination/Pagination";
import { EmptyState } from "@/shared/components/ui/EmptyState/EmptyState";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog/ConfirmDialog";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { usePagination } from "@/shared/hooks/usePagination";
import { formatCurrency, formatNumber } from "@/shared/lib/format/format";
import { isApiError } from "@/shared/lib/http/errors";
import { useProductTypesQuery } from "@/features/product-types/hooks/useProductTypes";
import {
  useDeleteProduct,
  useProductsQuery,
} from "@/features/products/hooks/useProducts";
import { ProductFormModal } from "@/features/products/components/ProductFormModal/ProductFormModal";
import type { Product } from "@/features/products/types";
import styles from "./ProductsPage.module.css";

export function ProductsPage() {
  const { t } = useT();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const pagination = usePagination({ initialLimit: 10 });

  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, typeFilter]);

  const typesQuery = useProductTypesQuery();
  const listQuery = useProductsQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch.trim() || undefined,
    productType: typeFilter || undefined,
  });

  const rows = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const deleteMutation = useDeleteProduct();

  const columns: DataTableColumn<Product>[] = [
    {
      key: "code",
      header: t("products.columns.code"),
      width: "140px",
      render: (item) => <span className={styles.codeCell}>{item.code}</span>,
    },
    { key: "name", header: t("products.columns.name") },
    {
      key: "type",
      header: t("products.columns.type"),
      render: (item) => <span className={styles.typeBadge}>{item.productType?.name ?? "—"}</span>,
    },
    {
      key: "brand",
      header: t("products.columns.brand"),
      render: (item) => item.brand ?? null,
    },
    {
      key: "stock",
      header: t("products.columns.stock"),
      align: "right",
      width: "100px",
      render: (item) => formatNumber(item.stock),
    },
    {
      key: "salePrice",
      header: t("products.columns.salePrice"),
      align: "right",
      width: "140px",
      render: (item) => <span className={styles.price}>{formatCurrency(item.salePrice)}</span>,
    },
    {
      key: "actions",
      header: t("products.columns.actions"),
      align: "right",
      width: "120px",
      render: (item) => (
        <div className={styles.actions}>
          <IconButton
            label={t("common.actions.edit")}
            size="sm"
            onClick={() => {
              setEditing(item);
              setModalOpen(true);
            }}
          >
            <Pencil size={14} />
          </IconButton>
          <IconButton
            label={t("common.actions.delete")}
            size="sm"
            variant="danger"
            onClick={() => setDeleting(item)}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleConfirmDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t("products.delete.success"));
        setDeleting(null);
      },
      onError: (error) => {
        if (isApiError(error)) {
          toast.error(error.message || t("errors.unknown"));
        } else {
          toast.error(t("errors.unknown"));
        }
      },
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("products.title")}</h1>
          <p className={styles.subtitle}>{t("products.subtitle")}</p>
        </div>
        <Button
          iconLeft={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          {t("products.createButton")}
        </Button>
      </header>

      <GlassCard className={styles.card} compact>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <Input
              type="search"
              placeholder={t("products.search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterWrap}>
            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              disabled={typesQuery.isLoading}
              aria-label={t("products.filterByType")}
            >
              <option value="">{t("products.allTypes")}</option>
              {typesQuery.data?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(item) => item.id}
          loading={listQuery.isLoading || listQuery.isFetching}
          emptyState={
            <EmptyState
              icon={<Boxes size={36} />}
              title={t("common.states.noData")}
              description={t("products.subtitle")}
            />
          }
        />

        {total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={totalPages}
            total={total}
            limit={pagination.limit}
            onPageChange={pagination.setPage}
            disabled={listQuery.isFetching}
          />
        )}
      </GlassCard>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("products.delete.title")}
        message={
          deleting
            ? t("products.delete.message", { name: deleting.name })
            : ""
        }
        confirmLabel={t("common.actions.delete")}
        cancelLabel={t("common.actions.cancel")}
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
