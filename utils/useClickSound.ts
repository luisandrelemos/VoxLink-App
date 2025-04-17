// utils/useClickSound.ts
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef } from 'react';

export default function useClickSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Pré-carregar som uma vez
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/click.mp3'),
          { shouldPlay: false }
        );
        soundRef.current = sound;
      } catch (error) {
        console.warn('Erro ao carregar som:', error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const triggerSound = useCallback(async () => {
    const enabled = await AsyncStorage.getItem('feedbackSound');
    if (enabled === 'true' && soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(0); // garantir que toca do início
        await soundRef.current.playAsync();
      } catch (error) {
        console.warn('Erro ao tocar som:', error);
      }
    }
  }, []);

  return triggerSound;
}