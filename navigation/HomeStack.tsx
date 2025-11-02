import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../pages/HomeScreen';
import PastRoutes from '../pages/PastRoutes';

export type HomeStackParamList = {
  HomeMain: undefined;
  PastRoutes: undefined;
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
    </Stack.Navigator>
  );
}
