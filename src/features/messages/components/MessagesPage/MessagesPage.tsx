"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, Check, Eye, MessageSquare, Search, Send, SquarePen } from "lucide-react";
import { Input } from "@/shared/components/ui/Input/Input";
import { useT } from "@/shared/hooks/useT";
import { useSession } from "@/shared/hooks/useSession";
import { useChat } from "@/features/messages/context/ChatProvider";
import { useContactsQuery, useConversationQuery } from "@/features/messages/hooks/useMessagesData";
import type { ChatMessage } from "@/features/messages/types";
import styles from "./MessagesPage.module.css";

interface SelectedPeer {
  id: string;
  name: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

/** Clave de día local (año-mes-día) para detectar el cambio de fecha. */
function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Etiqueta de fecha centrada, p. ej. "Miércoles 22 de Julio". */
function formatDayLabel(iso: string) {
  const label = new Date(iso).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label
    .replace(/^\p{L}/u, (c) => c.toUpperCase())
    .replace(/ de (\p{L})/u, (_, c: string) => ` de ${c.toUpperCase()}`);
}

type ThreadItem =
  | { kind: "date"; id: string; label: string }
  | { kind: "message"; message: ChatMessage };

export function MessagesPage() {
  const { t } = useT();
  const { user } = useSession();
  const me = user.id;
  const {
    conversations,
    liveMessages,
    connected,
    sendMessage,
    openConversation,
    setActivePeerId,
    markConversationRead,
  } = useChat();

  const [selected, setSelected] = useState<SelectedPeer | null>(null);
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState("");
  const [contactSearch, setContactSearch] = useState("");

  const contactsQuery = useContactsQuery(picking);
  const conversationQuery = useConversationQuery(selected?.id ?? null);

  // Al salir del panel de mensajes, no hay conversación "activa" (para que los
  // mensajes entrantes vuelvan a notificar por toast + badge).
  useEffect(() => () => setActivePeerId(null), [setActivePeerId]);

  const messages = useMemo(() => {
    if (!selected) return [];
    const base = conversationQuery.data?.data ?? [];
    const live = liveMessages[selected.id] ?? [];
    const map = new Map<string, ChatMessage>();
    [...base, ...live].forEach((message) => map.set(message.id, message));
    return Array.from(map.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [selected, conversationQuery.data, liveMessages]);

  // Inserta un separador de fecha centrado la primera vez que aparece un día
  // (y de nuevo cada vez que se cruza la medianoche).
  const threadItems = useMemo<ThreadItem[]>(() => {
    const items: ThreadItem[] = [];
    let lastDay: string | null = null;
    for (const message of messages) {
      const key = dayKey(message.createdAt);
      if (key !== lastDay) {
        items.push({ kind: "date", id: `date-${key}`, label: formatDayLabel(message.createdAt) });
        lastDay = key;
      }
      items.push({ kind: "message", message });
    }
    return items;
  }, [messages]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selected]);

  // Red de seguridad: si estás viendo una conversación con no leídos, márcalos leídos.
  useEffect(() => {
    if (!selected) return;
    const current = conversations.find((conversation) => conversation.peerId === selected.id);
    if (current && current.unread > 0) {
      markConversationRead(selected.id);
    }
  }, [selected, messages.length, conversations, markConversationRead]);

  const openWith = (id: string, name: string) => {
    setSelected({ id, name });
    setPicking(false);
    setDraft("");
    openConversation(id);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !selected) return;
    sendMessage(selected.id, text);
    setDraft("");
  };

  const contacts = (contactsQuery.data ?? []).filter((contact) =>
    contact.fullName.toLowerCase().includes(contactSearch.trim().toLowerCase()),
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("messages.title")}</h1>
        <p className={styles.subtitle}>{t("messages.subtitle")}</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {picking ? (
            <>
              <div className={styles.sidebarHead}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setPicking(false)}
                  aria-label={t("common.actions.back")}
                >
                  <ArrowLeft size={16} />
                </button>
                <span className={styles.sidebarTitle}>{t("messages.newConversation")}</span>
              </div>
              <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} aria-hidden="true" />
                <Input
                  type="search"
                  placeholder={t("messages.searchContacts")}
                  value={contactSearch}
                  onChange={(event) => setContactSearch(event.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <ul className={styles.list}>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <button
                      type="button"
                      className={styles.conversation}
                      onClick={() => openWith(contact.id, contact.fullName)}
                    >
                      <span className={styles.avatar}>{initials(contact.fullName)}</span>
                      <span className={styles.convBody}>
                        <span className={styles.convName}>{contact.fullName}</span>
                        <span className={styles.convPreview}>{contact.email}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className={styles.sidebarHead}>
                <span className={styles.sidebarTitle}>{t("messages.conversations")}</span>
                <button
                  type="button"
                  className={styles.newBtn}
                  onClick={() => {
                    setPicking(true);
                    setContactSearch("");
                  }}
                  aria-label={t("messages.newConversation")}
                  title={t("messages.newConversation")}
                >
                  <SquarePen size={16} />
                </button>
              </div>
              {conversations.length === 0 ? (
                <div className={styles.emptyList}>{t("messages.noConversations")}</div>
              ) : (
                <ul className={styles.list}>
                  {conversations.map((conversation) => (
                    <li key={conversation.peerId}>
                      <button
                        type="button"
                        className={clsx(
                          styles.conversation,
                          selected?.id === conversation.peerId && styles.selected,
                        )}
                        onClick={() => openWith(conversation.peerId, conversation.fullName)}
                      >
                        <span className={styles.avatar}>{initials(conversation.fullName)}</span>
                        <span className={styles.convBody}>
                          <span className={styles.convTop}>
                            <span className={styles.convName}>{conversation.fullName}</span>
                            <span className={styles.convTime}>{formatTime(conversation.lastAt)}</span>
                          </span>
                          <span className={styles.convPreview}>
                            {conversation.lastFrom === me &&
                              (conversation.lastRead ? (
                                <Eye
                                  size={13}
                                  className={clsx(styles.ownStatus, styles.ownStatusRead)}
                                  aria-label={t("messages.read")}
                                />
                              ) : (
                                <Check
                                  size={13}
                                  className={styles.ownStatus}
                                  aria-label={t("messages.sent")}
                                />
                              ))}
                            <span className={styles.convPreviewText}>{conversation.lastMessage}</span>
                          </span>
                        </span>
                        {conversation.unread > 0 && (
                          <span className={styles.unread}>{conversation.unread}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>

        <section className={styles.thread}>
          {selected ? (
            <>
              <header className={styles.threadHead}>
                <span className={styles.avatar}>{initials(selected.name)}</span>
                <span className={styles.threadName}>{selected.name}</span>
                <span
                  className={clsx(styles.status, connected ? styles.online : styles.offline)}
                  title={connected ? t("messages.connected") : t("messages.disconnected")}
                />
              </header>

              <div className={styles.messages}>
                {threadItems.map((item) =>
                  item.kind === "date" ? (
                    <div key={item.id} className={styles.dateDivider}>
                      <span>{item.label}</span>
                    </div>
                  ) : (
                    <div
                      key={item.message.id}
                      className={clsx(styles.bubble, item.message.from === me && styles.bubbleOwn)}
                    >
                      <span className={styles.bubbleText}>{item.message.content}</span>
                      <span className={styles.bubbleTime}>{formatTime(item.message.createdAt)}</span>
                    </div>
                  ),
                )}
                <div ref={bottomRef} />
              </div>

              <div className={styles.composer}>
                <Input
                  placeholder={t("messages.inputPlaceholder")}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  aria-label={t("common.actions.submit")}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyThread}>
              <MessageSquare size={40} />
              <p>{t("messages.emptyConversation")}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
