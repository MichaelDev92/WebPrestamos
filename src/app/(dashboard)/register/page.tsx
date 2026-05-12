import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { readSessionUser } from "@/server/auth/sessionUser";
import { REGISTER_ALLOWED_ROLES } from "@/types/auth";

export const metadata: Metadata = {
  title: "Registrar usuario",
};

export default async function RegisterPage() {
  const user = await readSessionUser();
  if (!user || !REGISTER_ALLOWED_ROLES.includes(user.role)) {
    redirect("/overview");
  }
  return (
    <div>
      <h1>Registrar usuario</h1>
      <p>Solo accesible para super admin. Formulario por construir.</p>
    </div>
  );
}
