import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/globalStyles';
import { FirestoreRouteDocument } from '../services/firestoreService';
import { formatDate } from '../utils/dateUtils';

interface RouteDetectionDetailsProps {
  routeData: FirestoreRouteDocument;
}

export default function RouteDetectionDetails({ routeData }: RouteDetectionDetailsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Detection Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Selected Color:</Text>
        <Text style={styles.detailValue}>{routeData.detection.selected_colour}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Detections Found:</Text>
        <Text style={styles.detailValue}>{routeData.detection.detections_count}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Model Used:</Text>
        <Text style={styles.detailValue}>{routeData.grade.model_used}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Scanned:</Text>
        <Text style={styles.detailValue}>{formatDate(routeData.createdAt)}</Text>
      </View>
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
});

