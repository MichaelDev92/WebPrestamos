"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Images, LayoutGrid, Pencil, Plus, Search, Table2, Trash2 } from "lucide-react";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from "@/shared/components/ui/Input/Input";
import { Dropdown } from "@/shared/components/ui/Dropdown/Dropdown";
import { IconButton } from "@/shared/components/ui/IconButton/IconButton";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable/DataTable";
import { Pagination } from "@/shared/components/ui/Pagination/Pagination";
import { EmptyState } from "@/shared/components/ui/EmptyState/EmptyState";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog/ConfirmDialog";
import { Skeleton } from "@/shared/components/ui/Skeleton/Skeleton";
import { ViewSwitcher, type ViewOption } from "@/shared/components/ui/ViewSwitcher/ViewSwitcher";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { useSession } from "@/shared/hooks/useSession";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { usePagination } from "@/shared/hooks/usePagination";
import { formatCurrency, formatNumber } from "@/shared/lib/format/format";
import { isApiError } from "@/shared/lib/http/errors";
import { canModifyOwned } from "@/types/auth";
import { useProductTypesQuery } from "@/features/product-types/hooks/useProductTypes";
import {
  useDeleteProduct,
  useProductsQuery,
} from "@/features/products/hooks/useProducts";
import { ProductFormModal } from "@/features/products/components/ProductFormModal/ProductFormModal";
import { ProductCard } from "@/features/products/components/ProductCard/ProductCard";
import type { Product } from "@/features/products/types";
import styles from "./ProductsPage.module.css";

type ProductView = "table" | "cards" | "gallery";

export function ProductsPage() {
  const { t } = useT();
  const toast = useToast();
  const { user } = useSession();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [view, setView] = useState<ProductView>("table");
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
  const isLoading = listQuery.isLoading || listQuery.isFetching;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const deleteMutation = useDeleteProduct();

  const typeOptions = useMemo(
    () => [
      { value: "", label: t("products.allTypes") },
      ...(typesQuery.data?.map((type) => ({ value: type.id, label: type.name })) ?? []),
    ],
    [typesQuery.data, t],
  );

  const viewOptions: ViewOption<ProductView>[] = [
    { value: "table", label: t("products.views.table"), icon: <Table2 size={16} /> },
    { value: "cards", label: t("products.views.cards"), icon: <LayoutGrid size={16} /> },
    { value: "gallery", label: t("products.views.gallery"), icon: <Images size={16} /> },
  ];

  const openEdit = (item: Product) => {
    setEditing(item);
    setModalOpen(true);
  };

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
      render: (item) =>
        canModifyOwned(user, item.createdBy) ? (
          <div className={styles.actions}>
            <IconButton label={t("common.actions.edit")} size="sm" onClick={() => openEdit(item)}>
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
        ) : null,
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
        toast.error(isApiError(error) ? error.message || t("errors.unknown") : t("errors.unknown"));
      },
    });
  };

  const cardLabels = {
    edit: t("common.actions.edit"),
    delete: t("common.actions.delete"),
    stock: t("products.columns.stock"),
    noImage: t("products.card.noImage"),
  };

  const renderCards = (variant: "small" | "large") => {
    const gridClass = variant === "large" ? styles.galleryGrid : styles.cardsGrid;
    if (isLoading) {
      return (
        <div className={styles.gridWrap}>
          <div className={gridClass}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} height={variant === "large" ? 260 : 96} radius="16px" />
            ))}
          </div>
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <div className={styles.emptyWrap}>
          <EmptyState
            icon={<Boxes size={36} />}
            title={t("common.states.noData")}
            description={t("products.subtitle")}
          />
        </div>
      );
    }
    return (
      <div className={styles.gridWrap}>
        <div className={gridClass}>
          {rows.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              variant={variant}
              onEdit={openEdit}
              onDelete={setDeleting}
              canModify={canModifyOwned(user, item.createdBy)}
              labels={cardLabels}
            />
          ))}
        </div>
      </div>
    );
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
            <Dropdown
              value={typeFilter}
              onChange={setTypeFilter}
              options={typeOptions}
              disabled={typesQuery.isLoading}
              searchable
            />
          </div>
          <div className={styles.spacer} />
          <ViewSwitcher value={view} onChange={setView} options={viewOptions} />
        </div>

        {view === "table" ? (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(item) => item.id}
            loading={isLoading}
            emptyState={
              <EmptyState
                icon={<Boxes size={36} />}
                title={t("common.states.noData")}
                description={t("products.subtitle")}
              />
            }
          />
        ) : (
          renderCards(view === "gallery" ? "large" : "small")
        )}

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

      <ProductFormModal open={modalOpen} onClose={() => setModalOpen(false)} product={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("products.delete.title")}
        message={deleting ? t("products.delete.message", { name: deleting.name }) : ""}
        confirmLabel={t("common.actions.delete")}
        cancelLabel={t("common.actions.cancel")}
        loading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
