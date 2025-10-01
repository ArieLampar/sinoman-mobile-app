import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@types';
import { LoginScreen } from '@screens/auth/LoginScreen';
import { OTPScreen } from '@screens/auth/OTPScreen';
import { RegistrationScreen } from '@screens/auth/RegistrationScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="OTP" component={OTPScreen} />
    <Stack.Screen
      name="Register"
      component={RegistrationScreen}
      options={{
        gestureEnabled: false, // Prevent swipe back during registration
      }}
    />
  </Stack.Navigator>
);