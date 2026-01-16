'use client';

import './ContactSection.css';

interface ContactSectionProps {
    address: string;
    phones: string[];
    email: string;
    instagram: string;
}

const ContactSection = ({ address, phones, email, instagram }: ContactSectionProps) => (
    <section className="contact-section d-flex flex-column align-items-center justify-content-center pb-5">
        <h2 className="fs-1 text-white fw-bold mb-5 text-center">Contacto</h2>
        <div className="container">
            <div className="row g-4 justify-content-center">
                <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                    <div className="icon-circle bg-white mb-3">
                        <i className="bi bi-geo-alt-fill" style={{ color: '#56b6e6' }}></i>
                    </div>
                    <div className="fs-responsive text-break text-white text-center">{address}</div>
                </div>
                <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                    <div className="icon-circle mb-3" style={{ backgroundColor: '#222' }}>
                        <i className="bi bi-telephone-fill text-info"></i>
                    </div>
                    <div className="fs-responsive text-break text-white text-center text-md-start">
                        {phones.map((phone, idx) => (
                            <div key={idx}>{phone}</div>
                        ))}
                    </div>
                </div>
                <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                    <div className="icon-circle mb-3" style={{ backgroundColor: '#222' }}>
                        <i className="bi bi-envelope-fill text-info"></i>
                    </div>
                    <div className="fs-responsive text-break text-white text-center">{email}</div>
                </div>
                <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                    <a
                        href={`https://www.instagram.com/${instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none d-flex flex-column align-items-center"
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="icon-circle bg-white mb-3">
                            <i className="bi bi-instagram" style={{ color: '#56b6e6' }}></i>
                        </div>
                        <div className="fs-responsive text-break text-white text-center">{instagram}</div>
                    </a>
                </div>
            </div>
        </div>
    </section>
);

export default ContactSection;
