import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from "@/sanity/lib/image";
import { SanityImageSource } from '@sanity/image-url';

interface PropertyCardProps {
    title?: string | null;
    slug?: string | null;
    subtitle?: string;
    price?: number;
    image?: SanityImageSource;
    operationType?: string;
}

export default function PropertyCard({ title, slug, subtitle, price, image, operationType }: PropertyCardProps) {
    const imageUrl = image
        ? urlFor(image)
            .height(220)
            .width(400)
            .quality(80)
            .auto("format")
            .url()
        : "https://placehold.co/400x220/png";

    return (
        <Link href={`/propiedades/${slug}`} className="text-decoration-none">
            <div className="card shadow-sm rounded-4 border-0" style={{ maxWidth: 400 }}>
                <div className="position-relative">
                    <Image
                        src={imageUrl || 'https://placehold.co/400x220/png'}
                        alt={title || 'Property Image'}
                        width={400}
                        height={220}
                        className="card-img-top rounded-top-4"
                        style={{ objectFit: 'cover', height: 220 }}
                    />
                    {operationType && (
                        <span
                            className={`position-absolute top-0 end-0 m-2 badge rounded-pill ${operationType === 'venta' ? 'bg-success' : 'bg-warning text-dark'}`}
                        >
                            {operationType === 'venta' ? 'Venta' : 'Alquiler'}
                        </span>
                    )}
                </div>
                <div className="w-100 bg-primary" style={{ height: 4 }}></div>
                <div className="card-body text-center pb-2">
                    <h5 className="fw-bold text-primary mb-3 fs-4">
                        {title}
                    </h5>
                    {subtitle && (
                        <p className="mb-3 text-body">{subtitle}</p>
                    )}
                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <span className="text-primary fs-4">
                            <i className="bi bi-share"></i>
                        </span>
                        <span className="fw-bold text-primary fs-4">
                            {price != null ? `$${price.toLocaleString()}` : 'Consultar precio'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}