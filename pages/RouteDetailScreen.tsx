import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../styles/globalStyles';
import { FirestoreService, FirestoreRouteDocument } from '../services/firestoreService';
import { HomeStackParamList } from '../navigation/HomeStack';

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

  const [routeData, setRouteData] = useState<FirestoreRouteDocument>(initialRouteData);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    routeName: initialRouteData.routeName || '',
    manualGrade: initialRouteData.manualGrade || '',
    notes: initialRouteData.notes || '',
  });

  const displayGrade = isEditing 
    ? (editData.manualGrade || routeData.grade.v_grade)
    : (routeData.manualGrade || routeData.grade.v_grade);
  const isManualGrade = isEditing 
    ? !!editData.manualGrade 
    : !!routeData.manualGrade;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({
      routeName: routeData.routeName || '',
      manualGrade: routeData.manualGrade || '',
      notes: routeData.notes || '',
    });
    setIsEditing(false);
  };

  const loadRoute = async () => {
    if (!routeData.id) return;

    try {
      const updatedRoute = await FirestoreService.getRoute(routeData.id);
      if (updatedRoute) {
        setRouteData(updatedRoute);
        setEditData({
          routeName: updatedRoute.routeName || '',
          manualGrade: updatedRoute.manualGrade || '',
          notes: updatedRoute.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading route:', error);
    }
  };

  const handleSave = async () => {
    if (!routeData.id) {
      Alert.alert('Error', 'Route ID is missing');
      return;
    }

    try {
      setSaving(true);

      // Update route in Firestore
      await FirestoreService.updateRoute(routeData.id, {
        routeName: editData.routeName.trim() || undefined,
        manualGrade: editData.manualGrade.trim() || undefined,
        notes: editData.notes.trim() || undefined,
      });

      // Reload route data to show updates
      await loadRoute();
      
      setIsEditing(false);
      Alert.alert('Success', 'Route updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update route';
      Alert.alert('Error', message);
      console.error('Error updating route:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      let date: Date;
      if (timestamp.toDate) {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (typeof timestamp === 'number') {
        // Unix timestamp in seconds or milliseconds
        date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

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
          <View style={styles.section}>
            <View style={styles.gradeHeader}>
              <View>
                <Text style={styles.sectionTitle}>Grade</Text>
                {isEditing ? (
                  <TextInput
                    style={[globalStyles.input, styles.gradeInput]}
                    value={editData.manualGrade}
                    onChangeText={(text) => setEditData((prev) => ({ ...prev, manualGrade: text }))}
                    placeholder="V3, V5, etc."
                    placeholderTextColor={colors.textMuted}
                  />
                ) : (
                  <View style={styles.gradeContainer}>
                    <Text style={styles.gradeValue}>{displayGrade}</Text>
                    {isManualGrade && (
                      <View style={styles.manualBadge}>
                        <Text style={styles.manualBadgeText}>Manual</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <Text style={styles.confidenceText}>
                {Math.round(routeData.grade.confidence * 100)}% confidence
              </Text>
            </View>

            {!isEditing && routeData.grade.reasoning && (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Reasoning</Text>
                <Text style={styles.infoText}>{routeData.grade.reasoning}</Text>
              </View>
            )}
          </View>

          {/* Route Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route Name</Text>
            {isEditing ? (
              <TextInput
                style={[globalStyles.input, styles.textInput]}
                value={editData.routeName}
                onChangeText={(text) => setEditData((prev) => ({ ...prev, routeName: text }))}
                placeholder="Enter a name for this route"
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {routeData.routeName || '—'}
              </Text>
            )}
          </View>

          {/* Key Factors */}
          {!isEditing && routeData.grade.key_factors && routeData.grade.key_factors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Factors</Text>
              {routeData.grade.key_factors.map((factor, index) => (
                <View key={index} style={styles.factorItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.black} />
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Difficulty Notes */}
          {!isEditing && routeData.grade.difficulty_notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Difficulty Notes</Text>
              <Text style={styles.fieldValue}>{routeData.grade.difficulty_notes}</Text>
            </View>
          )}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Notes</Text>
            {isEditing ? (
              <TextInput
                style={[globalStyles.input, styles.notesInput]}
                value={editData.notes}
                onChangeText={(text) => setEditData((prev) => ({ ...prev, notes: text }))}
                placeholder="Add your own notes about this route..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {routeData.notes || 'No notes yet'}
              </Text>
            )}
          </View>

          {/* Detection Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detection Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Selected Color:</Text>
              <Text style={styles.detailValue}>{routeData.detection.selected_colour}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Detections Found:</Text>
              <Text style={styles.detailValue}>{routeData.detection.detections_count}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Model Used:</Text>
              <Text style={styles.detailValue}>{routeData.grade.model_used}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Scanned:</Text>
              <Text style={styles.detailValue}>{formatDate(routeData.createdAt)}</Text>
            </View>
          </View>
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  gradeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
  },
  manualBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  manualBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  gradeInput: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoBox: {
    backgroundColor: colors.whiteTint,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  textInput: {
    marginTop: 8,
  },
  notesInput: {
    marginTop: 8,
    minHeight: 100,
    paddingTop: 12,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.black,
    lineHeight: 24,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  factorText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },
});

