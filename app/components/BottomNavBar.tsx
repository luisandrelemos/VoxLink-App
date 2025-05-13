/* app/components/BottomNavBar.tsx */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Dimensions,
  BackHandler,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';
import { listenAndRecognize, cancelRecording } from '../../utils/VoiceAssistant';
import { getVoiceCommand } from '../../utils/voiceCommands';

const { width, height } = Dimensions.get('window');

/* ──────────────────────────────────────────
   Ícones fixos da barra
────────────────────────────────────────── */
const icons = {
  home:     require('../../assets/images/nav-home.png'),
  profile:  require('../../assets/images/nav-profile.png'),
  settings: require('../../assets/images/nav-settings.png'),
  info:     require('../../assets/images/nav-info.png'),
} as const;

// logo no topo do ficheiro
const navLabels: Record<keyof typeof icons, string> = {
  home:     'Página Inicial',
  profile:  'Minha Conta',
  settings: 'Definições',
  info:     'Informações',
};

/* rotas válidas reconhecidas pela expo-router  */
type AppRoute = '/home' | '/account' | '/settings' | '/info';

/* ──────────────────────────────────────────
   Componente principal
────────────────────────────────────────── */
export default function BottomNavBar() {
  /* helpers de navegação, som e vibração */
  const router        = useRouter();
  const pathname      = usePathname();
  const haptic        = useHaptics();
  const { playClick } = useSound();
  const isActive = (p: string) => pathname === p;

  /* estado do assistente e da animação */
  const [voiceActive,   setVoiceActive]   = useState(false);
  const [forceCanceled, setForceCanceled] = useState(false);

  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  /* switch “Comandos por Voz” vindo das Definições */
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  /* lê preferência e subscreve alterações */
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('voiceCommands');
      setVoiceEnabled(stored !== 'false');      // default ON
    })();

    const sub = DeviceEventEmitter.addListener('voiceCommandsToggle', (val: boolean) => {
      setVoiceEnabled(val);
    });
    return () => sub.remove();
  }, []);

  /* ───── animação do overlay ───── */
  const startAnim = () => {
    setVoiceActive(true);
    setForceCanceled(false);
    Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  };

  const stopAnim = async () => {
    setVoiceActive(false);
    setForceCanceled(true);
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
    Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    await cancelRecording();
  };

  /* funções rápidas chamadas por comandos de voz */
  const toggleSound = async () => {
    const cur = await AsyncStorage.getItem('feedbackSound');
    await AsyncStorage.setItem('feedbackSound', JSON.stringify(cur !== 'true'));
  };
  const toggleVibration = async () => {
    const cur = await AsyncStorage.getItem('hapticFeedback');
    await AsyncStorage.setItem('hapticFeedback', JSON.stringify(cur !== 'true'));
  };

  /* handler do logótipo – abre o assistente */
  const handleVoiceCommand = async () => {
    if (!voiceEnabled) {           // assistente desativado nas Definições
      haptic(); playClick();
      return;
    }

    if (voiceActive) { await stopAnim(); return; }

    haptic(); playClick(); startAnim();
    try {
      const result = await listenAndRecognize();
      await stopAnim();

      if (forceCanceled || !result) return;

      const ok = getVoiceCommand(result, router, toggleSound, toggleVibration);
      if (!ok) Alert.alert('Comando não reconhecido', `Comando: "${result}"`);
    } catch (err) {
      await stopAnim();
      if (!forceCanceled)
        Alert.alert('Erro', 'Ocorreu um problema com o assistente de voz.');
    }
  };

  /* botão BACK (Android) fecha o overlay */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (voiceActive) { stopAnim(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [voiceActive]);

  /* ───── UI ───── */
  return (
    <>
      {/* overlay + círculo pulsante */}
      {voiceActive && (
        <TouchableWithoutFeedback onPress={stopAnim}>
          <Animated.View style={[styles.voiceOverlay, { opacity: opacityAnim }]}>
            <Animated.Image
              source={require('../../assets/images/logo.png')}
              style={[styles.voiceLogo, { transform: [{ scale: scaleAnim }] }]}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      )}

      {/* barra de navegação */}
      <View style={styles.navBar}>
        <NavBtn route="/home"     icon="home"    />
        <NavBtn route="/account"  icon="profile" />

        {/* logótipo - assistente */}
        <TouchableOpacity
        accessible
        accessibilityRole="button"
        accessibilityLabel="Assistente de Voz"
        onPress={handleVoiceCommand}
        activeOpacity={voiceEnabled ? 0.7 : 1}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
          <Image
            source={require('../../assets/images/logo.png')}
            style={[styles.navLogo, !voiceEnabled && { opacity: 0.35 }]}
          />
        </TouchableOpacity>

        <NavBtn route="/settings" icon="settings" />
        <NavBtn route="/info"     icon="info"     />
      </View>
    </>
  );

  /* ───── sub-componente botão de navegação ───── */
  function NavBtn({ route, icon }: { route: AppRoute; icon: keyof typeof icons }) {
    const active = isActive(route);
    return (
      <TouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={navLabels[icon]}
      onPress={() => {
        if (!active) {
          haptic();
          playClick();
          router.replace(route);
        }
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
        <View style={styles.navItem}>
          <Image source={icons[icon]} style={[styles.navIcon, active && styles.active]} />
          {active && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>
    );
  }
}

/* ───── estilos ───── */
const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#353535',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem:  {
   alignItems: 'center',    justifyContent: 'center',    minWidth: 48,    minHeight: 48,  },
  navIcon:  { width: 30, height: 30, tintColor: '#fff', resizeMode: 'contain' },
  navLogo:  { width: 55, height: 55, resizeMode: 'contain' },
  active:   { tintColor: '#fff' },
  navIndicator: { width: 6, height: 6, backgroundColor: '#fff', borderRadius: 3, marginTop: 4 },

  voiceOverlay: {
    position: 'absolute',
    width,
    height,
    backgroundColor: '#000000cc',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 90,
    zIndex: 10,
  },
  voiceLogo: { width: 80, height: 80, resizeMode: 'contain' },
});