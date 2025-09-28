import React, { useState } from 'react';
import LandingScreen from './landing';
import AuthForm from './AuthForm';

export default function AuthFlow() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'auth'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleNavigateToAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setCurrentScreen('auth');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
  };

  if (currentScreen === 'auth') {
    return (
      <AuthForm 
        mode={authMode} 
        onBack={handleBackToLanding}
      />
    );
  }

  return (
    <LandingScreen onNavigateToAuth={handleNavigateToAuth} />
  );
}
