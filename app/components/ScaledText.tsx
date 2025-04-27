import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useFontSize } from '../../context/FontSizeContext';

/**
 * Usa-o no lugar de <Text>.  
 * A prop **base** é o tamanho “normal” que você já usava (ex.: 15, 18…).
 */
type Props = TextProps & { base: number };

export default function ScaledText({ base, style, children, ...rest }: Props) {
  const { fontSizeMultiplier } = useFontSize();

  // Garante que o fontSize final seja sempre base × multiplicador
  const combined = StyleSheet.flatten([
    style,
    { fontSize: base * fontSizeMultiplier },
  ]);

  return (
    <RNText {...rest} style={combined}>
      {children}
    </RNText>
  );
}