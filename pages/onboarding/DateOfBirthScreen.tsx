import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';
import KeyboardAwareButton from '../../components/KeyboardAwareButton';

interface DateOfBirthScreenProps {
  value: string;
  onNext: (field: 'dateOfBirth', value: string) => void;
  onBack?: () => void;
  onSkip: () => void;
  step: number;
  totalSteps: number;
  fieldName: 'dateOfBirth';
}

export default function DateOfBirthScreen({ 
  value, 
  onNext, 
  onBack, 
  onSkip, 
  step, 
  totalSteps 
}: DateOfBirthScreenProps) {
  const [dateOfBirth, setDateOfBirth] = useState(value);
  const [isValid, setIsValid] = useState(false);

  const validateDate = (date: string) => {
    // Simple date validation (MM/DD/YYYY format)
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    const isValidFormat = dateRegex.test(date);
    
    if (isValidFormat) {
      const [month, day, year] = date.split('/').map(Number);
      const inputDate = new Date(year, month - 1, day);
      const today = new Date();
      const age = today.getFullYear() - year;
      
      // Check if date is valid and person is at least 13 years old
      const isValidDate = inputDate.getFullYear() === year && 
                         inputDate.getMonth() === month - 1 && 
                         inputDate.getDate() === day &&
                         age >= 13 && age <= 120;
      
      setIsValid(isValidDate);
      return isValidDate;
    }
    
    setIsValid(false);
    return false;
  };

  const handleTextChange = (text: string) => {
    // Auto-format as user types
    let formatted = text.replace(/\D/g, ''); // Remove non-digits
    
    if (formatted.length >= 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
    }
    
    setDateOfBirth(formatted);
    validateDate(formatted);
  };

  const handleNext = () => {
    if (isValid) {
      onNext('dateOfBirth', dateOfBirth);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.container}
      >
        <View style={globalStyles.content}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <Text style={[globalStyles.textCaption, globalStyles.textMuted]}>
              Step {step} of {totalSteps}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>
              When's your birthday?
            </Text>
            <Text style={[globalStyles.textSubheadingSmall, globalStyles.textSecondary]}>
              We use this to personalize your experience
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={[
                globalStyles.input,
                styles.input,
                isValid && styles.inputValid,
                !isValid && dateOfBirth.length > 0 && styles.inputInvalid,
              ]}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={colors.textMuted}
              value={dateOfBirth}
              onChangeText={handleTextChange}
              keyboardType="numeric"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
            
            {!isValid && dateOfBirth.length > 0 && (
              <Text style={[globalStyles.textCaption, globalStyles.textError]}>
                Please enter a valid date (you must be at least 13 years old)
              </Text>
            )}
          </View>

          {/* Skip option */}
          <View style={styles.skipContainer}>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={[globalStyles.textBodySmall, globalStyles.textMuted]}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating action button */}
        <KeyboardAwareButton
          onPress={handleNext}
          disabled={!isValid}
          icon="→"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 2,
  },
  header: {
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  input: {
    fontSize: 18,
    paddingVertical: 20,
    textAlign: 'center',
  },
  inputValid: {
    borderColor: colors.success,
  },
  inputInvalid: {
    borderColor: colors.error,
  },
  skipContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});
