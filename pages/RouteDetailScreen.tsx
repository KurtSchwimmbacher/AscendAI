import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../styles/globalStyles';
import { FirestoreRouteDocument } from '../services/firestoreService';
import { HomeStackParamList } from '../navigation/HomeStack';
import { useRouteDetail } from '../hooks/useRouteDetail';
import RouteGradeSection from '../components/RouteGradeSection';
import RouteInfoSection from '../components/RouteInfoSection';
import RouteKeyFactors from '../components/RouteKeyFactors';
import RouteDetectionDetails from '../components/RouteDetectionDetails';

type RouteDetailScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'RouteDetail'>;
type RouteDetailScreenRouteProp = {
  key: string;
  name: 'RouteDetail';
  params: {
    route: FirestoreRouteDocument;
  };
};

export default function RouteDetailScreen() {
  const navigation = useNavigation<RouteDetailScreenNavigationProp>();
  const route = useRoute<RouteDetailScreenRouteProp>();
  const initialRouteData = route.params.route;

  const {
    routeData,
    isEditing,
    editData,
    saving,
    displayGrade,
    isManualGrade,
    handleEdit,
    handleCancel,
    handleUpdateField,
    handleSave,
  } = useRouteDetail({ initialRoute: initialRouteData });

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>
            Route Details
          </Text>
          {isEditing ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleCancel}
                disabled={saving}
                style={styles.cancelButton}
              >
                <Text style={[globalStyles.textBody, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={styles.saveButton}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={[globalStyles.textBody, { color: colors.white, fontWeight: 'bold' }]}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleEdit}>
              <Ionicons name="create-outline" size={24} color={colors.black} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Route Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: routeData.imageUrl }}
              style={styles.routeImage}
              resizeMode="contain"
            />
          </View>

          {/* Grade Section */}
          <RouteGradeSection
            routeData={routeData}
            isEditing={isEditing}
            displayGrade={displayGrade}
            isManualGrade={isManualGrade}
            manualGrade={editData.manualGrade}
            onManualGradeChange={(value) => handleUpdateField('manualGrade', value)}
          />

          {/* Route Name */}
          <RouteInfoSection
            title="Route Name"
            value={routeData.routeName}
            isEditing={isEditing}
            editValue={editData.routeName}
            onEditChange={(value) => handleUpdateField('routeName', value)}
            placeholder="Enter a name for this route"
          />

          {/* Key Factors */}
          {!isEditing && <RouteKeyFactors routeData={routeData} />}

          {/* Difficulty Notes */}
          {!isEditing && routeData.grade.difficulty_notes && (
            <RouteInfoSection
              title="Difficulty Notes"
              value={routeData.grade.difficulty_notes}
              isEditing={false}
              editValue=""
              onEditChange={() => {}}
            />
          )}

          {/* Notes */}
          <RouteInfoSection
            title="Your Notes"
            value={routeData.notes}
            isEditing={isEditing}
            editValue={editData.notes}
            onEditChange={(value) => handleUpdateField('notes', value)}
            placeholder="Add your own notes about this route..."
            multiline
          />

          {/* Detection Details */}
          <RouteDetectionDetails routeData={routeData} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButton: {
    backgroundColor: colors.black,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  routeImage: {
    width: '100%',
    height: '100%',
  },
});

