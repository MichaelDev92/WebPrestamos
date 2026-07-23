"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useT } from "@/shared/hooks/useT";
import { useChat } from "@/features/messages/context/ChatProvider";
import styles from "./MessagesButton.module.css";

const POPUP_DURATION = 6000;

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Ícono de mensajes del navbar con badge de no leídos y viñeta transitoria:
 * al recibir un mensaje fuera de la conversación activa, emerge un popup anclado
 * bajo el ícono (con la punta apuntando hacia él) que se auto-oculta.
 */
export function MessagesButton() {
  const { t } = useT();
  const { unreadTotal, incomingSignal, lastIncomingPeerId, conversations } = useChat();

  const [showPopup, setShowPopup] = useState(false);

  // Dispara la viñeta cuando llega un mensaje nuevo (incomingSignal se incrementa).
  // El setState se difiere para no ejecutarlo síncrono dentro del efecto.
  useEffect(() => {
    if (incomingSignal === 0) return;
    const frame = requestAnimationFrame(() => setShowPopup(true));
    const timer = window.setTimeout(() => setShowPopup(false), POPUP_DURATION);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [incomingSignal]);

  const conversation =
    conversations.find((item) => item.peerId === lastIncomingPeerId) ?? conversations[0] ?? null;

  return (
    <div className={styles.wrapper}>
      <Link
        href="/messages"
        className={styles.iconLink}
        aria-label={t("messages.label")}
        title={t("messages.label")}
      >
        <MessageSquare size={18} />
        {unreadTotal > 0 && (
          <span className={styles.badge}>{unreadTotal > 99 ? "99+" : unreadTotal}</span>
        )}
      </Link>

      {showPopup && conversation && (
        <Link
          href="/messages"
          className={styles.popup}
          onClick={() => setShowPopup(false)}
          role="alert"
        >
          <span className={styles.avatar}>{initials(conversation.fullName)}</span>
          <span className={styles.body}>
            <span className={styles.title}>{t("messages.newMessageTitle")}</span>
            <span className={styles.name}>{conversation.fullName}</span>
            <span className={styles.preview}>{conversation.lastMessage}</span>
          </span>
        </Link>
      )}
    </div>
  );
}
