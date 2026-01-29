"use client";

export default function ScrollToTopButton() {
  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
    >
      <i className="bi bi-chevron-up"></i>
    </button>
  );
}
