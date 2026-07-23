"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import {
  BarChart3,
  Boxes,
  ChevronRight,
  ClipboardList,
  Layers3,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { useT } from "@/shared/hooks/useT";
import { useSession } from "@/shared/hooks/useSession";
import { DASHBOARD_ALLOWED_ROLES, REGISTER_ALLOWED_ROLES } from "@/types/auth";
import type { TranslationKey } from "@/shared/lib/i18n/translate";
import styles from "./Sidebar.module.css";

interface NavItem {
  href: string;
  label: TranslationKey;
  icon: ComponentType<{ size?: number }>;
  superadminOnly?: boolean;
  resolverOnly?: boolean;
}

interface UpcomingItem {
  label: TranslationKey;
  icon: ComponentType<{ size?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "nav.overview", icon: BarChart3 },
  { href: "/clients", label: "nav.clients", icon: Users },
  { href: "/products", label: "nav.products", icon: Boxes },
  { href: "/product-types", label: "nav.productTypes", icon: Layers3 },
  { href: "/solicitudes", label: "nav.requests", icon: ClipboardList, resolverOnly: true },
  { href: "/users", label: "nav.users", icon: ShieldCheck, superadminOnly: true },
];

const UPCOMING_ITEMS: UpcomingItem[] = [];

/** Versión de la app (inyectada desde package.json en next.config). */
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION;

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useT();
  const { hasAnyRole } = useSession();
  const canRegister = hasAnyRole(REGISTER_ALLOWED_ROLES);
  const canResolve = hasAnyRole(DASHBOARD_ALLOWED_ROLES);

  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      <Link href="/overview" className={styles.brand} onClick={onNavigate}>
        <span className={styles.brandMark} aria-hidden="true" />
        <span className={styles.brandText}>WebPréstamos</span>
      </Link>

      <ul className={styles.section}>
        {NAV_ITEMS.filter(
          (item) =>
            (!item.superadminOnly || canRegister) && (!item.resolverOnly || canResolve),
        ).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={clsx(styles.link, active && styles.active)}
              >
                <Icon size={18} />
                <span>{t(item.label)}</span>
                {active && <ChevronRight size={14} className={styles.activeArrow} aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>

      {UPCOMING_ITEMS.length > 0 && (
      <div className={styles.upcomingBlock}>
        <p className={styles.upcomingLabel}>{t("theme.comingSoon")}</p>
        <ul className={styles.section}>
          {UPCOMING_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <span className={clsx(styles.link, styles.disabled)}>
                  <Icon size={18} />
                  <span>{t(item.label)}</span>
                  <Lock size={12} className={styles.lock} aria-hidden="true" />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      )}

      {APP_VERSION && (
        <footer className={styles.footer}>
          <span>v{APP_VERSION}</span>
        </footer>
      )}
    </nav>
  );
}
