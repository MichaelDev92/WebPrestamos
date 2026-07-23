import type { Metadata } from "next";
import { RequestsPage } from "@/features/requests/components/RequestsPage/RequestsPage";

export const metadata: Metadata = {
  title: "Solicitudes",
};

export default function RequestsRoute() {
  return <RequestsPage />;
}
