import "./MapSection.css";

interface MapSectionProps {
  address?: string | null;
  embedUrl?: string | null;
  title: string;
  id?: string;
  variant?: "default" | "footer";
}

export default function MapSection({
  address,
  embedUrl,
  title,
  id,
  variant = "default",
}: MapSectionProps) {
  const mapSrc = embedUrl
    ? embedUrl
    : address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : null;

  if (!mapSrc) return null;

  return (
    <div
      className={`map-section w-100${variant === "footer" ? " map-section-footer" : ""}`}
      id={id}
    >
      <iframe
        src={mapSrc}
        className="d-block w-100 h-100 border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
      />
    </div>
  );
}
