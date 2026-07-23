import type { Metadata } from "next";
import { RequestDetail } from "@/features/requests/components/RequestDetail/RequestDetail";

export const metadata: Metadata = {
  title: "Detalle de solicitud",
};

export default async function RequestDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetail id={id} />;
}
