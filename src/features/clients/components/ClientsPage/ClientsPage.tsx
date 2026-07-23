"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
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
import { canModifyOwned } from "@/types/auth";
import {
  useClientsQuery,
  useDeleteClient,
} from "@/features/clients/hooks/useClients";
import { ClientFormModal } from "@/features/clients/components/ClientFormModal/ClientFormModal";
import type { Client } from "@/features/clients/types";
import styles from "./ClientsPage.module.css";

export function ClientsPage() {
  const { t } = useT();
  const toast = useToast();
  const { user } = useSession();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const pagination = usePagination({ initialLimit: 10 });

  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const listQuery = useClientsQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch.trim() || undefined,
  });

  const rows = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const deleteMutation = useDeleteClient();

  const columns: DataTableColumn<Client>[] = [
    {
      key: "fullName",
      header: t("clients.columns.fullName"),
      render: (item) => (
        <span className={styles.name}>{item.fullName || `${item.names} ${item.surnames}`}</span>
      ),
    },
    {
      key: "document",
      header: t("clients.columns.document"),
      render: (item) => (
        <span className={styles.docCell}>
          {item.typeDocument?.description && (
            <span className={styles.docBadge}>{item.typeDocument.description}</span>
          )}
          {item.documentNumber}
        </span>
      ),
    },
    { key: "email", header: t("clients.columns.email") },
    {
      key: "phoneNumber",
      header: t("clients.columns.phone"),
      render: (item) => item.phoneNumber ?? null,
    },
    {
      key: "actions",
      header: t("clients.columns.actions"),
      align: "right",
      width: "120px",
      render: (item) =>
        canModifyOwned(user, item.createdBy) ? (
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
        ) : null,
    },
  ];

  const handleConfirmDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t("clients.delete.success"));
        setDeleting(null);
      },
      onError: (error) => {
        toast.error(isApiError(error) ? error.message || t("errors.unknown") : t("errors.unknown"));
      },
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("clients.title")}</h1>
          <p className={styles.subtitle}>{t("clients.subtitle")}</p>
        </div>
        <Button
          iconLeft={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          {t("clients.createButton")}
        </Button>
      </header>

      <GlassCard className={styles.card} compact>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <Input
              type="search"
              placeholder={t("clients.search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(item) => item.id}
          loading={listQuery.isLoading || listQuery.isFetching}
          emptyState={
            <EmptyState
              icon={<Users size={36} />}
              title={t("common.states.noData")}
              description={t("clients.subtitle")}
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

      <ClientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        client={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("clients.delete.title")}
        message={
          deleting
            ? t("clients.delete.message", {
                name: deleting.fullName || `${deleting.names} ${deleting.surnames}`,
              })
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
