"use client";

import { useState, FormEvent } from "react";
import "./ContactModal.css";

interface ContactModalProps {
  show: boolean;
  onHide: () => void;
}

export default function ContactModal({ show, onHide }: ContactModalProps) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (formData.get("botcheck")) {
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    onHide();
  };

  if (!show) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={handleClose}
        aria-hidden="true"
      ></div>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="contactModalTitle"
        aria-modal="true"
        onClick={handleClose}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="contactModalTitle">
                Contacto
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close contact form"
              ></button>
            </div>
            <div className="modal-body">
              {status === "success" ? (
                <div className="contact-success">
                  <p>¡Mensaje enviado con éxito!</p>
                  <p>Nos pondremos en contacto pronto.</p>
                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={handleClose}
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input
                    type="hidden"
                    name="access_key"
                    value={process.env.NEXT_PUBLIC_WEB3FORMS_KEY}
                  />
                  <input
                    type="checkbox"
                    name="botcheck"
                    className="d-none"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="mb-3">
                    <label htmlFor="contactName" className="form-label">
                      Nombre y Apellido
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="contactName"
                      name="name"
                      required
                      disabled={status === "submitting"}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contactEmail" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="contactEmail"
                      name="email"
                      required
                      disabled={status === "submitting"}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contactPhone" className="form-label">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="contactPhone"
                      name="phone"
                      disabled={status === "submitting"}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="contactComments" className="form-label">
                      Comentarios
                    </label>
                    <textarea
                      className="form-control"
                      id="contactComments"
                      name="message"
                      rows={4}
                      required
                      disabled={status === "submitting"}
                    ></textarea>
                  </div>

                  {status === "error" && (
                    <div className="contact-error mb-3">
                      Hubo un error al enviar el mensaje. Por favor, intente
                      nuevamente.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Enviando..." : "Enviar"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
