import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';

export default function HomeScreen() {
  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.contentCentered}>
        <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>Welcome to AscendAI</Text>
        <Text style={[globalStyles.textSubheading, globalStyles.textSecondary]}>You are successfully logged in!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
