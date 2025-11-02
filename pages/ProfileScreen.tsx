import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.content}>
        <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>Profile</Text>
        <Text style={[globalStyles.textSubheading, globalStyles.textSecondary]}>
          Profile screen coming soon...
        </Text>
      </View>
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

