"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal/Modal";
import { FormField, FormRow } from "@/shared/components/ui/FormField/FormField";
import { Input } from "@/shared/components/ui/Input/Input";
import { Textarea } from "@/shared/components/ui/Textarea/Textarea";
import { Button } from "@/shared/components/ui/Button/Button";
import { useT } from "@/shared/hooks/useT";
import { useToast } from "@/shared/hooks/useToast";
import { isApiError } from "@/shared/lib/http/errors";
import { useApproveRequest } from "@/features/requests/hooks/useRequestsData";
import type { AppRequest } from "@/features/requests/types";

interface ApproveModalProps {
  open: boolean;
  onClose: () => void;
  request: AppRequest;
}

/** Aprobación de "nuevo tipo de producto": el aprobador aporta el código único. */
export function ApproveModal({ open, onClose, request }: ApproveModalProps) {
  const { t } = useT();
  const toast = useToast();
  const approveMutation = useApproveRequest();

  const payloadName = (request.payload?.name as string) ?? request.title;
  const payloadNotes = (request.payload?.notes as string) ?? request.description ?? "";

  const [name, setName] = useState(payloadName);
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState(payloadNotes);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setName(payloadName);
      setCode("");
      setNotes(payloadNotes);
      setNote("");
    });
    return () => cancelAnimationFrame(frame);
  }, [open, payloadName, payloadNotes]);

  const handleApprove = () => {
    if (!code.trim()) {
      toast.error(t("requests.approve.code"));
      return;
    }
    approveMutation.mutate(
      {
        id: request.id,
        input: {
          code: code.trim(),
          name: name.trim() || undefined,
          notes: notes.trim() || undefined,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("requests.approve.success"));
          onClose();
        },
        onError: (error) => {
          if (isApiError(error) && error.status === 409) {
            // Puede ser choque de código/nombre, o que otro admin ya la resolvió.
            const already = /resolved/i.test(error.message ?? "");
            toast.error(already ? t("requests.resolvedElsewhere") : t("requests.approve.conflict"));
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
      onClose={approveMutation.isPending ? () => undefined : onClose}
      title={t("requests.approve.title")}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={approveMutation.isPending}>
            {t("common.actions.cancel")}
          </Button>
          <Button onClick={handleApprove} loading={approveMutation.isPending}>
            {t("requests.approve.confirm")}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <FormRow columns={2}>
          <FormField label={t("requests.approve.name")} required>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={approveMutation.isPending} />
          </FormField>
          <FormField label={t("requests.approve.code")} hint={t("requests.approve.codeHint")} required>
            <Input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ELEC"
              disabled={approveMutation.isPending}
            />
          </FormField>
        </FormRow>
        <FormField label={t("requests.approve.notes")}>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={approveMutation.isPending} />
        </FormField>
        <FormField label={t("requests.approve.note")}>
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} disabled={approveMutation.isPending} />
        </FormField>
      </div>
    </Modal>
  );
}
