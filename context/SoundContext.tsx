// context/SoundContext.tsx
import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SoundContext = createContext<{ playClick: () => void }>({
  playClick: () => {},
});

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/click.mp3'),
          { shouldPlay: false }
        );
        soundRef.current = sound;
      } catch (e) {
        console.warn('Erro ao carregar som:', e);
      }
    };
    load();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClick = useCallback(async () => {
    const enabled = await AsyncStorage.getItem('feedbackSound');
    if (enabled === 'true' && soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } catch (e) {
        console.warn('Erro ao tocar som:', e);
      }
    }
  }, []);

  return (
    <SoundContext.Provider value={{ playClick }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);