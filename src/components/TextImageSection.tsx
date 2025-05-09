import Image from 'next/image';

interface TextImageSectionProps {
  title: string;
  mainParagraph: string; // Nuevo prop para el párrafo principal
  subtitle?: string;
  paragraphs: string[];
  image: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
}

export default function TextImageSection({
  title,
  mainParagraph,
  subtitle,
  paragraphs,
  image,
  imageAlt = 'Section image',
  imagePosition = 'left',
}: TextImageSectionProps) {
  return (
    <section className="container py-5">
      <div className={`row align-items-center flex-column flex-md-row${imagePosition === 'right' ? ' flex-md-row-reverse' : ''}`}>
        {/* Imagen circular */}
        <div className="col-12 col-md-6 d-flex flex-column align-items-center mb-4 mb-md-0">
          <div className="rounded-circle overflow-hidden mx-auto" style={{ width: 250, height: 250, maxWidth: '100%' }}>
            <Image
              src={image}
              alt={imageAlt}
              width={250}
              height={250}
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
        {/* Texto */}
        <div className="col-12 col-md-6 text-center text-md-start">
          <h2 className="fw-bold mb-3" style={{ color: '#01BCF3' }}>{title}</h2>
          <p className="text-black mb-3">{mainParagraph}</p>
          {subtitle && (
            <h3 className="fw-bold mb-2">
              <span style={{ color: '#01BCF3' }}>{subtitle.split(' ')[0]}</span>{' '}
              <span>{subtitle.split(' ').slice(1).join(' ')}</span>
            </h3>
          )}
          {paragraphs.map((text, idx) => (
            <p key={idx} className="text-black">{text}</p>
          ))}
        </div>
      </div>
    </section>
  );
}