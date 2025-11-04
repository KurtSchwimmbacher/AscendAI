import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';
import type { RouteGradeResponse } from '../hooks/readHook';
import RouteImageDisplay from './RouteImageDisplay';
import GradeDetailsSheet from './GradeDetailsSheet';

interface ScannedRouteDisplayProps {
  imageUri: string | null;
  gradeData: RouteGradeResponse | null;
  gradeLoading: boolean;
  gradeError: string | null;
  isAnnotated?: boolean;
  onRetake: () => void;
  onClose?: () => void;
  onPressIn?: (e: any) => void;
  onPressOut?: () => void;
  holdPointScreen?: { x: number; y: number } | null;
  isHolding?: boolean;
  onImageLayout?: (e: any) => void;
}

export default function ScannedRouteDisplay({
  imageUri,
  gradeData,
  gradeLoading,
  gradeError,
  isAnnotated = false,
  onRetake,
  onClose,
  onPressIn,
  onPressOut,
  holdPointScreen,
  isHolding = false,
  onImageLayout,
}: ScannedRouteDisplayProps) {
  const [sheetVisible, setSheetVisible] = useState(false);

  // Auto-open sheet immediately when annotated image appears
  useEffect(() => {
    if (isAnnotated) {
      setSheetVisible(true);
    } else {
      // Close sheet when switching back to raw image
      setSheetVisible(false);
    }
  }, [isAnnotated]);

  if (!imageUri) return null;

  return (
    <>
      <View style={styles.container}>
        <RouteImageDisplay
          imageUri={imageUri}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          holdPointScreen={holdPointScreen}
          isHolding={isHolding}
          onImageLayout={onImageLayout}
        />

        {/* Grade indicator - only show when image is annotated */}
        {isAnnotated && gradeData && !gradeLoading && (
          <Pressable 
            style={styles.gradeIndicator}
            onPress={() => setSheetVisible(true)}
          >
            <Text style={styles.gradeIndicatorText}>
              {gradeData.v_grade}
            </Text>
          </Pressable>
        )}
        {isAnnotated && gradeLoading && (
          <View style={styles.gradeIndicator}>
            <ActivityIndicator size="small" color={colors.white} />
            <Text style={styles.gradeIndicatorText}>Reading route…</Text>
          </View>
        )}

        {/* Bottom Controls - Retake, View Grade, and Close */}
        <View style={styles.bottomControls}>
          <Pressable style={styles.retakeButton} onPress={onRetake}>
            <Ionicons name="camera-outline" size={24} color={colors.white} />
          </Pressable>
          {isAnnotated && (gradeData || gradeError) && (
            <Pressable style={styles.viewGradeButton} onPress={() => setSheetVisible(true)}>
              <Text style={styles.viewGradeButtonText}>View Grade</Text>
            </Pressable>
          )}
          {onClose && (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      <GradeDetailsSheet
        visible={sheetVisible}
        gradeData={gradeData}
        gradeLoading={gradeLoading}
        gradeError={gradeError}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    paddingBottom: 4,
  },
  retakeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewGradeButton: {
    backgroundColor: colors.red,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewGradeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  gradeIndicator: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeIndicatorText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
});

