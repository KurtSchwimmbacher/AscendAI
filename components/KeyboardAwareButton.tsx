import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
  Animated,
} from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';

interface KeyboardAwareButtonProps {
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
  style?: any;
}

export default function KeyboardAwareButton({ 
  onPress, 
  disabled = false, 
  icon = '→',
  style 
}: KeyboardAwareButtonProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        Animated.timing(animatedValue, {
          toValue: event.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        {
          transform: [{ translateY: animatedValue }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          globalStyles.buttonCircular,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonIcon, disabled && styles.iconDisabled]}>
          {icon}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 1000,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconDisabled: {
    color: colors.textMuted,
  },
});
