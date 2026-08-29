import React from 'react';

export interface NextImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
  src: string;
  alt?: string;
  fill?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  sizes?: string;
  unoptimized?: boolean;
  [key: string]: any;
}

export default function Image({
  src,
  alt = '',
  fill,
  width,
  height,
  className = '',
  style = {},
  priority = false,
  quality,
  placeholder,
  blurDataURL,
  unoptimized,
  ...props
}: NextImageProps) {
  const combinedStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: 'cover',
        ...style,
      }
    : style;

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={combinedStyle}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
}

export { Image };
