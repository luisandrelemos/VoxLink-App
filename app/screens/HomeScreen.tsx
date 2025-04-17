import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

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
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />

        {/* Bloco: Speech-to-Text */}
        <TouchableOpacity style={styles.block} onPress={() => handlePress(() => router.push('/stt'))}>
          <Image source={require('../../assets/images/stt-icon.png')} style={styles.blockImage} />
          <Text style={styles.blockLabel}>Speech-to-Text</Text>
        </TouchableOpacity>

        {/* Bloco: Text-to-Speech */}
        <TouchableOpacity style={styles.block} onPress={() => handlePress(() => router.push('/tts'))}>
          <Image source={require('../../assets/images/tts-icon.png')} style={styles.blockImage} />
          <Text style={styles.blockLabel}>Text-to-Speech</Text>
        </TouchableOpacity>

        {/* Bloco: Comunicação Rápida */}
        <TouchableOpacity style={styles.block} onPress={() => handlePress(() => router.push('/fasttext'))}>
          <Image source={require('../../assets/images/list-icon.png')} style={styles.blockImage} />
          <Text style={styles.blockLabel}>Comunicação Rápida</Text>
        </TouchableOpacity>

        {/* Bloco: Acessibilidade */}
        <TouchableOpacity style={styles.block} onPress={() => handlePress(() => router.push('/settings'))}>
          <Image source={require('../../assets/images/accessibility-icon.png')} style={styles.blockImage} />
          <Text style={styles.blockLabel}>Acessibilidade</Text>
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