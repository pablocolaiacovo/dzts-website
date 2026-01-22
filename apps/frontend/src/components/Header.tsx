"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import ContactModal from "./ContactModal";
import "./Header.css";

export default function Header() {
  const [showContactModal, setShowContactModal] = useState(false);
  const navCollapseRef = useRef<HTMLDivElement>(null);

  const collapseNav = () => {
    const navElement = navCollapseRef.current;
    if (navElement?.classList.contains("show")) {
      navElement.classList.remove("show");
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    collapseNav();
    setShowContactModal(true);
  };

  const handleNavClick = () => {
    collapseNav();
  };

  return (
    <>
      <header className="sticky-header">
        <nav
          className="navbar navbar-expand-lg navbar-dark"
          style={{ backgroundColor: "#3d3d3d" }}
          aria-label="Main navigation"
        >
          <div className="container">
            <Link href="/" className="navbar-brand header-logo" aria-label="DZTS Inmobiliaria - Home">
              <Image
                src="/Images/logoDzts.png"
                alt="DZTS Inmobiliaria logo"
                width={150}
                height={60}
                priority
              />
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavigation"
              aria-controls="mainNavigation"
              aria-expanded="false"
              aria-label="Toggle navigation menu"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="mainNavigation" ref={navCollapseRef}>
              <ul className="navbar-nav header-nav ms-auto mb-2 mb-lg-0 gap-lg-3">
                <li className="nav-item">
                  <Link href="/propiedades" className="nav-link" onClick={handleNavClick}>
                    propiedades
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/servicios" className="nav-link" onClick={handleNavClick}>
                    servicios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/nosotros" className="nav-link" onClick={handleNavClick}>
                    nosotros
                  </Link>
                </li>
                <li className="nav-item">
                  <a
                    href="#contacto"
                    className="nav-link"
                    onClick={handleContactClick}
                    role="button"
                    aria-haspopup="dialog"
                  >
                    contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <ContactModal
        show={showContactModal}
        onHide={() => setShowContactModal(false)}
      />
    </>
  );
}
