"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Loader2, Pencil, Plus, RotateCcw, Search, ShieldCheck, Trash2 } from "lucide-react";
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
import { useDebounce } from "@/shared/hooks/useDebounce";
import { usePagination } from "@/shared/hooks/usePagination";
import { isApiError } from "@/shared/lib/http/errors";
import { useSession } from "@/shared/hooks/useSession";
import type { TranslationKey } from "@/shared/lib/i18n/translate";
import { useDeleteUser, useReactivateUser, useUsersQuery } from "@/features/users/hooks/useUsers";
import { UserFormModal } from "@/features/users/components/UserFormModal/UserFormModal";
import type { User } from "@/features/users/types";
import styles from "./UsersPage.module.css";

export function UsersPage() {
  const { t } = useT();
  const toast = useToast();
  const { user: currentUser } = useSession();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const pagination = usePagination({ initialLimit: 10 });

  useEffect(() => {
    pagination.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const listQuery = useUsersQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: debouncedSearch.trim() || undefined,
  });

  const rows = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const deleteMutation = useDeleteUser();
  const reactivateMutation = useReactivateUser();

  const handleReactivate = (item: User) => {
    if (reactivatingId) return; // evita doble click / duplicados
    setReactivatingId(item.id);
    reactivateMutation.mutate(item.id, {
      onSuccess: () => toast.success(t("users.reactivate.success")),
      onError: (error) => {
        if (isApiError(error) && error.status === 409) {
          toast.error(t("users.reactivate.alreadyActive"));
        } else if (isApiError(error) && error.status === 404) {
          toast.error(t("users.reactivate.notFound"));
        } else if (isApiError(error)) {
          toast.error(error.message || t("errors.unknown"));
        } else {
          toast.error(t("errors.unknown"));
        }
      },
      onSettled: () => setReactivatingId(null),
    });
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: "fullName",
      header: t("users.columns.fullName"),
      render: (item) => (
        <span className={styles.name}>{item.fullName || `${item.names} ${item.surnames}`}</span>
      ),
    },
    { key: "email", header: t("users.columns.email") },
    {
      key: "phoneNumber",
      header: t("users.columns.phone"),
      render: (item) => item.phoneNumber ?? null,
    },
    {
      key: "role",
      header: t("users.columns.role"),
      render: (item) => (
        <span className={styles.roleBadge}>
          {t(`auth.register.roles.${item.role}` as TranslationKey)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("users.columns.status"),
      width: "120px",
      render: (item) => (
        <span
          className={clsx(
            styles.statusBadge,
            item.active === 1 ? styles.statusActive : styles.statusInactive,
          )}
        >
          {item.active === 1 ? t("users.status.active") : t("users.status.inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("users.columns.actions"),
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
          {item.active === 1 ? (
            <IconButton
              label={t("common.actions.delete")}
              size="sm"
              variant="danger"
              disabled={item.id === currentUser.id}
              onClick={() => setDeleting(item)}
            >
              <Trash2 size={14} />
            </IconButton>
          ) : (
            <IconButton
              label={t("users.actions.reactivate")}
              size="sm"
              disabled={reactivatingId === item.id}
              onClick={() => handleReactivate(item)}
            >
              {reactivatingId === item.id ? (
                <Loader2 size={14} className={styles.spin} />
              ) : (
                <RotateCcw size={14} />
              )}
            </IconButton>
          )}
        </div>
      ),
    },
  ];

  const handleConfirmDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t("users.delete.success"));
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
          <h1 className={styles.title}>{t("users.title")}</h1>
          <p className={styles.subtitle}>{t("users.subtitle")}</p>
        </div>
        <Button
          iconLeft={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          {t("users.createButton")}
        </Button>
      </header>

      <GlassCard className={styles.card} compact>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <Input
              type="search"
              placeholder={t("users.search")}
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
              icon={<ShieldCheck size={36} />}
              title={t("common.states.noData")}
              description={t("users.subtitle")}
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

      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} user={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("users.delete.title")}
        message={
          deleting
            ? t("users.delete.message", {
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
