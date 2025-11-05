import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { colors } from '../styles/globalStyles';

interface RouteImageDisplayProps {
  imageUri: string;
  onPressIn?: (e: any) => void;
  onPressOut?: () => void;
  holdPointScreen?: { x: number; y: number } | null;
  isHolding?: boolean;
  onImageLayout?: (e: any) => void;
}

export default function RouteImageDisplay({
  imageUri,
  onPressIn,
  onPressOut,
  holdPointScreen,
  isHolding = false,
  onImageLayout,
}: RouteImageDisplayProps) {
  return (
    <View style={styles.imageContainer}>
      <Pressable 
        style={styles.imagePressable} 
        onPressIn={onPressIn} 
        onPressOut={onPressOut}
      >
        <Image 
          key={`image-${imageUri}`}
          onLayout={onImageLayout}
          source={{ uri: imageUri }} 
          style={styles.fullScreenImage}
          resizeMode="contain"
        />
        {holdPointScreen && (
          <View
            pointerEvents="none"
            style={[
              styles.holdMarker,
              { left: holdPointScreen.x - 16, top: holdPointScreen.y - 16 },
              isHolding ? styles.holdMarkerActive : null,
            ]}
          />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  imagePressable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  holdMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  holdMarkerActive: {
    borderColor: colors.black,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
});

