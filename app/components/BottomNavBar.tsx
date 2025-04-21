import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Dimensions,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, usePathname } from 'expo-router';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';
import { listenAndRecognize, cancelRecording } from '../../utils/VoiceAssistant';
import { getVoiceCommand } from '../../utils/voiceCommands';

const { width, height } = Dimensions.get('window');

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

  const isActive = (path: string) => pathname === path;

  const [voiceActive, setVoiceActive] = useState(false);
  const [forceCanceled, setForceCanceled] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const startSiriAnimation = () => {
    setVoiceActive(true);
    setForceCanceled(false);
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopSiriAnimation = async () => {
    setVoiceActive(false);
    setForceCanceled(true);
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    await cancelRecording();
  };

  const toggleSound = async () => {
    try {
      const current = await AsyncStorage.getItem('feedbackSound');
      const newValue = current !== 'true';
      await AsyncStorage.setItem('feedbackSound', JSON.stringify(newValue));
    } catch (e) {
      console.error('Erro ao alternar o som:', e);
    }
  };
  
  const toggleVibration = async () => {
    try {
      const current = await AsyncStorage.getItem('hapticFeedback');
      const newValue = current !== 'true';
      await AsyncStorage.setItem('hapticFeedback', JSON.stringify(newValue));
    } catch (e) {
      console.error('Erro ao alternar a vibração:', e);
    }
  };  

  const handleVoiceCommand = async () => {
    if (voiceActive) {
      await stopSiriAnimation();
      return;
    }

    triggerHaptic();
    playClick();
    startSiriAnimation();

    try {
      const result = await listenAndRecognize();
      await stopSiriAnimation();

      if (forceCanceled || !result) return;

      const commandRecognized = getVoiceCommand(result, router, toggleSound, toggleVibration);

      if (!commandRecognized) {
        Alert.alert('Comando não reconhecido', `Comando: "${result}"`);
      }
    } catch (err) {
      await stopSiriAnimation();
      if (!forceCanceled) {
        Alert.alert('Erro', 'Ocorreu um problema com o assistente de voz.');
        console.error('Erro no assistente de voz:', err);
      }
    }
  };

  React.useEffect(() => {
    const backAction = () => {
      if (voiceActive) {
        stopSiriAnimation();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [voiceActive]);

  return (
    <>
      {voiceActive && (
        <TouchableWithoutFeedback onPress={stopSiriAnimation}>
          <Animated.View style={[styles.voiceOverlay, { opacity: opacityAnim }]}>            
            <Animated.Image
              source={require('../../assets/images/logo.png')}
              style={[styles.voiceLogo, { transform: [{ scale: scaleAnim }] }]}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      )}

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => { if (!isActive('/home')) { triggerHaptic(); playClick(); router.replace('/home'); } }}>
          <View style={styles.navItem}>
            <Image source={require('../../assets/images/nav-home.png')} style={[styles.navIcon, isActive('/home') && styles.active]} />
            {isActive('/home') && <View style={styles.navIndicator} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { if (!isActive('/account')) { triggerHaptic(); playClick(); router.replace('/account'); } }}>
          <View style={styles.navItem}>
            <Image source={require('../../assets/images/nav-profile.png')} style={[styles.navIcon, isActive('/account') && styles.active]} />
            {isActive('/account') && <View style={styles.navIndicator} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleVoiceCommand}>
          <Image source={require('../../assets/images/logo.png')} style={styles.navLogo} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { if (!isActive('/settings')) { triggerHaptic(); playClick(); router.replace('/settings'); } }}>
          <View style={styles.navItem}>
            <Image source={require('../../assets/images/nav-settings.png')} style={[styles.navIcon, isActive('/settings') && styles.active]} />
            {isActive('/settings') && <View style={styles.navIndicator} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { if (!isActive('/info')) { triggerHaptic(); playClick(); router.replace('/info'); } }}>
          <View style={styles.navItem}>
            <Image source={require('../../assets/images/nav-info.png')} style={[styles.navIcon, isActive('/info') && styles.active]} />
            {isActive('/info') && <View style={styles.navIndicator} />}
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#353535',
    width: '100%',
    height: 60,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  navLogo: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
  active: {
    tintColor: '#fff',
  },
  navIndicator: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
    marginTop: 4,
  },
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
  voiceLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});
