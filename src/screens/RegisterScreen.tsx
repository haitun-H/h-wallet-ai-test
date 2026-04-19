import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import RegisterScreen from './src/screens/RegisterScreen';
import { toastConfig } from './src/components/ToastConfig';

export default function App() {
  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <RegisterScreen />
      <Toast config={toastConfig} />
    </PaperProvider>
  );
}