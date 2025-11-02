import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../pages/HomeScreen';
import PastRoutes from '../pages/PastRoutes';
import RouteDetailScreen from '../pages/RouteDetailScreen';
import { FirestoreRouteDocument } from '../services/firestoreService';

export type HomeStackParamList = {
  HomeMain: undefined;
  PastRoutes: undefined;
  RouteDetail: { route: FirestoreRouteDocument };
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PastRoutes" component={PastRoutes} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
    </Stack.Navigator>
  );
}
