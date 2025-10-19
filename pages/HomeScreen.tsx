import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { AuthService } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation types
type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Home: undefined;
  ScanRoute: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const handleScanRoute = () => {
    navigation.navigate('ScanRoute');
  };

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
      </View>
      
      {/* Scan Button at Bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[globalStyles.buttonFullWidth, styles.scanButton]} 
          onPress={handleScanRoute}
        >
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Scan a new route</Text>
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite, styles.arrowIcon]}>→</Text>
        </TouchableOpacity>
        
        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[globalStyles.buttonFullWidthDanger, styles.signOutButton]} 
          onPress={handleSignOut}
        >
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowIcon: {
    fontSize: 20,
  },
  signOutButton: {
    // Uses globalStyles.buttonFullWidthDanger styling
  },
});
