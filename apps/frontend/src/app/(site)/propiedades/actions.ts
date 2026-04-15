"use server";

import { redirect } from "next/navigation";
import { defineQuery } from "next-sanity";
import { client } from "@/sanity/lib/client";

const REFERENCE_SLUG_QUERY = defineQuery(
  `*[_type == "property" && reference == $reference][0]{ "slug": slug.current }`,
);

export type ReferenceSearchState = { error: string } | null;

export async function searchByReference(
  _prev: ReferenceSearchState,
  formData: FormData,
): Promise<ReferenceSearchState> {
  const raw = (formData.get("reference") ?? "").toString().trim().toUpperCase();

  if (!raw) {
    return { error: "Ingresá un código de referencia." };
  }

  const normalized = raw.startsWith("DZTS-") ? raw : `DZTS-${raw}`;

  if (!/^DZTS-\d{3,}$/.test(normalized)) {
    return { error: "El formato debe ser DZTS-### (ej: DZTS-001)." };
  }

  const result = await client.fetch<{ slug: string | null } | null>(
    REFERENCE_SLUG_QUERY,
    { reference: normalized },
  );

  if (!result?.slug) {
    return { error: `No se encontró ninguna propiedad con el código ${normalized}.` };
  }

  redirect(`/propiedades/${result.slug}`);
}
