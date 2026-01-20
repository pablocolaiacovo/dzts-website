
import Image from 'next/image';

interface TextImageSectionProps {
  title: string;
  mainParagraph: string; 
  subtitle?: string;
  paragraphs: string[];
  image: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}

export default function TextImageSection({
  title,
  mainParagraph,
  subtitle,
  paragraphs,
  image,
  imageAlt = 'Section image',
  imagePosition = 'left',
  backgroundColor,
  titleColor,
  subtitleColor,
}: TextImageSectionProps) {

  const isDarkBackground = backgroundColor === 'var(--bs-dark)';
  const isBlueBackground = backgroundColor === 'var(--bs-primary)';
  const defaultTitleColor = isDarkBackground ? 'var(--bs-secondary)' : isBlueBackground ? 'var(--bs-dark)' : 'var(--bs-primary)';
  const defaultSubtitleColor = isDarkBackground ? 'var(--bs-primary)' : isBlueBackground ? 'var(--bs-dark)' : 'var(--bs-primary)';
  const textColor = isDarkBackground ? 'var(--bs-secondary)' : isBlueBackground ? 'var(--bs-dark)' : 'var(--bs-dark)';

  return (
    <div 
      className={`w-100 ${isDarkBackground ? 'bg-black text-white' : ''}`}
      style={{ 
        backgroundColor: backgroundColor || 'transparent',
        opacity: isDarkBackground ? 0.95 : 1
      }}
    >
      <div className="container py-5">
        <div className={`row align-items-center flex-column flex-md-row${imagePosition === 'right' ? ' flex-md-row-reverse' : ''}`}>
          {/* Imagen circular */}
          <div className="col-12 col-md-6 d-flex flex-column align-items-center mb-4 mb-md-0 order-2 order-md-1">
            <div className="rounded-circle overflow-hidden mx-auto" style={{ width: 250, height: 250, maxWidth: '100%' }}>
              <Image
                src={image}
                alt={imageAlt}
                width={250}
                height={250}
                className="object-fit-cover"
              />
            </div>
          </div>
          {/* Texto */}
          <div className="col-12 col-md-6 text-center text-md-start order-1 order-md-2">
            <h2 className="fw-bold mb-3" style={{ color: titleColor || defaultTitleColor }}>{title}</h2>
            <p className="mb-3" style={{ color: textColor }}>{mainParagraph}</p>
            {subtitle && (
              <h3 className="fw-bold mb-2">
                <span style={{ color: subtitleColor || defaultSubtitleColor }}>{subtitle.split(' ')[0]}</span>{' '}
                <span style={{ color: textColor }}>{subtitle.split(' ').slice(1).join(' ')}</span>
              </h3>
            )}
            {paragraphs.map((text, idx) => (
              <p key={idx} className="mb-2" style={{ color: textColor }}>{text}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}