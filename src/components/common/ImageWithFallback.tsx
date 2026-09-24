'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackText?: string;
  fallbackSubtext?: string;
  aspectRatioClass?: string;
  containerClassName?: string;
  priority?: 'high' | 'low' | 'auto';
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackText = 'AURA APPAREL',
  fallbackSubtext = 'ARCHIVAL PIECE',
  aspectRatioClass = 'aspect-[3/4]',
  containerClassName = '',
  className = '',
  priority,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setHasError(false);
    // If the image is already complete in the browser (e.g. from cache or SSR)
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
        return;
      }
    }
    setIsLoaded(false);

    // Short safety timer for cached browser images that don't trigger onLoad
    if (typeof window !== 'undefined' && src && !src.includes('broken') && !src.includes('does-not-exist')) {
      const timer = setTimeout(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
          setIsLoaded(true);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [src]);

  const isEmptySrc = !src || typeof src !== 'string' || src.trim() === '';
  const showFallback = isEmptySrc || hasError;

  const generateSvgFallback = (title: string, sub: string) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
        <rect width="600" height="800" fill="#F5F3EF"/>
        <rect x="24" y="24" width="552" height="752" fill="none" stroke="#E5E0D5" stroke-width="1.5"/>
        <line x1="24" y1="24" x2="576" y2="776" stroke="#ECE8DF" stroke-width="0.5"/>
        <line x1="576" y1="24" x2="24" y2="776" stroke="#ECE8DF" stroke-width="0.5"/>
        <circle cx="300" cy="400" r="140" fill="#EFECE4" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.5"/>
        <text x="300" y="380" font-family="'Bodoni Moda', Georgia, serif" font-size="36" fill="#0D0D0D" text-anchor="middle" letter-spacing="4">AURA</text>
        <text x="300" y="415" font-family="'Hanken Grotesk', -apple-system, sans-serif" font-size="11" font-weight="600" fill="#D4AF37" text-anchor="middle" letter-spacing="3">${title.toUpperCase()}</text>
        <text x="300" y="440" font-family="'Hanken Grotesk', -apple-system, sans-serif" font-size="9" fill="#707070" text-anchor="middle" letter-spacing="2">${sub.toUpperCase()}</text>
        <text x="300" y="740" font-family="'Hanken Grotesk', -apple-system, sans-serif" font-size="8" fill="#999999" text-anchor="middle" letter-spacing="3">EDITION ARCHIVE / 01</text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#F5F3EF] ${aspectRatioClass} ${containerClassName}`}
      data-testid="image-fallback-container"
    >
      {!isLoaded && !showFallback && (
        <div className="absolute inset-0 bg-[#EFECE4] animate-pulse flex items-center justify-center">
          <span className="font-serif text-[#A09888] text-xs tracking-widest uppercase">
            AURA
          </span>
        </div>
      )}

      {showFallback ? (
        <img
          src={generateSvgFallback(fallbackText, fallbackSubtext)}
          alt={`${alt} (Offline Placeholder)`}
          className={`w-full h-full object-cover select-none ${className}`}
          data-testid="fallback-image-svg"
        />
      ) : (
        <img
          ref={(node) => {
            imgRef.current = node;
            if (node && node.complete && node.naturalWidth > 0 && !isLoaded) {
              setIsLoaded(true);
            }
          }}
          src={src}
          alt={alt}
          fetchPriority={priority}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
};
