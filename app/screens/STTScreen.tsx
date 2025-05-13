import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../components/BottomNavBar';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';
import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import { transcribeAudio } from '../../utils/googleSTT';
import { translateText } from '../../utils/googleTranslate';
import { Recording } from 'expo-av/build/Audio/Recording';
import ScaledText from '../components/ScaledText';
import { useFontSize } from '../../context/FontSizeContext';
import { useTranslation } from 'react-i18next';

const languages = [
  { label: 'Português (Portugal)', code: 'pt-PT', flag: require('../../assets/images/flag-pt.png') },
  { label: 'English (US)',         code: 'en-US', flag: require('../../assets/images/flag-en.png') },
  { label: 'Español (España)',     code: 'es-ES', flag: require('../../assets/images/flag-es.png') },
  { label: 'Français (France)',    code: 'fr-FR', flag: require('../../assets/images/flag-fr.png') },
];

export default function STTScreen() {
  const { t } = useTranslation();
  const router        = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();
  const { fontSizeMultiplier } = useFontSize();

  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [recording, setRecording]       = useState<Recording | null>(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading]           = useState(false);
  const [copied, setCopied]             = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  /* animação mic */
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  };
  const stopPulse = () => { pulseAnim.stopAnimation(); pulseAnim.setValue(1); };

  /* carrega idioma guardado */
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('selectedLang');
      if (stored) setSelectedLang(JSON.parse(stored));
    })();
  }, []);

  const handleLangChange = async (item: any) => {
    setSelectedLang(item);
    await AsyncStorage.setItem('selectedLang', JSON.stringify(item));
    triggerHaptic(); playClick();
    setModalVisible(false);
  };

  /* gravação / transcrição */
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(t('stt.permissionDeniedTitle'), t('stt.permissionDeniedMessage'));
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      startPulse();
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setLoading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      stopPulse();
      if (!uri) {
        setTranscription(t('stt.invalidAudio'));
        setLoading(false);
        return;
      }
      const original = await transcribeAudio(uri);
      if (!original) {
        setTranscription(t('stt.noSpeechDetected'));
        setLoading(false);
        return;
      }
      const translated = await translateText(original, selectedLang.code);
      setTranscription(translated ?? t('stt.translationError'));
    } catch (e) {
      console.error(e);
      setTranscription(t('stt.processingError'));
    }
    setLoading(false);
  };

  const handleMicPress = async () => {
    triggerHaptic(); playClick();
    if (recording) await stopRecording();
    else {
      setTranscription(t('stt.listening'));
      await startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity
        onPress={() => { triggerHaptic(); playClick(); router.back(); }}
        style={styles.backButton}
        hitSlop={{ top:12, bottom:12, left:12, right:12 }}
      >
          <ScaledText base={16} style={styles.backText}>{t('stt.back')}</ScaledText>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />
      </View>

      {/* Caixa de texto */}
      <View style={styles.textBox}>
        <TextInput
          style={[styles.input, { fontSize: 16 * fontSizeMultiplier }]}
          placeholder={t('stt.placeholder')}
          placeholderTextColor="#000"
          multiline
          editable={false}
          textAlignVertical="top"
          value={
            recording
              ? t('stt.listening')
              : loading
                ? t('stt.transcribing')
                : transcription
          }
        />
        <TouchableOpacity
          style={styles.copyButton}
          hitSlop={{ top:12, bottom:12, left:12, right:12 }}
          onPress={async () => {
            if (!transcription.trim()) return;
            triggerHaptic(); playClick();
            await Clipboard.setStringAsync(transcription);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('stt.copyButtonLabel')} // “Copiar texto”
        >
          <MaterialIcons name={copied ? 'check' : 'content-copy'} size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Seleção de idioma + microfone */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.dropdown, styles.dropdownButton]}
          onPress={() => { playClick(); triggerHaptic(); setModalVisible(true); }}
          hitSlop={{ top:12, bottom:12, left:12, right:12 }}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`${t('stt.languageButtonLabel')}, ${selectedLang.label}`}
          accessibilityHint={t('stt.languageButtonHint')}
        >
          <Image source={selectedLang.flag} style={styles.dropdownIcon} />
          <ScaledText accessible={false} base={14} style={styles.dropdownText}>
            {selectedLang.label}
          </ScaledText>
          <MaterialIcons accessible={false} name="arrow-drop-down" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.micButton}
          onPress={handleMicPress}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('stt.micButtonLabel')} // “Iniciar gravação de voz”
          hitSlop={{ top:24, bottom:24, left:24, right:24 }}
        >
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Image source={require('../../assets/images/mic-icon.png')} style={styles.micIcon} />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Modal idiomas */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.langModal}>
            <ScaledText base={16} style={styles.modalTitle}>{t('stt.chooseLanguage')}</ScaledText>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.langOption, selectedLang.code === item.code && styles.selected]}
                  onPress={() => handleLangChange(item)}
                >
                  <Image source={item.flag} style={styles.dropdownIcon} />
                  <ScaledText base={14} style={styles.modalOptionText}>{item.label}</ScaledText>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191919' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  backText: { color: '#fff', fontFamily: 'Montserrat-SemiBold' },
  logo: { width: 110, height: 40, resizeMode: 'contain' },

  textBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 250,
    marginTop: 15,
    marginHorizontal: 20,
    padding: 12
  },
  input: { fontFamily: 'Montserrat-Regular', color: '#000', flex: 1 },
  copyIcon: { position: 'absolute', bottom: 10, left: 10 },

  bottomArea: { marginTop: 90, alignItems: 'center', gap: 20 },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  dropdownText: { color: '#000', fontFamily: 'Montserrat-Regular' },
  modalOptionText: { color: '#fff', fontFamily: 'Montserrat-Regular' },
  dropdownIcon: { width: 18, height: 18, resizeMode: 'contain' },

backButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  copyButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownButton: {
    minHeight: 48,
    justifyContent: 'center',
  },
  micButton: {
    alignSelf: 'center',
    minWidth: 180,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },

  micIcon: { width: 180, height: 180, resizeMode: 'contain' },
  pulseCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff11',
    padding: 10,
    borderRadius: 100
  },

  modalOverlay: {
    flex: 1, backgroundColor: '#00000088',
    justifyContent: 'center', alignItems: 'center'
  },
  langModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    width: '80%',
    paddingVertical: 20,
    paddingHorizontal: 15
  },
  modalTitle: { color: '#fff', fontFamily: 'Montserrat-Bold', textAlign: 'center', marginBottom: 15 },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  selected: { backgroundColor: '#3c3c3c' },
});