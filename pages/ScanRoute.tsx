import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/MainTabs';
import { useCamera } from '../services/cameraService';
import ScannedRouteDisplay from '../components/ScannedRouteDisplay';
import RouteDetectionOverlay from '../components/RouteDetectionOverlay';
import CameraPermissionScreen from '../components/CameraPermissionScreen';
import { useImageCoordinateMapping, loadImageSize } from '../hooks/useImageCoordinateMapping';
import { useRouteScanning } from '../hooks/useRouteScanning';

type ScanRouteNavigationProp = BottomTabNavigationProp<MainTabParamList, 'ScanRoute'>;

export default function ScanRoute() {
    const navigation = useNavigation<ScanRouteNavigationProp>();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    
    // Use camera service hook
    const {
        capturedImage,
        imageModalVisible,
        takePicture,
        retakePicture,
        setImageModalVisible,
    } = useCamera((imageUri: string) => {
        navigation.goBack();
    });

    // Coordinate mapping hook
    const {
        imageSize,
        setImageSize,
        onImageLayout,
        mapTapToImagePixels,
        mapImagePixelsToScreen,
    } = useImageCoordinateMapping();

    // Load image size when captured, reset when cleared
    useEffect(() => {
        if (!capturedImage) {
            // Reset image size when image is cleared (retake)
            setImageSize(null);
            return;
        }
        loadImageSize(capturedImage)
            .then(setImageSize)
            .catch(() => setImageSize(null));
    }, [capturedImage, setImageSize]);

    // Route scanning hook
    const {
        displayedImageUri,
        isAnnotatedImage,
        holdPointScreen,
        isHolding,
        holdPointPx,
        detecting,
        detectError,
        reading,
        readError,
        gradeData,
        scanRoute,
        handlePressIn,
        handlePressOut,
    } = useRouteScanning({
        capturedImage,
        mapImagePixelsToScreen,
    });

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleTakePicture = async () => {
        await takePicture(cameraRef);
    };

    const onPressInImage = (e: any) => {
        // Safety guards: ensure we have valid image size and captured image
        if (!imageSize || !capturedImage) {
            console.log('Tap blocked - missing imageSize or capturedImage', { 
                hasImageSize: !!imageSize, 
                hasCapturedImage: !!capturedImage,
                displayedImageUri,
                isAnnotatedImage 
            });
            return;
        }
        
        // Only allow taps on the raw captured image (before annotation)
        // Once annotated, displayedImageUri changes to the annotated image URL
        if (isAnnotatedImage || (displayedImageUri && displayedImageUri !== capturedImage)) {
            console.log('Tap blocked - viewing annotated image or mismatch', { 
                isAnnotatedImage, 
                displayedImageUri, 
                capturedImage 
            });
            return;
        }
        
        const { locationX, locationY } = e.nativeEvent;
        console.log('Raw tap received:', { locationX, locationY, imageSize, capturedImage, displayedImageUri });
        const mapped = mapTapToImagePixels(locationX, locationY);
        if (mapped) {
            console.log('Processing tap:', { locationX, locationY, mapped });
            handlePressIn(locationX, locationY, mapped);
        } else {
            console.log('Tap mapping failed - coordinates out of bounds or invalid');
        }
    };

    if (!permission || !permission.granted) {
        // Request permission automatically if not granted
        if (permission && !permission.granted) {
            requestPermission();
        }
        return <CameraPermissionScreen onGoBack={handleGoBack} />;
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Text style={[globalStyles.textButton, globalStyles.textPrimary]}>← Back</Text>
                </TouchableOpacity>
            </View>
            
            {/* Main Content - Camera View */}
            {!imageModalVisible && (
                <View style={styles.content}>
                            <CameraView 
                                ref={cameraRef}
                                style={styles.camera}
                                facing={facing}
                            />
                            <View style={styles.cameraOverlay}>
                                <View style={styles.cameraControls}>
                                    
                                    
                                    <TouchableOpacity 
                                        style={styles.captureButton}
                                        onPress={handleTakePicture}
                                    >
                                        <View style={styles.captureButtonInner} />
                                    </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Full-Screen Image Display Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={imageModalVisible}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.imageModalOverlay}>
                    <View style={styles.imageModalContainer}>
                        {/* Detection overlay with rotating messages */}
                        <RouteDetectionOverlay visible={detecting} />
                        {!!detectError && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>{detectError}</Text>
                            </View>
                        )}

                        <ScannedRouteDisplay
                            imageUri={displayedImageUri || null}
                            gradeData={gradeData}
                            gradeLoading={reading}
                            gradeError={readError}
                            isAnnotated={isAnnotatedImage}
                            onRetake={retakePicture}
                            onClose={() => setImageModalVisible(false)}
                            onPressIn={onPressInImage}
                            onPressOut={handlePressOut}
                            holdPointScreen={holdPointScreen}
                            isHolding={isHolding}
                            onImageLayout={onImageLayout}
                        />

                        {/* Scan Route Button - only show when image is not annotated */}
                        {!detecting && displayedImageUri && !isAnnotatedImage && (
                            <View style={styles.scanButtonContainer}>
                                <TouchableOpacity 
                                    style={[styles.scanButton]}
                                    onPress={scanRoute}
                                >
                                    <Text style={styles.scanButtonText}>
                                        {holdPointPx ? 'Scan Route' : 'Tap to Select'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 30,
        paddingTop: 20,
        gap: 40,
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
    scanButtonContainer: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 40,
        zIndex: 100,
    },
    scanButton: {
        backgroundColor: colors.red,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        minWidth: 200,
        alignItems: 'center',
    },
    scanButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    errorBanner: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(220, 53, 69, 0.9)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    errorText: {
        color: colors.white,
        textAlign: 'center',
        fontWeight: '600',
    },
    });