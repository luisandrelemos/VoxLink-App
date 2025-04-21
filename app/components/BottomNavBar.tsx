import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';
import { listenAndRecognize } from '../../utils/VoiceAssistant';
import { getVoiceCommand } from '../../utils/voiceCommands';

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

  const isActive = (path: string) => pathname === path;

  const handleVoiceCommand = async () => {
    triggerHaptic();
    playClick();

    try {
      const result = await listenAndRecognize();
      if (!result) return Alert.alert('Erro', 'Não consegui ouvir o que disseste.');

      const commandRecognized = getVoiceCommand(result, router, playClick); // <- ✅ agora está correto
      if (!commandRecognized) {
        Alert.alert('Comando não reconhecido', `Comando: "${result}"`);
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um problema com o assistente de voz.');
      console.error('Erro no assistente de voz:', err);
    }
  };

  return (
    <View style={styles.navBar}>
      {/* Home */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive('/home')) {
            triggerHaptic();
            playClick();
            router.replace('/home');
          }
        }}
      >
        <View style={styles.navItem}>
          <Image
            source={require('../../assets/images/nav-home.png')}
            style={[styles.navIcon, isActive('/home') && styles.active]}
          />
          {isActive('/home') && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive('/account')) {
            triggerHaptic();
            playClick();
            router.replace('/account');
          }
        }}
      >
        <View style={styles.navItem}>
          <Image
            source={require('../../assets/images/nav-profile.png')}
            style={[styles.navIcon, isActive('/account') && styles.active]}
          />
          {isActive('/account') && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>

      {/* Botão Central (Assistente de Voz) */}
      <TouchableOpacity onPress={handleVoiceCommand}>
        <Image source={require('../../assets/images/logo.png')} style={styles.navLogo} />
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive('/settings')) {
            triggerHaptic();
            playClick();
            router.replace('/settings');
          }
        }}
      >
        <View style={styles.navItem}>
          <Image
            source={require('../../assets/images/nav-settings.png')}
            style={[styles.navIcon, isActive('/settings') && styles.active]}
          />
          {isActive('/settings') && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>

      {/* Info */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive('/info')) {
            triggerHaptic();
            playClick();
            router.replace('/info');
          }
        }}
      >
        <View style={styles.navItem}>
          <Image
            source={require('../../assets/images/nav-info.png')}
            style={[styles.navIcon, isActive('/info') && styles.active]}
          />
          {isActive('/info') && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>
    </View>
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
});
