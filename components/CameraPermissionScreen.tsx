import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';

interface CameraPermissionScreenProps {
  onGoBack: () => void;
}

export default function CameraPermissionScreen({ onGoBack }: CameraPermissionScreenProps) {
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={[globalStyles.textButton, globalStyles.textPrimary]}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
  },
});

