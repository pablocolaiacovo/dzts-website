"use client";

import Image from "next/image";
import "./Footer.css";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          {/* Left: Logo */}
          <div className="footer-logo">
            <Image
              src="/Images/logoDzts.png"
              alt="DZTS Inmobiliaria"
              width={150}
              height={60}
            />
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
            <p className="copyright">
              2015 © DZTS Inmobiliaria | Todos los derechos reservados
            </p>
          </div>

          {/* Right: Certification logos (placeholders) */}
          <div className="footer-certifications">
            <div className="cert-placeholder" title="Colegio de Corredores Inmobiliarios">
              <i className="bi bi-building"></i>
            </div>
            <div className="cert-placeholder" title="Data Fiscal">
              <i className="bi bi-qr-code"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
