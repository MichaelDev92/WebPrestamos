import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { AppProviders } from "@/shared/components/providers/AppProviders";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/i18n.constants";
import { getDictionary } from "@/shared/lib/i18n/getDictionary";
import "@/shared/styles/globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WebPréstamos",
    template: "%s · WebPréstamos",
  },
  description: "Dashboard administrativo de préstamos",
};

export const viewport: Viewport = {
  themeColor: "#02040a",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const dictionary = await getDictionary(DEFAULT_LOCALE);
  return (
    <html lang="es" data-theme="dark" className={geistSans.variable}>
      <body>
        <AppProviders locale={DEFAULT_LOCALE} dictionary={dictionary}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
