import React, { useEffect, useState } from 'react';
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
import { AuthService } from '../services/authService';
import { FirestoreService, FirestoreRouteDocument } from '../services/firestoreService';
import { HomeStackParamList } from '../navigation/HomeStack';
import { MainTabParamList } from '../navigation/MainTabs';

type PastRoutesNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'PastRoutes'>,
  BottomTabNavigationProp<MainTabParamList>
>;

interface RouteCardProps {
  route: FirestoreRouteDocument;
}

const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: route.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.gradeText}>{route.grade.v_grade}</Text>
          <Text style={styles.confidenceText}>
            {Math.round(route.grade.confidence * 100)}% confidence
          </Text>
        </View>
        <Text style={styles.colorText} numberOfLines={1}>
          Color: {route.detection.selected_colour}
        </Text>
        <Text style={styles.factorsText} numberOfLines={2}>
          {route.grade.key_factors.slice(0, 2).join(', ')}
        </Text>
      </View>
    </View>
  );
};

export default function PastRoutes() {
  const navigation = useNavigation<PastRoutesNavigationProp>();
  const [routes, setRoutes] = useState<FirestoreRouteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        setError('You must be logged in to view your routes');
        setLoading(false);
        return;
      }

      const userRoutes = await FirestoreService.getUserRoutes(currentUser.uid);
      setRoutes(userRoutes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load routes';
      setError(message);
      console.error('Error loading routes:', err);
    } finally {
      setLoading(false);
    }
  };

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
          renderItem={({ item }) => <RouteCard route={item} />}
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
});
