"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "./ImageCarousel.css";

const CAROUSEL_SIZES =
  "(min-width: 1400px) 746px, (min-width: 1200px) 641px, (min-width: 992px) 536px, (min-width: 768px) 696px, (min-width: 576px) 516px, 100vw";

const ImageLightbox = dynamic(() => import("./ImageLightbox"), { ssr: false });

interface CarouselImage {
  asset?: SanityImageSource | null;
  lqip?: string | null;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const hideLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;
    const onSlide = (event: Event) => {
      const { to } = event as Event & { to: number };
      if (typeof to === "number") setCurrentIndex(to);
    };
    element.addEventListener("slide.bs.carousel", onSlide);
    return () => element.removeEventListener("slide.bs.carousel", onSlide);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div>
        <div className="carousel-image-container position-relative">
          <Image
            src="https://placehold.co/1200x900/png"
            alt={`${title} - Sin imagen`}
            fill
            sizes={CAROUSEL_SIZES}
            className="object-fit-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      id="propertyCarousel"
      ref={carouselRef}
      className="carousel slide"
      {...(!prefersReducedMotion ? { 'data-bs-ride': 'carousel' } : {})}
    >
      <div className="carousel-inner">
        {images.map((image, index) => {
          const url = image.asset ? urlFor(image.asset).width(1200).height(900).quality(80).auto('format').url()
            : 'https://placehold.co/1200x900/png';

          return (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
              <div
                className="carousel-image-container position-relative"
                role="button"
                tabIndex={0}
                aria-label="Ver imagen en pantalla completa"
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }
                }}
              >
                <Image
                  src={url}
                  alt={`${title} - Imagen ${index + 1}`}
                  fill
                  sizes={CAROUSEL_SIZES}
                  className="object-fit-cover"
                  priority={index === 0}
                  {...(image.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {})}
                />
              </div>
            </div>
          )
        })}
      </div>
      {images.length > 1 && (
        <>
          <div className="carousel-counter badge rounded-pill position-absolute bottom-0 end-0 m-2">
            <i className="bi bi-camera-fill me-1" aria-hidden="true" />
            <span className="visually-hidden">Foto </span>
            {currentIndex + 1} / {images.length}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#propertyCarousel"
            data-bs-slide="prev"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }}
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#propertyCarousel"
            data-bs-slide="next"
            style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.4), transparent)' }}
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Siguiente</span>
          </button>
        </>
      )}
      {lightboxOpen && (
        <ImageLightbox
          show={lightboxOpen}
          onHide={hideLightbox}
          images={images}
          title={title}
          initialIndex={lightboxIndex}
        />
      )}
    </div>
  );
}
