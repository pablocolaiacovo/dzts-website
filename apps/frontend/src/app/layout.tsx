import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Inter } from "next/font/google";
import BootstrapClient from "@/components/BootstrapClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/variables.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "DZTS Inmobiliaria",
    template: "%s | DZTS Inmobiliaria",
  },
  description:
    "Encontrá propiedades en venta y alquiler con DZTS Inmobiliaria. Casas, departamentos, terrenos y más.",
};

async function getSiteSettings() {
  "use cache";
  cacheLife("hours");
  const { data } = await sanityFetch({ query: SITE_SETTINGS_QUERY });
  return data;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();

  return (
    <html lang="es">
      <body className={inter.className}>
        <Header
          logo={siteSettings?.logo}
          siteName={siteSettings?.siteName}
          navigation={siteSettings?.mainNavigation}
        />
        <main>{children}</main>
        <Footer
          logo={siteSettings?.logo}
          siteName={siteSettings?.siteName}
          copyrightText={siteSettings?.copyrightText}
          footerLinks={siteSettings?.footerLinks}
          certificationLogos={siteSettings?.certificationLogos}
          socialLinks={siteSettings?.socialLinks}
        />
        <BootstrapClient />
      </body>
    </html>
  );
}
