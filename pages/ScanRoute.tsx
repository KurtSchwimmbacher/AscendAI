import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { globalStyles, colors } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCamera } from '../services/cameraService';
import { useDetectRouteByColour, type ColourFilterRequest } from '../hooks/detectRouteHook';
import Constants from 'expo-constants';

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

    // Detection hook
    const { loading: detecting, error: detectError, data: detectData, runDetection, reset: resetDetection } = useDetectRouteByColour();

    // Track the displayed image dimensions and original pixel size for precise tap mapping
    const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const [displayedImageUri, setDisplayedImageUri] = useState<string | null>(null);

    // Load intrinsic size when a new image is captured
    useEffect(() => {
        if (!capturedImage) return;
        Image.getSize(
            capturedImage,
            (w, h) => setImageSize({ width: w, height: h }),
            () => setImageSize(null)
        );
        setDisplayedImageUri(capturedImage);
        resetDetection();
    }, [capturedImage, resetDetection]);

    const onImageLayout = (e: any) => {
        setContainerSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
    };

    const mapTapToImagePixels = (tapX: number, tapY: number) => {
        if (!imageSize) return null;
        const { width: cw, height: ch } = containerSize;
        const { width: iw, height: ih } = imageSize;
        if (cw <= 0 || ch <= 0 || iw <= 0 || ih <= 0) return null;

        const scale = Math.min(cw / iw, ch / ih);
        const renderedW = iw * scale;
        const renderedH = ih * scale;
        const offsetX = (cw - renderedW) / 2;
        const offsetY = (ch - renderedH) / 2;

        // If tapped outside the actual rendered image area, ignore
        if (tapX < offsetX || tapX > offsetX + renderedW || tapY < offsetY || tapY > offsetY + renderedH) {
            return null;
        }

        const px = Math.round((tapX - offsetX) / scale);
        const py = Math.round((tapY - offsetY) / scale);
        return { x: px, y: py };
    };

    // Press-and-hold selection state
    const [isHolding, setIsHolding] = useState(false);
    const [holdPointPx, setHoldPointPx] = useState<{ x: number; y: number } | null>(null);
    const [holdPointScreen, setHoldPointScreen] = useState<{ x: number; y: number } | null>(null);

    const mapImagePixelsToScreen = (px: number, py: number) => {
        if (!imageSize) return null;
        const { width: cw, height: ch } = containerSize;
        const { width: iw, height: ih } = imageSize;
        const scale = Math.min(cw / iw, ch / ih);
        const renderedW = iw * scale;
        const renderedH = ih * scale;
        const offsetX = (cw - renderedW) / 2;
        const offsetY = (ch - renderedH) / 2;
        return { sx: offsetX + px * scale, sy: offsetY + py * scale };
    };

    const onPressInImage = (e: any) => {
        if (!imageSize) return;
        const { locationX, locationY } = e.nativeEvent;
        const mapped = mapTapToImagePixels(locationX, locationY);
        if (!mapped) return;
        const screen = mapImagePixelsToScreen(mapped.x, mapped.y);
        setIsHolding(true);
        setHoldPointPx(mapped);
        if (screen) setHoldPointScreen({ x: screen.sx, y: screen.sy });
    };

    const onPressOutImage = () => {
        setIsHolding(false);
    };

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
                        {displayedImageUri && (
                            <Pressable style={styles.imagePressable} onPressIn={onPressInImage} onPressOut={onPressOutImage}>
                                <Image 
                                    onLayout={onImageLayout}
                                    source={{ uri: displayedImageUri }} 
                                    style={styles.fullScreenImage}
                                    resizeMode="contain"
                                />
                                {holdPointScreen && (
                                    <View
                                        pointerEvents="none"
                                        style={[
                                            styles.holdMarker,
                                            { left: holdPointScreen.x - 16, top: holdPointScreen.y - 16 },
                                            isHolding ? styles.holdMarkerActive : null,
                                        ]}
                                    />
                                )}
                            </Pressable>
                        )}

                        {/* Detection state overlays */}
                        {detecting && (
                            <View style={styles.detectOverlay}> 
                                <ActivityIndicator size="large" color={colors.white} />
                                <Text style={styles.detectText}>Detecting route by colour…</Text>
                            </View>
                        )}
                        {!!detectError && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>{detectError}</Text>
                            </View>
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
                                onPress={async () => {
                                    if (!capturedImage || !holdPointPx) return;
                                    const params: ColourFilterRequest = {
                                        tapX: holdPointPx.x,
                                        tapY: holdPointPx.y,
                                        conf: 0.25,
                                        colourTolerance: 30,
                                        returnAnnotatedImage: true,
                                    };
                                    try {
                                        const result = await runDetection({ uri: capturedImage, name: 'photo.jpg', type: 'image/jpeg' }, params);
                                        if (result?.image_with_boxes) {
                                            const baseUrl = Constants.expoConfig?.extra?.API_URL || 'https://ascendbackend-b2f7.onrender.com';
                                            const absolute = result.image_with_boxes.startsWith('http')
                                                ? result.image_with_boxes
                                                : `${baseUrl}${result.image_with_boxes}`;
                                            setDisplayedImageUri(absolute);
                                            // Re-map marker position because container may be the same; keep marker
                                            const s = mapImagePixelsToScreen(holdPointPx.x, holdPointPx.y);
                                            if (s) setHoldPointScreen({ x: s.sx, y: s.sy });
                                        }
                                    } catch {}
                                }}
                            >
                                <Text style={[styles.imageControlButtonText, styles.useImageButtonText]}>
                                    {holdPointPx ? 'Scan Route' : 'Tap & Hold to Select'}
                                </Text>
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
    imagePressable: {
        flex: 1,
        width: '100%',
        height: '100%',
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
    holdMarker: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.white,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    holdMarkerActive: {
        borderColor: colors.black,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    detectOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    detectText: {
        marginTop: 12,
        color: colors.white,
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