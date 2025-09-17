import { Text, View, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Index() {
  const openCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Camera permission is required to take photos.');
        return;
      }

      // Open camera (this will launch the system camera app)
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        Alert.alert('Success', 'Photo taken successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
      console.error('Camera error:', error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 30, textAlign: "center" }}>
        AscendAI Camera App
      </Text>
      
      <TouchableOpacity
        onPress={openCamera}
        style={{
          backgroundColor: "#007AFF",
          paddingHorizontal: 30,
          paddingVertical: 15,
          borderRadius: 25,
          opacity: 0.8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        activeOpacity={0.6}
      >
        <Text style={{ 
          color: "white", 
          fontSize: 16, 
          fontWeight: "bold",
          textAlign: "center"
        }}>
          📸 Open Camera
        </Text>
      </TouchableOpacity>
    </View>
  );
}
