import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Voice = 'Feminina' | 'Masculina';

type Ctx = { voice: Voice; setVoice: (v: Voice) => void };
const C = createContext<Ctx>({ voice: 'Feminina', setVoice: () => {} });

export const TTSVoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [voice, setVoiceState] = useState<Voice>('Feminina');

  /* carrega escolha guardada */
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('TTSVoice');
      if (saved === 'Masculina' || saved === 'Feminina') setVoiceState(saved);
    })();
  }, []);

  const setVoice = async (v: Voice) => {
    setVoiceState(v);
    await AsyncStorage.setItem('TTSVoice', v);
  };

  return <C.Provider value={{ voice, setVoice }}>{children}</C.Provider>;
};

export const useTTSVoice = () => useContext(C);