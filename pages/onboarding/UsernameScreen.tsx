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

interface UsernameScreenProps {
  value: string;
  onNext: (field: 'username', value: string) => void;
  onBack?: () => void;
  onSkip: () => void;
  step: number;
  totalSteps: number;
  fieldName: 'username';
}

export default function UsernameScreen({ 
  value, 
  onNext, 
  onBack, 
  onSkip, 
  step, 
  totalSteps 
}: UsernameScreenProps) {
  const [username, setUsername] = useState(value);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateUsername = (name: string) => {
    const trimmed = name.trim();
    // Username validation: 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    
    if (trimmed.length === 0) {
      setIsValid(false);
      setErrorMessage('');
      return false;
    }
    
    if (trimmed.length < 3) {
      setIsValid(false);
      setErrorMessage('Username must be at least 3 characters');
      return false;
    }
    
    if (trimmed.length > 20) {
      setIsValid(false);
      setErrorMessage('Username must be 20 characters or less');
      return false;
    }
    
    if (!usernameRegex.test(trimmed)) {
      setIsValid(false);
      setErrorMessage('Username can only contain letters, numbers, and underscores');
      return false;
    }
    
    setIsValid(true);
    setErrorMessage('');
    return true;
  };

  const handleTextChange = (text: string) => {
    // Convert to lowercase and remove spaces
    const cleaned = text.toLowerCase().replace(/\s/g, '');
    setUsername(cleaned);
    validateUsername(cleaned);
  };

  const handleNext = () => {
    if (isValid) {
      onNext('username', username.trim());
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
              Choose a username
            </Text>
            <Text style={[globalStyles.textSubheadingSmall, globalStyles.textSecondary]}>
              This will be your unique identifier
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={[
                globalStyles.input,
                styles.input,
                isValid && styles.inputValid,
                !isValid && username.length > 0 && styles.inputInvalid,
              ]}
              placeholder="username"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={handleTextChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
            
            {errorMessage ? (
              <Text style={[globalStyles.textCaption, globalStyles.textError]}>
                {errorMessage}
              </Text>
            ) : isValid && username.length > 0 ? (
              <Text style={[globalStyles.textCaption, { color: colors.success }]}>
                ✓ Username available
              </Text>
            ) : null}
            
            <Text style={[globalStyles.textCaption, globalStyles.textMuted, { marginTop: 8 }]}>
              3-20 characters, letters, numbers, and underscores only
            </Text>
          </View>

          {/* Skip option */}
          <View style={styles.skipContainer}>
            <Text style={[globalStyles.textBodySmall, globalStyles.textMuted]}>
              You can add this later in your profile
            </Text>
          </View>
        </View>

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
