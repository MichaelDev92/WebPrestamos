"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal/Modal";
import { FormField } from "@/shared/components/ui/FormField/FormField";
import { Textarea } from "@/shared/components/ui/Textarea/Textarea";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { isApiError } from "@/shared/lib/http/errors";
import { useRejectRequest } from "@/features/requests/hooks/useRequestsData";
import type { AppRequest } from "@/features/requests/types";

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  request: AppRequest;
}

/** Rechazo de una solicitud: se registra la observación/motivo. */
export function RejectModal({ open, onClose, request }: RejectModalProps) {
  const { t } = useT();
  const toast = useToast();
  const rejectMutation = useRejectRequest();
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setNote(""));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const handleReject = () => {
    if (!note.trim()) {
      toast.error(t("requests.reject.note"));
      return;
    }
    rejectMutation.mutate(
      { id: request.id, input: { note: note.trim() } },
      {
        onSuccess: () => {
          toast.success(t("requests.reject.success"));
          onClose();
        },
        onError: (error) => {
          if (isApiError(error) && error.status === 409) {
            toast.error(t("requests.resolvedElsewhere"));
            return;
          }
          toast.error((isApiError(error) && error.message) || t("errors.unknown"));
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={rejectMutation.isPending ? () => undefined : onClose}
      title={t("requests.reject.title")}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={rejectMutation.isPending}>
            {t("common.actions.cancel")}
          </Button>
          <Button variant="danger" onClick={handleReject} loading={rejectMutation.isPending}>
            {t("requests.reject.confirm")}
          </Button>
        </>
      }
    >
      <FormField label={t("requests.reject.note")} required>
        <Textarea
          autoFocus
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("requests.reject.notePlaceholder")}
          disabled={rejectMutation.isPending}
        />
      </FormField>
    </Modal>
  );
}
