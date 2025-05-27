import Image from 'next/image';

export default function PropertyCard() {
    return (
        <div className="card shadow-sm rounded-4 border-0" style={{ maxWidth: 400 }}>
            <div className="position-relative">
                <Image
                    src="/Images/cardImage.jpg"
                    alt="Foto propiedad"
                    width={400}
                    height={220}
                    className="card-img-top rounded-top-4"
                    style={{ objectFit: 'cover', height: 220 }}
                />
            </div>
            <div className="w-100 bg-primary" style={{ height: 4 }}></div>
            <div className="card-body text-center pb-2">
                <h5 className="fw-bold text-primary mb-0 fs-4">
                    Departamento
                </h5>
                <h6 className="fw-bold text-primary mb-3 fs-5">
                    1 dormitorio
                </h6>
                <p className="mb-3">
                    Lorem Ipsum is simply dummy text of the printing and typesetting
                </p>
                <div className="d-flex align-items-center justify-content-between border-top pt-3">
                    <span className="text-primary fs-4">
                        <i className="bi bi-share"></i>
                    </span>
                    <span className="fw-bold text-primary fs-4">
                        $178.000
                    </span>
                </div>
            </div>
        </div>
    );
}