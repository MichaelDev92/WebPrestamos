"use client";

import { Menu, MoonStar } from "lucide-react";
import { useT } from "@/shared/hooks/useT";
import { IconButton } from "@/shared/components/ui/IconButton/IconButton";
import { UserMenu } from "@/shared/components/dashboard/UserMenu/UserMenu";
import styles from "./Topbar.module.css";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { t } = useT();
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
          disabled
          aria-label={t("theme.toggle")}
          title={t("theme.comingSoon")}
        >
          <MoonStar size={16} />
          <span className={styles.themeBadge}>{t("theme.comingSoon")}</span>
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
