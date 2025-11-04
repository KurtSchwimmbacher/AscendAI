import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors } from '../styles/globalStyles';
import { FirestoreRouteDocument } from '../services/firestoreService';
import { usePastRoutes } from '../hooks/usePastRoutes';
import { HomeStackParamList } from '../navigation/HomeStack';
import { MainTabParamList } from '../navigation/MainTabs';

type PastRoutesNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'PastRoutes'>,
  BottomTabNavigationProp<MainTabParamList>
>;

interface RouteCardProps {
  route: FirestoreRouteDocument;
  onPress: () => void;
  onDelete: (routeId: string) => void;
  isDeleting?: boolean;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onPress, onDelete, isDeleting }) => {
  const displayGrade = route.manualGrade || route.grade.v_grade;
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: route.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.gradeText}>{displayGrade}</Text>
          <Text style={styles.confidenceText}>
            {Math.round(route.grade.confidence * 100)}% confidence
          </Text>
        </View>
        {route.routeName && (
          <Text style={styles.routeNameText} numberOfLines={1}>
            {route.routeName}
          </Text>
        )}
        <Text style={styles.colorText} numberOfLines={1}>
          Color: {route.detection.selected_colour}
        </Text>
        <Text style={styles.factorsText} numberOfLines={2}>
          {route.grade.key_factors.slice(0, 2).join(', ')}
        </Text>
        <TouchableOpacity
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          onPress={(e) => {
            e.stopPropagation();
            onDelete(route.id!);
          }}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={16} color={colors.white} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function PastRoutes() {
  const navigation = useNavigation<PastRoutesNavigationProp>();
  const {
    routes,
    loading,
    error,
    deletingRouteId,
    loadRoutes,
    handleDeleteRoute,
  } = usePastRoutes();

  useFocusEffect(
    React.useCallback(() => {
      loadRoutes();
    }, [loadRoutes])
  );

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.black} />
        <Text style={[globalStyles.textBody, { marginTop: 16 }]}>Loading routes...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color={colors.red} />
        <Text style={[globalStyles.textBody, { marginTop: 16, textAlign: 'center' }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[globalStyles.buttonFullWidth, { marginTop: 24 }]}
          onPress={loadRoutes}
        >
          <Text style={[globalStyles.textButtonLarge, globalStyles.textWhite]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={[globalStyles.textTitle, globalStyles.textPrimary]}>
          Past Routes
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {routes.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="images-outline" size={64} color={colors.red} />
          <Text style={[globalStyles.textSubheading, { marginTop: 16, textAlign: 'center' }]}>
            No routes yet
          </Text>
          <Text style={[globalStyles.textBody, { marginTop: 8, textAlign: 'center' }]}>
            Scan your first route to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          renderItem={({ item }) => (
            <RouteCard
              route={item}
              onPress={() => navigation.navigate('RouteDetail', { route: item })}
              onDelete={handleDeleteRoute}
              isDeleting={deletingRouteId === item.id}
            />
          )}
          keyExtractor={(item, index) => item.id || `route-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
  },
  confidenceText: {
    fontSize: 14,
    color: colors.red,
  },
  colorText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  factorsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
