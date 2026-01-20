import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
    title: string;
    slug: string;
    subtitle?: string;
    price?: number;
    imageUrl?: string;
}

export default function PropertyCard({ title, slug, subtitle, price, imageUrl }: PropertyCardProps) {
    return (
        <Link href={`/properties/${slug}`} className="text-decoration-none">
            <div className="card shadow-sm rounded-4 border-0" style={{ maxWidth: 400 }}>
                <div className="position-relative">
                    <Image
                        src={imageUrl || '/Images/cardImage.jpg'}
                        alt={title}
                        width={400}
                        height={220}
                        className="card-img-top rounded-top-4"
                        style={{ objectFit: 'cover', height: 220 }}
                    />
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