"use client";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity/types";
import "./Footer.css";

type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

type FooterProps = {
  logo?: SiteSettings["logo"];
  siteName?: SiteSettings["siteName"];
  copyrightText?: SiteSettings["copyrightText"];
  footerLinks?: SiteSettings["footerLinks"];
  certificationLogos?: SiteSettings["certificationLogos"];
  socialLinks?: SiteSettings["socialLinks"];
};

export default function Footer({
  logo,
  siteName,
  copyrightText,
  certificationLogos,
}: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const logoUrl = logo?.asset ? urlFor(logo).width(300).url() : null;
  const logoAlt = logo?.alt || siteName || "";

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          {/* Left: Logo */}
          <div className="footer-logo">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={150}
                height={60}
              />
            )}
          </div>

          {/* Center: Back to top + Copyright */}
          <div className="footer-center">
            <button
              className="back-to-top"
              onClick={scrollToTop}
              aria-label="Volver arriba"
            >
              <i className="bi bi-chevron-up"></i>
            </button>
            {copyrightText && (
              <p className="copyright">{copyrightText}</p>
            )}
          </div>

          {/* Right: Certification logos */}
          <div className="footer-certifications">
            {certificationLogos?.map((cert) => {
              const certImageUrl = cert.image?.asset
                ? urlFor(cert.image).width(100).url()
                : null;

              if (!certImageUrl) return null;

              const imageElement = (
                <Image
                  src={certImageUrl}
                  alt={cert.alt || ""}
                  width={50}
                  height={50}
                  className="cert-image"
                />
              );

              return cert.url ? (
                <a
                  key={cert._key}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={cert.title || cert.alt || ""}
                  className="cert-link"
                >
                  {imageElement}
                </a>
              ) : (
                <div key={cert._key} title={cert.title || cert.alt || ""} className="cert-placeholder">
                  {imageElement}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
