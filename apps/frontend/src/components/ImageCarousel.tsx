'use client';

import { urlFor } from '@/sanity/lib/image';
import { SanityImageSource } from '@sanity/image-url';
import Image from 'next/image';

interface ImageCarouselProps {
  images: SanityImageSource[];
  title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  if (images.length === 0) return null;

  return (
    <div id="propertyCarousel" className="carousel slide mb-4" data-bs-ride="carousel">
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#propertyCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
            aria-current={index === 0 ? 'true' : undefined}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
      <div className="carousel-inner">
        {images.map((asset, index) => {
          const url = asset ? urlFor(asset).width(1200).height(500).auto('format').url()
            : 'https://placehold.co/1200x500/png';

          return (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
              <div className="position-relative" style={{ height: '500px' }}>
                <Image
                  src={url}
                  alt={`${title} - Imagen ${index + 1}`}
                  fill
                  className="object-fit-cover"
                  priority={index === 0}
                />
              </div>
            </div>
          )
        })}
      </div>
      {images.length > 1 && (
        <>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#propertyCarousel"
            data-bs-slide="prev"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }}
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#propertyCarousel"
            data-bs-slide="next"
            style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.4), transparent)' }}
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </>
      )}
    </div>
  );
}
