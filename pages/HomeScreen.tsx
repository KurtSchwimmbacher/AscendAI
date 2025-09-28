import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { AuthService } from '../services/authService';
import { globalStyles, colors } from '../styles/globalStyles';

export default function HomeScreen() {
  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.contentCentered}>
        <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>Welcome to AscendAI</Text>
        <Text style={[globalStyles.textSubheading, globalStyles.textSecondary]}>You are successfully logged in!</Text>
        
        <TouchableOpacity style={[globalStyles.buttonFullWidthDanger, styles.signOutButton]} onPress={handleSignOut}>
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    marginTop: 40,
  },
});
