import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface LandingScreenProps {
  onNavigateToAuth: (mode: 'login' | 'signup') => void;
}

export default function LandingScreen({ onNavigateToAuth }: LandingScreenProps) {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to AscendAI</Text>
          <Text style={styles.subtitle}>Ready to start your climbing journey</Text>
        </View>

        {/* Bottom Buttons Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onNavigateToAuth('login')}
          >
            <Text style={styles.actionButtonText}>Login</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.signupButton]}
            onPress={() => onNavigateToAuth('signup')}
          >
            <Text style={[styles.actionButtonText, styles.signupButtonText]}>Sign Up</Text>
            <Text style={[styles.arrow, styles.signupArrow]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'left',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'left',
    lineHeight: 24,
  },
  bottomSection: {
    paddingBottom: 40,
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupButtonText: {
    color: '#007AFF',
  },
  arrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  signupArrow: {
    color: '#007AFF',
  },
});
