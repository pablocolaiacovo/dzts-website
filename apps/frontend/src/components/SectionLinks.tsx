import Link from "next/link";
import type { PropertyListItem } from "@/components/PropertiesListing";
import { buildFilterCombos } from "@/lib/filterRoutes";

interface SectionLinksProps {
  properties: PropertyListItem[];
}

export default function SectionLinks({ properties }: SectionLinksProps) {
  const typeName: Record<string, string> = {};
  const cityName: Record<string, string> = {};
  for (const p of properties) {
    if (p.propertyTypeSlug && p.propertyType) typeName[p.propertyTypeSlug] = p.propertyType;
    if (p.citySlug && p.city) cityName[p.citySlug] = p.city;
  }

  const combos = buildFilterCombos(
    properties.map((p) => ({
      operationType: p.operationType,
      typeSlug: p.propertyTypeSlug,
      citySlug: p.citySlug,
    })),
  );
  const existing = new Set(combos.map((c) => c.join("/")));

  const links: { href: string; label: string }[] = [];
  const operations = [
    { slug: "venta", title: "Venta", phrase: "venta" },
    { slug: "alquiler", title: "Alquiler", phrase: "alquiler" },
  ] as const;

  for (const op of operations) {
    if (existing.has(op.slug)) {
      links.push({ href: `/propiedades/${op.slug}`, label: `En ${op.phrase}` });
    }
  }
  for (const op of operations) {
    for (const slug of Object.keys(typeName)) {
      if (existing.has(`${op.slug}/${slug}`)) {
        links.push({
          href: `/propiedades/${op.slug}/${slug}`,
          label: `${typeName[slug]} en ${op.phrase}`,
        });
      }
    }
  }
  for (const op of operations) {
    for (const slug of Object.keys(cityName)) {
      if (existing.has(`${op.slug}/${slug}`)) {
        links.push({
          href: `/propiedades/${op.slug}/${slug}`,
          label: `${op.title} en ${cityName[slug]}`,
        });
      }
    }
  }

  const seen = new Set<string>();
  const unique = links
    .filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)))
    .slice(0, 16);

  if (unique.length === 0) return null;

  return (
    <nav aria-label="Secciones" className="mb-4">
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        {unique.map((l) => (
          <Link key={l.href} href={l.href} className="btn btn-outline-secondary btn-sm">
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
