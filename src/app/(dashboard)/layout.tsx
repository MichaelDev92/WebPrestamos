import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { readSessionUser } from "@/server/auth/sessionUser";
import { DASHBOARD_ALLOWED_ROLES } from "@/types/auth";
import { SessionProvider } from "@/shared/components/session/SessionProvider";
import { DashboardShell } from "@/shared/components/dashboard/DashboardShell/DashboardShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await readSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (!DASHBOARD_ALLOWED_ROLES.includes(user.role)) {
    redirect("/login");
  }

  return (
    <SessionProvider user={user}>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  );
}
