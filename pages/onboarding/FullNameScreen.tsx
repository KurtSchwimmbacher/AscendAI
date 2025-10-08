import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../../styles/globalStyles';
import KeyboardAwareButton from '../../components/KeyboardAwareButton';

interface FullNameScreenProps {
  value: string;
  onNext: (field: 'fullName', value: string) => void;
  onBack?: () => void;
  onSkip: () => void;
  step: number;
  totalSteps: number;
  fieldName: 'fullName';
}

export default function FullNameScreen({ 
  value, 
  onNext, 
  onBack, 
  onSkip, 
  step, 
  totalSteps 
}: FullNameScreenProps) {
  const [fullName, setFullName] = useState(value);
  const [isValid, setIsValid] = useState(false);

  const validateName = (name: string) => {
    const trimmed = name.trim();
    const isValidName = trimmed.length >= 2 && /^[a-zA-Z\s]+$/.test(trimmed);
    setIsValid(isValidName);
    return isValidName;
  };

  const handleTextChange = (text: string) => {
    setFullName(text);
    validateName(text);
  };

  const handleNext = () => {
    if (isValid) {
      onNext('fullName', fullName.trim());
    }
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
              What's your name?
            </Text>
            <Text style={[globalStyles.textSubheadingSmall, globalStyles.textSecondary]}>
              This will be displayed on your profile
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={[
                globalStyles.input,
                styles.input,
                isValid && styles.inputValid,
                !isValid && fullName.length > 0 && styles.inputInvalid,
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={handleTextChange}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
            
            {!isValid && fullName.length > 0 && (
              <Text style={[globalStyles.textCaption, globalStyles.textError]}>
                Please enter a valid name (at least 2 characters, letters only)
              </Text>
            )}
          </View>

          {/* Skip option */}
          <View style={styles.skipContainer}>
            <Text style={[globalStyles.textBodySmall, globalStyles.textMuted]}>
              You can add this later in your profile
            </Text>
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
