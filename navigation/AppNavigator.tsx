import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Import screens
import AuthFlow from '../pages/auth/AuthFlow';
import HomeScreen from '../pages/HomeScreen';

// Import auth service
import { AuthService } from '../services/authService';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
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

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // User is authenticated - show main app
          <Stack.Screen name="Home" component={HomeScreen} />
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
