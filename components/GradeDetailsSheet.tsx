import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../styles/globalStyles';
import type { RouteGradeResponse } from '../hooks/readHook';

interface GradeDetailsSheetProps {
  visible: boolean;
  gradeData: RouteGradeResponse | null;
  gradeLoading: boolean;
  gradeError: string | null;
  onClose: () => void;
}

export default function GradeDetailsSheet({
  visible,
  gradeData,
  gradeLoading,
  gradeError,
  onClose,
}: GradeDetailsSheetProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
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
                  <Text style={styles.metaText}>Model: {gradeData.model_used}</Text>
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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

