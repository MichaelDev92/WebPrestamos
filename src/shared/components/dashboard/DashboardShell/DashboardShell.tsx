"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { Sidebar } from "@/shared/components/dashboard/Sidebar/Sidebar";
import { Topbar } from "@/shared/components/dashboard/Topbar/Topbar";
import styles from "./DashboardShell.module.css";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={styles.shell}>
      <aside className={clsx(styles.sidebar, mobileOpen && styles.sidebarOpen)}>
        <Sidebar onNavigate={closeMobile} />
      </aside>
      {mobileOpen && <div className={styles.overlay} onClick={closeMobile} aria-hidden="true" />}

      <div className={styles.main}>
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
