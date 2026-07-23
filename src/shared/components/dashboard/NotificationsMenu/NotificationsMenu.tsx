"use client";

import { useRef, useState, type ComponentType } from "react";
import clsx from "clsx";
import { Bell, Clock, Info, Sparkles } from "lucide-react";
import { Popover } from "@/shared/components/ui/Popover/Popover";
import { useT } from "@/shared/hooks/useT";
import styles from "./NotificationsMenu.module.css";

type NotificationType = "update" | "reminder" | "info";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const TYPE_ICON: Record<NotificationType, ComponentType<{ size?: number }>> = {
  update: Sparkles,
  reminder: Clock,
  info: Info,
};

// Datos de ejemplo (shell). Se reemplazarán por el feed real del backend (Fase posterior).
const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "update",
    title: "Nueva versión disponible",
    description: "Se agregaron las vistas de galería en Productos.",
    time: "hace 5 min",
    read: false,
  },
  {
    id: "n2",
    type: "reminder",
    title: "Recordatorio",
    description: "Tienes 3 clientes pendientes de revisión de riesgo.",
    time: "hace 1 h",
    read: false,
  },
  {
    id: "n3",
    type: "info",
    title: "Respaldo completado",
    description: "La copia de seguridad diaria finalizó correctamente.",
    time: "ayer",
    read: true,
  },
];

export function NotificationsMenu() {
  const { t } = useT();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

  const unread = items.filter((item) => !item.read).length;

  const markAllRead = () => setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  const markRead = (id: string) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={clsx(styles.trigger, open && styles.open)}
        aria-label={t("notifications.label")}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell size={18} />
        {unread > 0 && <span className={styles.badge}>{unread}</span>}
      </button>

      <Popover anchorRef={triggerRef} open={open} onClose={() => setOpen(false)} matchWidth={false}>
        <div className={styles.panel}>
          <header className={styles.header}>
            <span className={styles.headerTitle}>{t("notifications.title")}</span>
            <button
              type="button"
              className={styles.markAll}
              onClick={markAllRead}
              disabled={unread === 0}
            >
              {t("notifications.markAllRead")}
            </button>
          </header>

          {items.length === 0 ? (
            <div className={styles.empty}>{t("notifications.empty")}</div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={clsx(styles.item, !item.read && styles.unread)}
                      onClick={() => markRead(item.id)}
                    >
                      <span className={clsx(styles.icon, styles[item.type])}>
                        <Icon size={16} />
                      </span>
                      <span className={styles.body}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemDesc}>{item.description}</span>
                        <span className={styles.itemTime}>{item.time}</span>
                      </span>
                      {!item.read && <span className={styles.dot} aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <footer className={styles.footer}>
            <span>{t("notifications.viewAll")}</span>
          </footer>
        </div>
      </Popover>
    </>
  );
}
