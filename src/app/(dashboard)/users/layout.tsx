import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { readSessionUser } from "@/server/auth/sessionUser";
import { REGISTER_ALLOWED_ROLES } from "@/types/auth";

/** Sección de usuarios: solo accesible por superadmin. */
export default async function UsersLayout({ children }: { children: ReactNode }) {
  const user = await readSessionUser();
  if (!user || !REGISTER_ALLOWED_ROLES.includes(user.role)) {
    redirect("/overview");
  }
  return <>{children}</>;
}
