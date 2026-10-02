import Image from "next/image";
import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import { ANALYTICS_EVENT } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { extractUrl } from "@/lib/url";
import { urlFor } from "@/sanity/lib/image";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity/types";
import "./Footer.css";

type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

type FooterProps = {
  logo?: SiteSettings["logo"];
  siteName?: SiteSettings["siteName"];
  footerLinks?: SiteSettings["footerLinks"];
  certificationLogos?: SiteSettings["certificationLogos"];
  socialLinks?: SiteSettings["socialLinks"];
  phone?: SiteSettings["phone"];
  email?: SiteSettings["email"];
  address?: SiteSettings["address"];
  officeHours?: SiteSettings["officeHours"];
  creditLine?: SiteSettings["creditLine"];
  footerTagline?: SiteSettings["footerTagline"];
  licenseNumber?: SiteSettings["licenseNumber"];
  whatsappNumber?: SiteSettings["whatsappNumber"];
  whatsappMessage?: SiteSettings["whatsappMessage"];
};

const platformIcons: Record<string, string> = {
  facebook: "bi-facebook",
  instagram: "bi-instagram",
  twitter: "bi-twitter-x",
  linkedin: "bi-linkedin",
  youtube: "bi-youtube",
};

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export default function Footer({
  logo,
  siteName,
  footerLinks,
  certificationLogos,
  socialLinks,
  phone,
  email,
  address,
  officeHours,
  creditLine,
  footerTagline,
  licenseNumber,
  whatsappNumber,
  whatsappMessage,
}: FooterProps) {
  const logoUrl = logo?.asset ? urlFor(logo).width(300).url() : null;
  const logoAlt = logo?.alt || siteName || "";
  const socials = (socialLinks ?? []).filter(
    (link): link is NonNullable<typeof link> & { url: string; platform: string } =>
      Boolean(link?.url && link.platform && platformIcons[link.platform]),
  );
  const links = (footerLinks ?? []).flatMap((link) => {
    const resolvedUrl = extractUrl(link?.url);
    return link?.label && resolvedUrl ? [{ ...link, resolvedUrl }] : [];
  });
  const certs = (certificationLogos ?? []).flatMap((cert) =>
    cert.image?.asset
      ? [
          {
            ...cert,
            src: urlFor(cert.image).width(100).url(),
            resolvedUrl: extractUrl(cert.url),
          },
        ]
      : [],
  );

  const hasBrand = Boolean(logoUrl || footerTagline || socials.length > 0);
  const hasContact = Boolean(address || phone || email || officeHours || whatsappNumber);
  const hasExplore = links.length > 0 || certs.length > 0;
  const year = new Date().getFullYear();
  const legal = [`© ${year}${siteName ? ` ${siteName}` : ""}`, licenseNumber]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="site-footer">
      {(hasBrand || hasContact || hasExplore) && (
        <div className="footer-main">
          <div className="container">
            <div className="row gy-0">
              {hasBrand && (
                <div className="col-lg-4 footer-col">
                  {logoUrl && (
                    <Image
                      src={logoUrl}
                      alt={logoAlt}
                      width={168}
                      height={60}
                      className="footer-logo mb-3"
                    />
                  )}
                  {footerTagline && (
                    <p className="footer-muted footer-tagline mb-3">{footerTagline}</p>
                  )}
                  {socials.length > 0 && (
                    <div className="footer-social">
                      {socials.map((link) => (
                        <a
                          key={link._key}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={platformLabels[link.platform] ?? link.platform}
                        >
                          <i className={`bi ${platformIcons[link.platform]}`} aria-hidden="true"></i>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hasContact && (
                <div className="col-lg-4 footer-col">
                  <h2 className="footer-heading">Contacto</h2>
                  {(address || phone || email || officeHours) && (
                    <ul className="footer-list mb-3">
                      {address && (
                        <li className="footer-contact-item">
                          <i className="bi bi-geo-alt" aria-hidden="true"></i>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {address}
                          </a>
                        </li>
                      )}
                      {phone && (
                        <li className="footer-contact-item">
                          <i className="bi bi-telephone" aria-hidden="true"></i>
                          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>
                        </li>
                      )}
                      {email && (
                        <li className="footer-contact-item">
                          <i className="bi bi-envelope" aria-hidden="true"></i>
                          <a href={`mailto:${email}`}>{email}</a>
                        </li>
                      )}
                      {officeHours && (
                        <li className="footer-contact-item">
                          <i className="bi bi-clock" aria-hidden="true"></i>
                          <span className="footer-muted">{officeHours}</span>
                        </li>
                      )}
                    </ul>
                  )}
                  {whatsappNumber && (
                    <TrackedLink
                      href={buildWhatsAppUrl(whatsappNumber, whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-footer-cta"
                      eventName={ANALYTICS_EVENT.whatsappContact}
                      eventParams={{ location: "footer" }}
                    >
                      <i className="bi bi-whatsapp" aria-hidden="true"></i>
                      Escribinos por WhatsApp
                    </TrackedLink>
                  )}
                </div>
              )}

              {hasExplore && (
                <div className="col-lg-4 footer-col">
                  {links.length > 0 && (
                    <>
                      <h2 className="footer-heading">Explorá</h2>
                      <ul className="footer-list footer-links mb-4">
                        {links.map((link) => (
                          <li key={link._key}>
                            {/^[/#]/.test(link.resolvedUrl) ? (
                              <Link href={link.resolvedUrl}>{link.label}</Link>
                            ) : (
                              <a href={link.resolvedUrl} target="_blank" rel="noopener noreferrer">
                                {link.label}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {certs.length > 0 && (
                    <div className="cert-row">
                      {certs.map((cert) => {
                        const title = cert.title || cert.alt || undefined;
                        const image = (
                          <Image
                            src={cert.src}
                            alt={cert.alt || ""}
                            width={50}
                            height={50}
                            className="cert-image"
                            loading="lazy"
                          />
                        );
                        return cert.resolvedUrl ? (
                          <a
                            key={cert._key}
                            href={cert.resolvedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={title}
                          >
                            {image}
                          </a>
                        ) : (
                          <span key={cert._key} title={title}>
                            {image}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="footer-bar">
        <div className="container">
          <span className="footer-credit">{legal}</span>
          {creditLine?.text && (
            <span className="footer-credit">
              {creditLine.url ? (
                <a href={creditLine.url} target="_blank" rel="noopener noreferrer">
                  {creditLine.text}
                </a>
              ) : (
                creditLine.text
              )}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
