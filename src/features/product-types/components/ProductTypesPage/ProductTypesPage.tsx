"use client";

import { useMemo, useState } from "react";
import { Layers3, Pencil, Plus, Search, SendHorizontal, Trash2 } from "lucide-react";
import { GlassCard } from "@/shared/components/ui/GlassCard/GlassCard";
import { Button } from "@/shared/components/ui/Button/Button";
import { Input } from "@/shared/components/ui/Input/Input";
import { IconButton } from "@/shared/components/ui/IconButton/IconButton";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable/DataTable";
import { Pagination } from "@/shared/components/ui/Pagination/Pagination";
import { EmptyState } from "@/shared/components/ui/EmptyState/EmptyState";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog/ConfirmDialog";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { useSession } from "@/shared/hooks/useSession";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { usePagination } from "@/shared/hooks/usePagination";
import { isApiError } from "@/shared/lib/http/errors";
import { DASHBOARD_ALLOWED_ROLES } from "@/types/auth";
import {
  useDeleteProductType,
  useProductTypesQuery,
} from "@/features/product-types/hooks/useProductTypes";
import type { ProductType } from "@/features/product-types/types";
import { ProductTypeFormModal } from "@/features/product-types/components/ProductTypeFormModal/ProductTypeFormModal";
import { RequestProductTypeModal } from "@/features/requests/components/RequestProductTypeModal/RequestProductTypeModal";
import styles from "./ProductTypesPage.module.css";

export function ProductTypesPage() {
  const { t } = useT();
  const toast = useToast();
  const { hasAnyRole } = useSession();
  const canManage = hasAnyRole(DASHBOARD_ALLOWED_ROLES);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const pagination = usePagination({ initialLimit: 10 });
  const { data, isLoading } = useProductTypesQuery();

  const [modalOpen, setModalOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [editing, setEditing] = useState<ProductType | null>(null);
  const [deleting, setDeleting] = useState<ProductType | null>(null);
  const deleteMutation = useDeleteProductType();

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term),
    );
  }, [data, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.limit));
  const safePage = Math.min(pagination.page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * pagination.limit,
    safePage * pagination.limit,
  );

  const columns: DataTableColumn<ProductType>[] = [
    {
      key: "code",
      header: t("productTypes.columns.code"),
      width: "180px",
      render: (item) => <span className={styles.codeCell}>{item.code}</span>,
    },
    { key: "name", header: t("productTypes.columns.name") },
    {
      key: "notes",
      header: t("productTypes.columns.notes"),
      render: (item) =>
        item.notes ? <span className={styles.notes}>{item.notes}</span> : null,
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: t("productTypes.columns.actions"),
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
    });
  }

  const handleConfirmDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t("productTypes.delete.success"));
        setDeleting(null);
      },
      onError: (error) => {
        if (isApiError(error) && error.status === 409) {
          toast.error(t("productTypes.delete.conflict"));
        } else if (isApiError(error)) {
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
          <h1 className={styles.title}>{t("productTypes.title")}</h1>
          <p className={styles.subtitle}>{t("productTypes.subtitle")}</p>
        </div>
        {canManage ? (
          <Button
            iconLeft={<Plus size={16} />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            {t("productTypes.createButton")}
          </Button>
        ) : (
          <Button
            variant="secondary"
            iconLeft={<SendHorizontal size={16} />}
            onClick={() => setRequestOpen(true)}
          >
            {t("requests.actions.requestType")}
          </Button>
        )}
      </header>

      <GlassCard className={styles.card} compact>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <Input
              type="search"
              placeholder={t("productTypes.search")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                pagination.setPage(1);
              }}
              className={styles.searchInput}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(item) => item.id}
          loading={isLoading}
          emptyState={
            <EmptyState
              icon={<Layers3 size={36} />}
              title={t("common.states.noData")}
              description={t("productTypes.subtitle")}
            />
          }
        />

        {filtered.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            limit={pagination.limit}
            onPageChange={pagination.setPage}
          />
        )}
      </GlassCard>

      <ProductTypeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productType={editing}
      />

      <RequestProductTypeModal open={requestOpen} onClose={() => setRequestOpen(false)} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("productTypes.delete.title")}
        message={
          deleting
            ? t("productTypes.delete.message", { name: deleting.name })
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
