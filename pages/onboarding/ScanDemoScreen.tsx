import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../../styles/globalStyles';

interface ScanDemoScreenProps {
  value: string;
  onNext: (field: 'scanDemoCompleted', value: string) => void;
  onBack?: () => void;
  onSkip: () => void;
  step: number;
  totalSteps: number;
  fieldName: 'scanDemoCompleted';
}

export default function ScanDemoScreen({ 
  onNext, 
  onBack, 
  onSkip, 
  step, 
  totalSteps 
}: ScanDemoScreenProps) {
  // Animation values for the tap indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Position for the demo tap point (percentage-based for responsiveness)
  // These will be calculated relative to the image container size
  const [tapPointX, setTapPointX] = useState(0);
  const [tapPointY, setTapPointY] = useState(0);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  const handleImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
    // Set tap point to roughly center-right area (60% from left, 50% from top)
    setTapPointX(width * 0.6);
    setTapPointY(height * 0.5);
  };

  useEffect(() => {
    // Create a looping animation sequence
    const createAnimation = () => {
      // Reset animations
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
      opacityAnim.setValue(1);

      // Sequence: pulse → ripple → fade → repeat
      Animated.sequence([
        // Pulse animation (tap indicator grows)
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Hold state (stay pressed for a moment)
        Animated.delay(400),
        // Ripple effect (expanding circle)
        Animated.parallel([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        // Fade out and reset
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ]).start(() => {
        // Loop the animation
        createAnimation();
      });
    };

    createAnimation();
  }, [pulseAnim, rippleAnim, opacityAnim]);

  const handleNext = () => {
    onNext('scanDemoCompleted', 'true');
  };

  const handleSkip = () => {
    onSkip();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [1, 1.3],
    outputRange: [1, 1.3],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 3],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.content}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={[globalStyles.textCaption, globalStyles.textMuted]}>
            Step {step} of {totalSteps}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>
            How to Scan a Route
          </Text>
          <Text style={[globalStyles.textSubheadingSmall, globalStyles.textSecondary, styles.subtitle]}>
            Learn how to select holds and detect routes
          </Text>
        </View>

        {/* Demo Image Container */}
        <View style={styles.demoContainer}>
          <View style={styles.imageWrapper} onLayout={handleImageLayout}>
            <Image 
              source={require('../../assets/demo/wall-demo.jpg')} 
              style={styles.demoImage}
              resizeMode="contain"
            />
            
            {/* Animated Tap Indicator - only show when dimensions are set */}
            {containerDimensions.width > 0 && tapPointX > 0 && (
              <>
                <Animated.View
                  style={[
                    styles.tapIndicator,
                    {
                      left: tapPointX,
                      top: tapPointY,
                      transform: [{ scale: pulseScale }],
                      opacity: opacityAnim,
                    },
                  ]}
                >
                  <View style={styles.tapIndicatorInner} />
                </Animated.View>

                {/* Ripple Effect */}
                <Animated.View
                  style={[
                    styles.ripple,
                    {
                      left: tapPointX,
                      top: tapPointY,
                      transform: [{ scale: rippleScale }],
                      opacity: rippleOpacity,
                    },
                  ]}
                />
              </>
            )}

            {/* Instruction Overlay */}
            <View style={styles.instructionOverlay}>
              <View style={styles.instructionCard}>
                <Text style={[globalStyles.textBody, globalStyles.textPrimary, styles.instructionTitle]}>
                  Press & Hold
                </Text>
                <Text style={[globalStyles.textBodySmall, globalStyles.textSecondary, styles.instructionText]}>
                  Press and hold on any hold to select its color
                </Text>
                <Text style={[globalStyles.textBodySmall, globalStyles.textMuted, styles.instructionText, { marginTop: 8 }]}>
                  Then tap "Scan Route" to detect the route
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[globalStyles.buttonFullWidth, styles.continueButton]}
            onPress={handleNext}
          >
            <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>
              Got it!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skip option */}
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[globalStyles.textBodySmall, globalStyles.textMuted]}>
              Skip tutorial
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.black,
    borderRadius: 2,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
  },
  demoContainer: {
    flex: 1,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    maxHeight: 500,
    position: 'relative',
    backgroundColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  demoImage: {
    width: '100%',
    height: '100%',
  },
  tapIndicator: {
    position: 'absolute',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tapIndicatorInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.red,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ripple: {
    position: 'absolute',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    borderRadius: 20,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.redTint,
    zIndex: 9,
  },
  instructionOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  instructionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.black,
    ...globalStyles.shadows?.lg || {},
  },
  instructionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionText: {
    textAlign: 'center',
  },
  actions: {
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: colors.black,
  },
  skipContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});

