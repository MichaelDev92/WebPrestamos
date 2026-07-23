"use client";

import { Menu, MoonStar, Sun } from "lucide-react";
import { useT } from "@/shared/hooks/useT";
import { useTheme } from "@/shared/hooks/useTheme";
import { IconButton } from "@/shared/components/ui/IconButton/IconButton";
import { UserMenu } from "@/shared/components/dashboard/UserMenu/UserMenu";
import { NotificationsMenu } from "@/shared/components/dashboard/NotificationsMenu/NotificationsMenu";
import { RequestsButton } from "@/shared/components/dashboard/RequestsButton/RequestsButton";
import { MessagesButton } from "@/shared/components/dashboard/MessagesButton/MessagesButton";
import styles from "./Topbar.module.css";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { t } = useT();
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <IconButton
          variant="ghost"
          size="sm"
          label="Abrir menú"
          className={styles.menuToggle}
          onClick={onOpenSidebar}
        >
          <Menu size={18} />
        </IconButton>
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={t("theme.toggle")}
          title={t("theme.toggle")}
        >
          {theme === "dark" ? <Sun size={16} /> : <MoonStar size={16} />}
        </button>

        <NotificationsMenu />

        <RequestsButton />

        <MessagesButton />

        <UserMenu />
      </div>
    </header>
  );
}
