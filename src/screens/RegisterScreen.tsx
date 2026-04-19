import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#00C853', backgroundColor: '#F1F8E9' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
      }}
      text2Style={{
        fontSize: 12,
        color: '#666',
      }}
    />
  ),
  
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#FF5252', backgroundColor: '#FFEBEE' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
      }}
      text2Style={{
        fontSize: 12,
        color: '#666',
      }}
    />
  ),
};