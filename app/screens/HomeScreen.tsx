import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar
} from 'react-native';
import { useRouter }    from 'expo-router';
import { useTranslation } from 'react-i18next';

import BottomNavBar from '../components/BottomNavBar';
import useHaptics    from '../../utils/useHaptics';
import { useSound }  from '../../context/SoundContext';
import ScaledText    from '../components/ScaledText';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router        = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();
  const { t }         = useTranslation();

  const handlePress = (callback: () => void) => {
    triggerHaptic();
    playClick();
    callback();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      <View style={styles.scrollContainer}>
        {/* Logo no topo */}
        <Image
          source={require('../../assets/images/logo-header.png')}
          style={styles.logo}
        />

        {/* Bloco: Voz-para-Texto */}
        <TouchableOpacity
          style={styles.block}
          onPress={() => handlePress(() => router.push('/stt'))}
        >
          <Image
            source={require('../../assets/images/stt-icon.png')}
            style={styles.blockImage}
          />
          <ScaledText base={15} style={styles.blockLabel}>
            {t('home.voiceToText')}
          </ScaledText>
        </TouchableOpacity>

        {/* Bloco: Texto-para-Voz */}
        <TouchableOpacity
          style={styles.block}
          onPress={() => handlePress(() => router.push('/tts'))}
        >
          <Image
            source={require('../../assets/images/tts-icon.png')}
            style={styles.blockImage}
          />
          <ScaledText base={15} style={styles.blockLabel}>
            {t('home.textToVoice')}
          </ScaledText>
        </TouchableOpacity>

        {/* Bloco: Comunicação Rápida */}
        <TouchableOpacity
          style={styles.block}
          onPress={() => handlePress(() => router.push('/fasttext'))}
        >
          <Image
            source={require('../../assets/images/list-icon.png')}
            style={styles.blockImage}
          />
          <ScaledText base={15} style={styles.blockLabel}>
            {t('home.quickComms')}
          </ScaledText>
        </TouchableOpacity>

        {/* Bloco: Acessibilidade */}
        <TouchableOpacity
          style={styles.block}
          onPress={() => handlePress(() => router.push('/settings'))}
        >
          <Image
            source={require('../../assets/images/accessibility-icon.png')}
            style={styles.blockImage}
          />
          <ScaledText base={15} style={styles.blockLabel}>
            {t('home.accessibility')}
          </ScaledText>
        </TouchableOpacity>
      </View>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191919',
  },
  scrollContainer: {
    paddingTop: 40,
    paddingBottom: 100,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: -40,
  },
  block: {
    marginBottom: 10,
    width: width - 60,
    alignItems: 'center',
  },
  blockImage: {
    width: 300,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  blockLabel: {
    color: '#fff',
    marginTop: 2,
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
});