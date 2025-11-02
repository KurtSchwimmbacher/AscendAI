import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { AuthService } from '../services/authService';

const handleSignOut = async () => {
  try {
    await AuthService.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

export default function ProfileScreen() {
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.content}>
        <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>Profile</Text>
        <Text style={[globalStyles.textSubheading, globalStyles.textSecondary]}>
          Profile screen coming soon...
        </Text>
      </View>

    {/* Sign Out Button */}
    <TouchableOpacity 
          style={[globalStyles.buttonFullWidth, globalStyles.marginBottomSm]} 
          onPress={ () =>
            handleSignOut()
          }
        >
        <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Sign Out</Text>
      </TouchableOpacity>

      {/* delete account btn */}
      <TouchableOpacity 
          style={[globalStyles.buttonFullWidthDanger]} 
          onPress={ () =>
            console.log("delete account pressed")
          }
        >
        <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Delete Account</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

