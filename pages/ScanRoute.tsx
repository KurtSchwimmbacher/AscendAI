import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation types
type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Home: undefined;
  ScanRoute: undefined;
};

type ScanRouteNavigationProp = StackNavigationProp<RootStackParamList, 'ScanRoute'>;

export default function ScanRoute() {
    const navigation = useNavigation<ScanRouteNavigationProp>();

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Text style={[globalStyles.textButton, globalStyles.textPrimary]}>← Back</Text>
                </TouchableOpacity>
            </View>
            
            <View style={globalStyles.contentCentered}>
                <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>Scan Route</Text>
                <Text style={[globalStyles.textSubheading, globalStyles.textSecondary]}>
                    Camera functionality coming soon!
                </Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        alignSelf: 'flex-start',
    },
});