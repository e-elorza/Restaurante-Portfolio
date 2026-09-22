import type { Metadata, Viewport } from "next";

import "./globals.css";
import { getSeoSettings } from "@/lib/data/settings";
import { getMediaSlotUrls } from "@/lib/data/content";
import { siteUrl } from "@/lib/site-url";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1C1917",
};

export async function generateMetadata(): Promise<Metadata> {
  // As imagens da marca moram todas em Mídia — um lugar só para cada uma.
  const [seo, media] = await Promise.all([getSeoSettings(), getMediaSlotUrls()]);
  const favicon = media["favicon"];
  const ogImage = media["imagem-compartilhamento"];

  const keywords = seo.keywords
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: seo.siteTitle,
      template: seo.titleTemplate?.includes("%s") ? seo.titleTemplate : "%s",
    },
    description: seo.description,
    keywords: keywords.length > 0 ? keywords : undefined,
    robots: seo.indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      title: seo.siteTitle,
      description: seo.description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.siteTitle,
      description: seo.description,
      images: ogImage ? [ogImage] : undefined,
    },
    verification: seo.googleVerification
      ? { google: seo.googleVerification }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
