import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
    title: string;
    slug: string;
    subtitle?: string;
    price?: number;
    imageUrl?: string;
    operationType?: string;
}

export default function PropertyCard({ title, slug, subtitle, price, imageUrl, operationType }: PropertyCardProps) {
    return (
        <Link href={`/propiedades/${slug}`} className="text-decoration-none">
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