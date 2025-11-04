import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, globalStyles } from '../styles/globalStyles';
import { FirestoreRouteDocument } from '../services/firestoreService';

interface RouteInfoSectionProps {
  title: string;
  value: string | undefined;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  icon?: string;
}

export default function RouteInfoSection({
  title,
  value,
  isEditing,
  editValue,
  onEditChange,
  placeholder,
  multiline = false,
  icon,
}: RouteInfoSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {isEditing ? (
        <TextInput
          style={[globalStyles.input, multiline ? styles.notesInput : styles.textInput]}
          value={editValue}
          onChangeText={onEditChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      ) : (
        <View style={styles.valueContainer}>
          {icon && <Ionicons name={icon as any} size={16} color={colors.textSecondary} />}
          <Text style={styles.fieldValue}>{value || (title.includes('Notes') ? 'No notes yet' : '—')}</Text>
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
  textInput: {
    marginTop: 8,
  },
  notesInput: {
    marginTop: 8,
    minHeight: 100,
    paddingTop: 12,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  fieldValue: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    lineHeight: 24,
  },
});

