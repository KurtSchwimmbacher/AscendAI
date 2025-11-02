import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { globalStyles, colors } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCamera } from '../services/cameraService';
import { useDetectRouteByColour, type ColourFilterRequest } from '../hooks/detectRouteHook';
import { useReadRouteGrade } from '../hooks/readHook';
import Constants from 'expo-constants';
import ScannedRouteDisplay from '../components/ScannedRouteDisplay';

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
    const { loading: reading, error: readError, data: gradeData, readGrade, reset: resetRead } = useReadRouteGrade();

    // Track the displayed image dimensions and original pixel size for precise tap mapping
    const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const [displayedImageUri, setDisplayedImageUri] = useState<string | null>(null);
    const [isAnnotatedImage, setIsAnnotatedImage] = useState(false);

    // Load intrinsic size when a new image is captured
    useEffect(() => {
        if (!capturedImage) return;
        Image.getSize(
            capturedImage,
            (w, h) => setImageSize({ width: w, height: h }),
            () => setImageSize(null)
        );
        setDisplayedImageUri(capturedImage);
        setIsAnnotatedImage(false);
        resetDetection();
        resetRead();
    }, [capturedImage, resetDetection, resetRead]);

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


    const handleTakePicture = async () => {
        await takePicture(cameraRef);
    };

    const handleScanRoute = async () => {
        console.log("Scan button pressed");
        if (!capturedImage || !holdPointPx) {
            console.log('Early return - missing:', { capturedImage: !!capturedImage, holdPointPx: !!holdPointPx });
            return;
        }
        console.log('Processing scan with tap:', { tapX: holdPointPx.x, tapY: holdPointPx.y });
        const params: ColourFilterRequest = {
            tapX: holdPointPx.x,
            tapY: holdPointPx.y,
            conf: 0.25,
            colourTolerance: 10,
            returnAnnotatedImage: true,
        };
        try {
            const result = await runDetection({ uri: capturedImage, name: 'photo.jpg', type: 'image/jpeg' }, params);
            console.log('API response:', {
                requestedTap: { x: params.tapX, y: params.tapY },
                selected_colour: result?.selected_colour,
                colour_confidence: result?.colour_confidence,
                detectionsCount: Array.isArray(result?.detections) ? result.detections.length : 0,
                image_with_boxes: result?.image_with_boxes,
            });
            if (result?.image_with_boxes) {
                const baseUrl = Constants.expoConfig?.extra?.API_URL || 'https://ascendbackend-b2f7.onrender.com';
                const absolute = result.image_with_boxes.startsWith('http')
                    ? result.image_with_boxes
                    : `${baseUrl}${result.image_with_boxes}`;
                setDisplayedImageUri(absolute);
                setIsAnnotatedImage(true);
                const s = mapImagePixelsToScreen(holdPointPx.x, holdPointPx.y);
                if (s) setHoldPointScreen({ x: s.sx, y: s.sy });

                // Kick off grade reading only after annotated image is set
                try {
                    await readGrade({ uri: absolute, name: 'annotated.jpg', type: 'image/jpeg' });
                } catch (e) {
                    // Error handled by hook
                }
            }
        } catch {}
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

                        <ScannedRouteDisplay
                            imageUri={displayedImageUri}
                            gradeData={gradeData}
                            gradeLoading={reading}
                            gradeError={readError}
                            isAnnotated={isAnnotatedImage}
                            onRetake={retakePicture}
                            onClose={() => setImageModalVisible(false)}
                            onPressIn={onPressInImage}
                            onPressOut={onPressOutImage}
                            holdPointScreen={holdPointScreen}
                            isHolding={isHolding}
                            onImageLayout={onImageLayout}
                        />

                        {/* Scan Route Button - only show when image is not annotated */}
                        {!detecting && displayedImageUri && !isAnnotatedImage && (
                            <View style={styles.scanButtonContainer}>
                                <TouchableOpacity 
                                    style={[styles.scanButton]}
                                    onPress={handleScanRoute}
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
        backgroundColor: colors.black,
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