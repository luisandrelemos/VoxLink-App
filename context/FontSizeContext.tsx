import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontSizeContextType = {
  fontSizeMultiplier: number;
  setFontSizeMultiplier: (value: number) => void;
};

const FontSizeContext = createContext<FontSizeContextType>({
  fontSizeMultiplier: 1,
  setFontSizeMultiplier: () => {},
});

export const FontSizeProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  useEffect(() => {
    AsyncStorage.getItem('fontSizeValue').then((val) => {
      if (val !== null) {
        setFontSizeMultiplier(parseFloat(val));
      }
    });
  }, []);

  const updateFontSize = (value: number) => {
    setFontSizeMultiplier(value);
    AsyncStorage.setItem('fontSizeValue', value.toString());
  };

  return (
    <FontSizeContext.Provider value={{ fontSizeMultiplier, setFontSizeMultiplier: updateFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);