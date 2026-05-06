import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HODNavigator } from './HODNavigator';
import { EngineerNavigator } from './EngineerNavigator';
import { AdminNavigator } from './AdminNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
        <Stack.Screen name="HODDashboard" component={HODNavigator} />
        <Stack.Screen name="EngineerDashboard" component={EngineerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
