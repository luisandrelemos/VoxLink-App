import '../utils/i18n';
import i18n from '../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { TTSVoiceProvider } from '../context/TTSVoiceContext';


enableScreens(); // Ativa transições nativas otimizadas

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    // Mantém a splash aberta até o recurso estar pronto
    SplashScreen.preventAutoHideAsync();
    // Configuração de áudio
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      allowsRecordingIOS: false,
      shouldDuckAndroid: true,
    });

    // Carregar idioma preferido e aplicar
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('selectedLang');
        if (stored) {
          const { code } = JSON.parse(stored);
          if (code) {
            await i18n.changeLanguage(code);
          }
        }
      } catch (e) {
        console.warn('Falha ao carregar idioma:', e);
      }
    })();
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
          <TTSVoiceProvider>
            <View style={{ flex: 1, backgroundColor: '#191919' }} onLayout={onLayoutRootView}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade', // Transição mais suave
                  contentStyle: { backgroundColor: '#191919' },
                }}
              />
            </View>
          </TTSVoiceProvider>
        </FontSizeProvider>
      </SoundProvider>
    </AuthProvider>
  );
}