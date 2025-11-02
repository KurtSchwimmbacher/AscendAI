import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../styles/globalStyles';
import type { RouteGradeResponse } from '../hooks/readHook';

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
      <View style={styles.imageContainer}>
        <Pressable 
          style={styles.imagePressable} 
          onPressIn={onPressIn} 
          onPressOut={onPressOut}
        >
          <Image 
            key={imageUri}
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
            <Text style={styles.retakeButtonText}>Retake</Text>
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

      {/* Bottom Sheet with Grade Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sheetVisible}
        onRequestClose={() => setSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable 
            style={styles.sheetBackdrop} 
            onPress={() => setSheetVisible(false)} 
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
              {gradeLoading || (!gradeData && !gradeError) ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.black} />
                  <Text style={styles.loadingText}>Reading route…</Text>
                </View>
              ) : gradeError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Error</Text>
                  <Text style={styles.errorText}>{gradeError}</Text>
                </View>
              ) : gradeData ? (
                <>
                  <View style={styles.gradeHeader}>
                    <Text style={styles.gradeTitle}>Route Grade</Text>
                    <Text style={styles.gradeValue}>{gradeData.v_grade}</Text>
                    <Text style={styles.confidenceText}>
                      {Math.round(gradeData.confidence * 100)}% confidence
                    </Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reasoning</Text>
                    <Text style={styles.sectionText}>{gradeData.reasoning}</Text>
                  </View>

                  {gradeData.key_factors && gradeData.key_factors.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Key Factors</Text>
                      {gradeData.key_factors.map((factor, index) => (
                        <View key={index} style={styles.factorItem}>
                          <Text style={styles.factorBullet}>•</Text>
                          <Text style={styles.factorText}>{factor}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Difficulty Notes</Text>
                    <Text style={styles.sectionText}>{gradeData.difficulty_notes}</Text>
                  </View>

                  <View style={styles.metaSection}>
                    <Text style={styles.metaText}>
                      Model: {gradeData.model_used}
                    </Text>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retakeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  viewGradeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '40%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.black,
  },
  errorContainer: {
    paddingVertical: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.black,
  },
  gradeHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 20,
  },
  gradeTitle: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gradeValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 14,
    color: colors.black,
    opacity: 0.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: colors.black,
    lineHeight: 24,
  },
  factorItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  factorBullet: {
    fontSize: 16,
    color: colors.black,
    marginRight: 8,
    fontWeight: '700',
  },
  factorText: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    lineHeight: 24,
  },
  metaSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: colors.black,
    opacity: 0.5,
    textAlign: 'center',
  },
});

