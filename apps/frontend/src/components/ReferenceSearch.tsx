"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  searchByReference,
  type ReferenceSearchState,
} from "@/app/(site)/propiedades/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-outline-primary"
      disabled={pending}
      aria-busy={pending}
      aria-label="Buscar por referencia"
    >
      {pending ? (
        <span
          className="spinner-border spinner-border-sm"
          aria-hidden="true"
        />
      ) : (
        <i className="bi bi-search" aria-hidden="true" />
      )}
    </button>
  );
}

export default function ReferenceSearch() {
  const [state, formAction] = useActionState<ReferenceSearchState, FormData>(
    searchByReference,
    null,
  );

  return (
    <div className="mb-4 pb-3 border-bottom">
      <label
        htmlFor="reference-search"
        className="fw-semibold small text-uppercase text-muted d-block mb-2"
      >
        Buscar por referencia
      </label>
      <form action={formAction} className="d-flex gap-2">
        <input
          id="reference-search"
          name="reference"
          type="text"
          className="form-control form-control-sm"
          placeholder="DZTS-001"
          autoComplete="off"
          inputMode="text"
        />
        <SubmitButton />
      </form>
      {state?.error && (
        <div className="text-danger small mt-2" role="alert">
          {state.error}
        </div>
      )}
    </div>
  );
}
