import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';
import { FirestoreRouteDocument } from '../services/firestoreService';

interface RouteKeyFactorsProps {
  routeData: FirestoreRouteDocument;
}

export default function RouteKeyFactors({ routeData }: RouteKeyFactorsProps) {
  if (!routeData.grade.key_factors || routeData.grade.key_factors.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Key Factors</Text>
      {routeData.grade.key_factors.map((factor, index) => (
        <View key={index} style={styles.factorItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.black} />
          <Text style={styles.factorText}>{factor}</Text>
        </View>
      ))}
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
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  factorText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

