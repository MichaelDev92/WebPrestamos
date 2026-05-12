import type { Metadata } from "next";
import { OverviewPage } from "@/features/overview/components/OverviewPage/OverviewPage";

export const metadata: Metadata = {
  title: "Resumen",
};

export default function OverviewRoute() {
  return <OverviewPage />;
}
