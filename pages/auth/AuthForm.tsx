import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../services/authService';
import { globalStyles, colors } from '../../styles/globalStyles';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onBack: () => void;
}

export default function AuthForm({ mode, onBack }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await AuthService.signIn(email, password);
        // Navigation will be handled automatically by the auth state listener
      } else {
        await AuthService.signUp(email, password);
        // Navigation will be handled automatically by the auth state listener
      }
    } catch (error) {
      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.container}
      >
        <View style={globalStyles.content}>
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={[globalStyles.textBody, globalStyles.textPrimary]}>← Back</Text>
          </TouchableOpacity>

          <Text style={[globalStyles.textTitleLarge, globalStyles.textPrimary]}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
          
          <Text style={[globalStyles.textSubheadingSmall, globalStyles.textSecondary]}>
            {mode === 'login' ? 'Sign in to your account' : 'Sign up to get started'}
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[globalStyles.input, styles.inputSpacing]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={[globalStyles.input, styles.inputSpacing]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            {mode === 'signup' && (
              <TextInput
                style={[globalStyles.input, styles.inputSpacing]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            <TouchableOpacity 
              style={[globalStyles.buttonFullWidth, styles.submitButton, isLoading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  form: {
    flex: 1,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});
