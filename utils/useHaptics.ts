// utils/useHaptics.ts
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';

export default function useHaptics() {
  const triggerHaptic = useCallback(async () => {
    const enabled = await AsyncStorage.getItem('hapticFeedback');
    if (enabled === 'true') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  return triggerHaptic;
}