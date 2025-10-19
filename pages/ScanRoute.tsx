import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { globalStyles, colors } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCamera } from '../services/cameraService';

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
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    
    // Use camera service hook
    const {
        capturedImage,
        imageModalVisible,
        cameraSheetVisible: sheetVisible,
        takePicture,
        retakePicture,
        useImage,
        setImageModalVisible,
        setCameraSheetVisible: setSheetVisible,
    } = useCamera((imageUri: string) => {
        // TODO: Scan route function after user touch point
        navigation.goBack();
    });

    const handleGoBack = () => {
        navigation.goBack();
    };

    const closeSheet = () => {
        setSheetVisible(false);
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const handleTakePicture = async () => {
        await takePicture(cameraRef);
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
                                        onPress={handleTakePicture}
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

            {/* Full-Screen Image Display Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={imageModalVisible}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.imageModalOverlay}>
                    <View style={styles.imageModalContainer}>
                        {capturedImage && (
                            <Image 
                                source={{ uri: capturedImage }} 
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                            />
                        )}
                        
                        {/* Image Controls */}
                        <View style={styles.imageControls}>
                            <TouchableOpacity 
                                style={styles.imageControlButton}
                                onPress={retakePicture}
                            >
                                <Text style={styles.imageControlButtonText}>Retake</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.imageControlButton, styles.useImageButton]}
                                onPress={useImage}
                            >
                                <Text style={[styles.imageControlButtonText, styles.useImageButtonText]}>Scan Route</Text>
                            </TouchableOpacity>
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
    imageModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    imageControls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
    },
    imageControlButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    imageControlButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    useImageButton: {
        backgroundColor: colors.black,
        borderColor: colors.black,
    },
    useImageButtonText: {
        color: colors.white,
    },
    });