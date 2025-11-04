import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../styles/globalStyles';

interface ProfileFieldProps {
  icon: string;
  label: string;
  value: string | undefined;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

export default function ProfileField({ 
  icon, 
  label, 
  value, 
  editable, 
  onChangeText, 
  placeholder 
}: ProfileFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon as any} size={20} color={colors.black} />
      </View>
      <View style={styles.fieldContent}>
        <Text style={[globalStyles.textCaption, globalStyles.textMuted]}>{label}</Text>
        {editable && onChangeText ? (
          <TextInput
            style={[globalStyles.input, styles.editableInput]}
            value={value || ''}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
          />
        ) : (
          <Text style={[globalStyles.textBody, globalStyles.textPrimary]}>{value || '—'}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  fieldContent: {
    flex: 1,
  },
  editableInput: {
    marginTop: 4,
    paddingVertical: 8,
    fontSize: 16,
  },
});

