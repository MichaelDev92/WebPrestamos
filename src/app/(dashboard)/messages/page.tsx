import type { Metadata } from "next";
import { MessagesPage } from "@/features/messages/components/MessagesPage/MessagesPage";

export const metadata: Metadata = {
  title: "Mensajes",
};

export default function Page() {
  return <MessagesPage />;
}
