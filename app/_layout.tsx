import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { Stack } from 'expo-router';
import { Audio } from 'expo-av';

export default function Layout() {
  // Carregar as fontes
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    // Prevenir que o splash desapareça antes das fontes carregarem
    SplashScreen.preventAutoHideAsync();

    // Configuração global do som
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,         // permite som mesmo no modo silencioso (iOS)
      staysActiveInBackground: false,
      allowsRecordingIOS: false,
      shouldDuckAndroid: true,            // reduz o volume de outros apps (Android)
    });
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </AuthProvider>
  );
}