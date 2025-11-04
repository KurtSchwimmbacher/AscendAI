import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import AuthFlow from '../pages/auth/AuthFlow';
import OnboardingFlow from '../pages/onboarding/OnboardingFlow';
import MainTabs from './MainTabs';
import LoadingScreen from '../components/LoadingScreen';

// Import services
import { AuthService } from '../services/authService';
import { FirestoreService } from '../services/firestoreService';

// Define navigation types
type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsCheckingOnboarding(true);
        
        // Check if user needs onboarding
        try {
          const isOnboardingComplete = await FirestoreService.isOnboardingComplete(user.uid);
          setNeedsOnboarding(!isOnboardingComplete);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // If can't check, assume they need onboarding
          setNeedsOnboarding(true);
        } finally {
          setIsCheckingOnboarding(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setNeedsOnboarding(null);
        setIsCheckingOnboarding(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Reset navigation when auth state changes
  useEffect(() => {
    if (!isLoading && !isCheckingOnboarding && navigationRef.current?.isReady()) {
      if (!isAuthenticated) {
        // User logged out - navigate to Auth screen
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      } else if (needsOnboarding) {
        // User needs onboarding
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      } else if (isAuthenticated && !needsOnboarding) {
        // User is authenticated and onboarded - navigate to MainTabs
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    }
  }, [isAuthenticated, needsOnboarding, isLoading, isCheckingOnboarding]);

  // Show loading screen while checking authentication or onboarding status
  if (isLoading || isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  const handleOnboardingComplete = async (onboardingData: any) => {
    if (currentUser) {
      try {
        console.log('Onboarding data being saved:', onboardingData);
        
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

  // Determine initial route based on auth state
  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isAuthenticated) return 'Auth';
    if (needsOnboarding) return 'Onboarding';
    return 'MainTabs';
  };

  // Create a unique key based on auth state to force navigator remount when state changes
  const navigationKey = `${isAuthenticated}-${needsOnboarding}`;

  return (
    <NavigationContainer ref={navigationRef}> 
      <Stack.Navigator 
        key={navigationKey}
        id={undefined}
        initialRouteName={getInitialRoute()}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Auth" component={AuthFlow} />
        <Stack.Screen name="Onboarding">
          {() => (
            <OnboardingFlow
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingSkip}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
