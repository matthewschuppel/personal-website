import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.summary,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://matthewschuppel.com"),
  icons: {
    icon: "/icon.svg"
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.summary,
    url: "https://matthewschuppel.com",
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/matthew-portrait.jpg",
        width: 1600,
        height: 2132,
        alt: "Matthew Schuppel"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.summary,
    images: ["/images/matthew-portrait.jpg"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
