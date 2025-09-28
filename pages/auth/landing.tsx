import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { globalStyles, colors } from '../../styles/globalStyles';

interface LandingScreenProps {
  onNavigateToAuth: (mode: 'login' | 'signup') => void;
}

export default function LandingScreen({ onNavigateToAuth }: LandingScreenProps) {

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>Welcome to AscendAI</Text>
          <Text style={[globalStyles.textSubheadingSmall, globalStyles.textSecondary]}>Ready to start your climbing journey</Text>
        </View>

        {/* Bottom Buttons Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={[globalStyles.buttonFullWidth, styles.buttonWithArrow]}
            onPress={() => onNavigateToAuth('login')}
          >
            <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Login</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[globalStyles.buttonFullWidthSecondary, styles.buttonWithArrow]}
            onPress={() => onNavigateToAuth('signup')}
          >
            <Text style={[globalStyles.textButtonLarge, globalStyles.textPrimary]}>Sign Up</Text>
            <Text style={[styles.arrow, styles.signupArrow]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  bottomSection: {
    paddingBottom: 40,
    gap: 16,
  },
  buttonWithArrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  signupArrow: {
    color: colors.black,
  },
});
