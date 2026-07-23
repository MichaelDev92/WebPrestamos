"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal/Modal";
import { FormField } from "@/shared/components/ui/FormField/FormField";
import { Input } from "@/shared/components/ui/Input/Input";
import { Textarea } from "@/shared/components/ui/Textarea/Textarea";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { isApiError } from "@/shared/lib/http/errors";
import { useCreateRequest } from "@/features/requests/hooks/useRequestsData";

interface RequestProductTypeModalProps {
  open: boolean;
  onClose: () => void;
}

/** Formulario para que un usuario solicite la creación de un nuevo tipo de producto. */
export function RequestProductTypeModal({ open, onClose }: RequestProductTypeModalProps) {
  const { t } = useT();
  const toast = useToast();
  const createMutation = useCreateRequest();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setName("");
      setDescription("");
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error(t("requests.form.name"));
      return;
    }
    createMutation.mutate(
      {
        type: "PRODUCT_TYPE_CREATE",
        title: name.trim(),
        description: description.trim() || undefined,
        payload: { name: name.trim(), notes: description.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success(t("requests.form.success"));
          onClose();
        },
        onError: (error) => {
          toast.error((isApiError(error) && error.message) || t("errors.unknown"));
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={createMutation.isPending ? () => undefined : onClose}
      title={t("requests.form.title")}
      description={t("requests.form.hint")}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            {t("common.actions.cancel")}
          </Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending}>
            {t("requests.actions.submit")}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <FormField label={t("requests.form.name")} required>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} disabled={createMutation.isPending} />
        </FormField>
        <FormField label={t("requests.form.description")}>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={createMutation.isPending}
          />
        </FormField>
      </div>
    </Modal>
  );
}
