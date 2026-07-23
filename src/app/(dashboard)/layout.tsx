import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { readSessionUser } from "@/server/auth/sessionUser";
import { readRefreshToken } from "@/server/auth/session";
import { getTokenExpiryMs, isTokenExpired } from "@/server/auth/jwt";
import { DASHBOARD_ALLOWED_ROLES } from "@/types/auth";
import { SessionProvider } from "@/shared/components/session/SessionProvider";
import { SessionWatcher } from "@/shared/components/session/SessionWatcher";
import { ChatProvider } from "@/features/messages/context/ChatProvider";
import { RequestsProvider } from "@/features/requests/context/RequestsProvider";
import { DashboardShell } from "@/shared/components/dashboard/DashboardShell/DashboardShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await readSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (!DASHBOARD_ALLOWED_ROLES.includes(user.role)) {
    redirect("/login");
  }

  const refreshToken = await readRefreshToken();
  const absoluteExpiresAt = getTokenExpiryMs(refreshToken);
  if (isTokenExpired(refreshToken)) {
    redirect("/login");
  }

  return (
    <SessionProvider user={user}>
      <SessionWatcher absoluteExpiresAt={absoluteExpiresAt} />
      <RequestsProvider>
        <ChatProvider>
          <DashboardShell>{children}</DashboardShell>
        </ChatProvider>
      </RequestsProvider>
    </SessionProvider>
  );
}
