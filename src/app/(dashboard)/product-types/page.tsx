import type { Metadata } from "next";
import { ProductTypesPage } from "@/features/product-types/components/ProductTypesPage/ProductTypesPage";

export const metadata: Metadata = {
  title: "Tipos de producto",
};

export default function ProductTypesRoute() {
  return <ProductTypesPage />;
}
