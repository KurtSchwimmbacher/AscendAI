import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../styles/globalStyles';
import { FirestoreRouteDocument } from '../services/firestoreService';

interface RouteGradeSectionProps {
  routeData: FirestoreRouteDocument;
  isEditing: boolean;
  displayGrade: string;
  isManualGrade: boolean;
  manualGrade: string;
  onManualGradeChange: (value: string) => void;
}

export default function RouteGradeSection({
  routeData,
  isEditing,
  displayGrade,
  isManualGrade,
  manualGrade,
  onManualGradeChange,
}: RouteGradeSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.gradeHeader}>
        <View>
          <Text style={styles.sectionTitle}>Grade</Text>
          {isEditing ? (
            <TextInput
              style={[globalStyles.input, styles.gradeInput]}
              value={manualGrade}
              onChangeText={onManualGradeChange}
              placeholder="V3, V5, etc."
              placeholderTextColor={colors.textMuted}
            />
          ) : (
            <View style={styles.gradeContainer}>
              <Text style={styles.gradeValue}>{displayGrade}</Text>
              {isManualGrade && (
                <View style={styles.manualBadge}>
                  <Text style={styles.manualBadgeText}>Manual</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <Text style={styles.confidenceText}>
          {Math.round(routeData.grade.confidence * 100)}% confidence
        </Text>
      </View>

      {!isEditing && routeData.grade.reasoning && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Reasoning</Text>
          <Text style={styles.infoText}>{routeData.grade.reasoning}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  gradeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
  },
  manualBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  manualBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  gradeInput: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoBox: {
    backgroundColor: colors.whiteTint,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

