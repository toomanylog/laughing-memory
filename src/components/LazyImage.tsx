import { useState, useEffect } from 'react';
import { Box, Skeleton, SxProps, Theme } from '@mui/material';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sx?: SxProps<Theme>;
}

const LazyImage = ({ src, alt, width = '100%', height = '100%', objectFit = 'cover', sx }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setError(true);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (error) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          ...sx,
        }}
      >
        <Box component="span" sx={{ color: 'text.secondary' }}>
          Image non disponible
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width, height, ...sx }}>
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          animation="wave"
        />
      )}
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: '100%',
          height: '100%',
          objectFit,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </Box>
  );
};

export default LazyImage; 