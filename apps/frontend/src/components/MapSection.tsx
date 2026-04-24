interface MapSectionProps {
  address?: string | null;
  embedUrl?: string | null;
  title: string;
}

export default function MapSection({ address, embedUrl, title }: MapSectionProps) {
  const mapSrc = embedUrl
    ? embedUrl
    : address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
      : null;

  if (!mapSrc) return null;

  return (
    <div className="w-100">
      <div style={{ width: "100%", height: "450px" }}>
        <iframe
          src={mapSrc}
          style={{ border: 0, width: "100%", height: "100%" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
      </div>
    </div>
  );
}
