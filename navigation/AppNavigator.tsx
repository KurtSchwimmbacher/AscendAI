import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Import screens
import AuthFlow from '../pages/auth/AuthFlow';
import OnboardingFlow from '../pages/onboarding/OnboardingFlow';
import HomeScreen from '../pages/HomeScreen';

// Import services
import { AuthService } from '../services/authService';
import { FirestoreService } from '../services/firestoreService';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Check if user needs onboarding
        try {
          const isOnboardingComplete = await FirestoreService.isOnboardingComplete(user.uid);
          setNeedsOnboarding(!isOnboardingComplete);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // If can't check, assume they need onboarding
          setNeedsOnboarding(true);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setNeedsOnboarding(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const handleOnboardingComplete = async (onboardingData: any) => {
    if (currentUser) {
      try {
        // Save onboarding data to Firestore
        await FirestoreService.createOrUpdateUserProfile({
          uid: currentUser.uid,
          email: currentUser.email,
          ...onboardingData,
        });
        
        // Mark onboarding as complete
        await FirestoreService.completeOnboarding(currentUser.uid);
        
        // Update local state
        setNeedsOnboarding(false);
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        // Still proceed to home screen even if save fails
        setNeedsOnboarding(false);
      }
    }
  };

  const handleOnboardingSkip = async () => {
    if (currentUser) {
      try {
        // Create basic user profile
        await FirestoreService.createOrUpdateUserProfile({
          uid: currentUser.uid,
          email: currentUser.email,
        });
        
        // Mark onboarding as complete
        await FirestoreService.completeOnboarding(currentUser.uid);
        
        // Update local state
        setNeedsOnboarding(false);
      } catch (error) {
        console.error('Error saving basic profile:', error);
        // Still proceed to home screen even if save fails
        setNeedsOnboarding(false);
      }
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          needsOnboarding ? (
            // User needs onboarding
            <Stack.Screen name="Onboarding">
              {() => (
                <OnboardingFlow
                  onComplete={handleOnboardingComplete}
                  onSkip={handleOnboardingSkip}
                />
              )}
            </Stack.Screen>
          ) : (
            // User is authenticated and onboarded - show main app
            <Stack.Screen name="Home" component={HomeScreen} />
          )
        ) : (
          // User is not authenticated - show auth flow
          <Stack.Screen name="Auth" component={AuthFlow} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
