import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { globalStyles, colors } from '../styles/globalStyles';
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
    const [sheetVisible, setSheetVisible] = useState(true);
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const closeSheet = () => {
        setSheetVisible(false);
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                console.log('Photo taken:', photo);
                // TODO: Handle the captured photo
            } catch (error) {
                console.error('Error taking picture:', error);
            }
        }
    };

    if (!permission) {
        // Camera permissions are still loading
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Text style={[globalStyles.textButton, globalStyles.textPrimary]}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.content} />
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        // Request permission automatically and show loading
        requestPermission();
        return (
            <SafeAreaView style={globalStyles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Text style={[globalStyles.textButton, globalStyles.textPrimary]}>← Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.content} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Text style={[globalStyles.textButton, globalStyles.textPrimary]}>← Back</Text>
                </TouchableOpacity>
            </View>
            
            {/* Main Content - Empty background */}
            <View style={styles.content} />

            {/* Camera Sheet Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={sheetVisible}
                onRequestClose={closeSheet}
            >
                <View style={styles.sheetOverlay}>
                    <Pressable style={styles.sheetBackdrop} onPress={closeSheet} />
                    <View style={styles.sheetContainer}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetContent}>
                            <CameraView 
                                ref={cameraRef}
                                style={styles.camera}
                                facing={facing}
                            />
                            <View style={styles.cameraOverlay}>
                                <View style={styles.cameraControls}>
                                    <TouchableOpacity 
                                        style={styles.controlButton}
                                        onPress={toggleCameraFacing}
                                    >
                                        <Text style={styles.controlButtonText}>🔄</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.captureButton}
                                        onPress={takePicture}
                                    >
                                        <View style={styles.captureButtonInner} />
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.controlButton}
                                        onPress={closeSheet}
                                    >
                                        <Text style={styles.controlButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
    content: {
        flex: 1,
    },
    sheetOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheetContainer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        minHeight: '90%',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    sheetContent: {
        flex: 1,
        paddingHorizontal: 0,
        paddingBottom: 0,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 30,
        paddingTop: 20,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonText: {
        fontSize: 20,
        color: colors.white,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.white,
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.white,
    },
    });