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

interface PhoneNumberScreenProps {
  value: string;
  onNext: (field: 'phoneNumber', value: string) => void;
  onBack?: () => void;
  onSkip: () => void;
  step: number;
  totalSteps: number;
  fieldName: 'phoneNumber';
}

export default function PhoneNumberScreen({ 
  value, 
  onNext, 
  onBack, 
  onSkip, 
  step, 
  totalSteps 
}: PhoneNumberScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState(value);
  const [isValid, setIsValid] = useState(false);

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Check if it's a valid US phone number (10 digits)
    const isValidPhone = digits.length === 10;
    setIsValid(isValidPhone);
    return isValidPhone;
  };

  const handleTextChange = (text: string) => {
    // Auto-format as user types
    let formatted = text.replace(/\D/g, ''); // Remove non-digits
    
    if (formatted.length >= 6) {
      formatted = `(${formatted.substring(0, 3)}) ${formatted.substring(3, 6)}-${formatted.substring(6, 10)}`;
    } else if (formatted.length >= 3) {
      formatted = `(${formatted.substring(0, 3)}) ${formatted.substring(3)}`;
    }
    
    setPhoneNumber(formatted);
    validatePhone(formatted);
  };

  const handleNext = () => {
    if (isValid) {
      onNext('phoneNumber', phoneNumber);
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
              What's your phone number?
            </Text>
            <Text style={[globalStyles.textSubheadingSmall, globalStyles.textSecondary]}>
              We'll use this for account security and important updates
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={[
                globalStyles.input,
                styles.input,
                isValid && styles.inputValid,
                !isValid && phoneNumber.length > 0 && styles.inputInvalid,
              ]}
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.textMuted}
              value={phoneNumber}
              onChangeText={handleTextChange}
              keyboardType="phone-pad"
              maxLength={14}
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
            
            {!isValid && phoneNumber.length > 0 && (
              <Text style={[globalStyles.textCaption, globalStyles.textError]}>
                Please enter a valid 10-digit phone number
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
