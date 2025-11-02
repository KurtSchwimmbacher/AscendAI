import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, globalStyles } from '../styles/globalStyles';
import { AuthService } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainTabs';

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const handleScanRoute = () => {
    navigation.navigate('ScanRoute');
  };



  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Hero Image Background - Top Half */}
      <View style={styles.heroImageContainer}>
        <Image 
          source={require('../assets/ascendAI_hero.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={[styles.welcomeContainer, styles.contentOverlay]}>
        <Text style={[globalStyles.textTitle, globalStyles.textPrimary ]}>Welcome to AscendAI</Text>
      </View>
      
      {/* Scan Button at Bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[globalStyles.buttonFullWidth, styles.scanButton]} 
          onPress={handleScanRoute}
        >
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Scan a new route</Text>
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite, styles.arrowIcon]}>→</Text>
        </TouchableOpacity>
        
        {/* past routes btn */}
        <TouchableOpacity 
          style={[globalStyles.buttonFullWidthDanger, styles.scanButton]} 
          onPress={ () =>
            console.log('Past routes')
          }
        >
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>Past Scans</Text>
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite, styles.arrowIcon]}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroImageContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: '80%',
    zIndex: 0,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    zIndex: 1,
    position: 'relative',
  },
  welcomeContainer: {
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    alignItems: 'flex-start',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
    zIndex: 2,
  },
  scanButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowIcon: {
    fontSize: 20,
  }
});
