import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { SoundProvider } from '../context/SoundContext';
import { FontSizeProvider } from '../context/FontSizeContext'; 
import { Stack } from 'expo-router';
import { Audio } from 'expo-av';
import { enableScreens } from 'react-native-screens';

enableScreens(); // Ativa transições nativas otimizadas

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      allowsRecordingIOS: false,
      shouldDuckAndroid: true,
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
      <SoundProvider>
        <FontSizeProvider>
          <View style={{ flex: 1, backgroundColor: '#191919' }} onLayout={onLayoutRootView}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade', // Transição mais suave
                contentStyle: { backgroundColor: '#191919' },
              }}
            />
          </View>
        </FontSizeProvider>
      </SoundProvider>
    </AuthProvider>
  );
}