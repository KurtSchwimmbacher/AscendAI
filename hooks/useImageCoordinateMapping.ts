import { useState, useCallback } from 'react';
import { Image } from 'react-native';

interface ImageSize {
  width: number;
  height: number;
}

interface ContainerSize {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface ScreenPoint {
  sx: number;
  sy: number;
}

interface UseImageCoordinateMappingReturn {
  containerSize: ContainerSize;
  imageSize: ImageSize | null;
  setImageSize: (size: ImageSize | null) => void;
  onImageLayout: (e: any) => void;
  mapTapToImagePixels: (tapX: number, tapY: number) => Point | null;
  mapImagePixelsToScreen: (px: number, py: number) => ScreenPoint | null;
}

/**
 * Hook for handling coordinate mapping between screen taps and image pixels
 * Handles the math for letterboxed images (resizeMode="contain")
 */
export function useImageCoordinateMapping(): UseImageCoordinateMappingReturn {
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  const onImageLayout = useCallback((e: any) => {
    setContainerSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  }, []);

  const mapTapToImagePixels = useCallback((tapX: number, tapY: number): Point | null => {
    if (!imageSize) return null;
    const { width: cw, height: ch } = containerSize;
    const { width: iw, height: ih } = imageSize;
    if (cw <= 0 || ch <= 0 || iw <= 0 || ih <= 0) return null;

    const scale = Math.min(cw / iw, ch / ih);
    const renderedW = iw * scale;
    const renderedH = ih * scale;
    const offsetX = (cw - renderedW) / 2;
    const offsetY = (ch - renderedH) / 2;

    // If tapped outside the actual rendered image area, ignore
    if (tapX < offsetX || tapX > offsetX + renderedW || tapY < offsetY || tapY > offsetY + renderedH) {
      return null;
    }

    const px = Math.round((tapX - offsetX) / scale);
    const py = Math.round((tapY - offsetY) / scale);
    return { x: px, y: py };
  }, [imageSize, containerSize]);

  const mapImagePixelsToScreen = useCallback<(px: number, py: number) => ScreenPoint | null>((px: number, py: number): ScreenPoint | null => {
    if (!imageSize) return null;
    const { width: cw, height: ch } = containerSize;
    const { width: iw, height: ih } = imageSize;
    const scale = Math.min(cw / iw, ch / ih);
    const renderedW = iw * scale;
    const renderedH = ih * scale;
    const offsetX = (cw - renderedW) / 2;
    const offsetY = (ch - renderedH) / 2;
    return { sx: offsetX + px * scale, sy: offsetY + py * scale };
  }, [imageSize, containerSize]);

  const returnValue: UseImageCoordinateMappingReturn = {
    containerSize,
    imageSize,
    setImageSize,
    onImageLayout,
    mapTapToImagePixels,
    mapImagePixelsToScreen,
  };
  
  return returnValue;
}

/**
 * Utility to load image dimensions
 */
export function loadImageSize(imageUri: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      imageUri,
      (w, h) => resolve({ width: w, height: h }),
      (error) => reject(error)
    );
  });
}

