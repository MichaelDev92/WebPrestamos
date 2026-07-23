import type { Metadata } from "next";
import { UsersPage } from "@/features/users/components/UsersPage/UsersPage";

export const metadata: Metadata = {
  title: "Usuarios",
};

export default function Page() {
  return <UsersPage />;
}
