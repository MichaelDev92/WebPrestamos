"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useT } from "@/shared/hooks/useT";
import { useSession } from "@/shared/hooks/useSession";
import { logoutAction } from "@/server/auth/actions";
import styles from "./UserMenu.module.css";

const ROLE_LABEL_KEY = {
  user: "auth.register.roles.user",
  admin: "auth.register.roles.admin",
  superadmin: "auth.register.roles.superadmin",
} as const;

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

export function UserMenu() {
  const { user } = useSession();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    startTransition(() => {
      void logoutAction();
    });
  };

  return (
    <div className={styles.wrap} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={styles.avatar} aria-hidden="true">
          {getInitials(user.fullName)}
        </span>
        <span className={styles.info}>
          <span className={styles.name}>{user.fullName}</span>
          <span className={styles.role}>{t(ROLE_LABEL_KEY[user.role])}</span>
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.userBlock}>
            <span className={styles.userName}>{user.fullName}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
          <button
            type="button"
            className={styles.menuItem}
            onClick={handleLogout}
            disabled={isPending}
            role="menuitem"
          >
            <LogOut size={14} />
            {t("auth.logout")}
          </button>
        </div>
      )}
    </div>
  );
}
