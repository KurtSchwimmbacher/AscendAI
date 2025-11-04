import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

// Import onboarding screens
import FullNameScreen from './FullNameScreen';
import DateOfBirthScreen from './DateOfBirthScreen';
import PhoneNumberScreen from './PhoneNumberScreen';
import UsernameScreen from './UsernameScreen';
import ProfilePictureScreen from './ProfilePictureScreen';
import ScanDemoScreen from './ScanDemoScreen';

export interface OnboardingData {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  username: string;
  profilePictureUrl: string;
  scanDemoCompleted?: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const steps = [
    { component: FullNameScreen, key: 'fullName' },
    { component: DateOfBirthScreen, key: 'dateOfBirth' },
    { component: PhoneNumberScreen, key: 'phoneNumber' },
    { component: UsernameScreen, key: 'username' },
    { component: ProfilePictureScreen, key: 'profilePictureUrl' },
    { component: ScanDemoScreen, key: 'scanDemoCompleted' },
  ];

  const handleNext = (field: keyof OnboardingData | 'scanDemoCompleted', value: string) => {
    const newData = { ...onboardingData, [field]: value };
    setOnboardingData(newData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      // Remove scanDemoCompleted from final data as it's just a flag
      const { scanDemoCompleted, ...finalData } = newData;
      onComplete(finalData as OnboardingData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const CurrentScreen = steps[currentStep].component;

  return (
    <View style={globalStyles.container}>
      <CurrentScreen
        value={onboardingData[steps[currentStep].key as keyof OnboardingData] || ''}
        onNext={handleNext}
        onBack={currentStep > 0 ? handleBack : undefined}
        onSkip={handleSkip}
        step={currentStep + 1}
        totalSteps={steps.length}
        fieldName={steps[currentStep].key as keyof OnboardingData}
      />
    </View>
  );
}
