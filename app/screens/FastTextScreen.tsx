/* app/screens/FastTextScreen.tsx */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { synthesizeTTS } from '../../utils/googleTTS';
import { translateText } from '../../utils/googleTranslate';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';
import { useTTSVoice } from '../../context/TTSVoiceContext';
import ScaledText from '../components/ScaledText';
import { useFontSize } from '../../context/FontSizeContext';
import { useTranslation } from 'react-i18next';

/* ---------- Configs partilhadas com TTSScreen ---------- */
type LanguageOption = { code: string; flag: any };
const languages: LanguageOption[] = [
  { code: 'pt', flag: require('../../assets/images/flag-pt.png') },
  { code: 'en', flag: require('../../assets/images/flag-en.png') },
  { code: 'es', flag: require('../../assets/images/flag-es.png') },
  { code: 'fr', flag: require('../../assets/images/flag-fr.png') },
];

/* label → BCP-47 */
const langMap: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
};

/* código + voz → voiceName Standard */
const voiceMap: Record<string, Record<'Masculina' | 'Feminina', string>> = {
  'pt-PT': { Masculina: 'pt-PT-Standard-B', Feminina: 'pt-PT-Standard-A' },
  'en-US': { Masculina: 'en-US-Standard-D', Feminina: 'en-US-Standard-F' },
  'es-ES': { Masculina: 'es-ES-Standard-B', Feminina: 'es-ES-Standard-A' },
  'fr-FR': { Masculina: 'fr-FR-Standard-B', Feminina: 'fr-FR-Standard-A' },
};

/* Velocidades disponíveis */
const speedLabels = ['0.5x', '0.75x', '1x', '1.25x', '1.5x'] as const;
const speedMap: Record<typeof speedLabels[number], number> = {
  '0.5x': 0.5,
  '0.75x': 0.75,
  '1x': 1,
  '1.25x': 1.25,
  '1.5x': 1.5,
};

export default function FastTextScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();
  const { fontSizeMultiplier } = useFontSize();
  const { voice } = useTTSVoice();

  /* quickMessages via i18n */
  const quickMessages = t('fast.quickMessages', { returnObjects: true }) as string[];

  const [selectedLang, setSelectedLang]   = useState<LanguageOption>(languages[0]);
  const [selectedSpeed, setSelectedSpeed] = useState<typeof speedLabels[number]>('1x');
  const [inputText, setInputText]         = useState('');
  const [modalVisible, setModalVisible]   = useState(false);
  const [processing, setProcessing]       = useState(false);

  const speak = async (plainText: string) => {
    const txt = plainText.trim() || ' ';
    setProcessing(true);
    try {
      const translated = await translateText(txt, langMap[selectedLang.code]);
      const uri = await synthesizeTTS({
        text: translated,
        langCode: langMap[selectedLang.code],
        speakingRate: speedMap[selectedSpeed],
        voiceName: voiceMap[langMap[selectedLang.code]][voice],
      });
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch {
      console.warn('Erro TTS');
    } finally {
      setProcessing(false);
    }
  };

  const handleLangChange = (item: LanguageOption) => {
    setSelectedLang(item);
    triggerHaptic(); playClick();
    setModalVisible(false);
  };

  const handleSpeedSelect = (label: typeof speedLabels[number]) => {
    setSelectedSpeed(label);
    triggerHaptic(); playClick();
  };

  const handleQuickMessage = (message: string) => {
    const plain = message.replace(/\n/g, ' ');
    setInputText(plain);
    triggerHaptic(); playClick();
    speak(plain);
  };

  const handleListen = () => {
    triggerHaptic(); playClick();
    speak(inputText);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { triggerHaptic(); playClick(); router.back(); }}>
          <ScaledText base={16} style={styles.backText}>
            {t('fast.back')}
          </ScaledText>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />
      </View>

      {/* Grelha de Mensagens Rápidas */}
      <View style={styles.grid}>
        {quickMessages.map((msg, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.gridItem}
            onPress={() => handleQuickMessage(msg)}
          >
            <ScaledText base={14} style={styles.gridText}>{msg}</ScaledText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Escrita Livre */}
      <View style={styles.section}>
        <ScaledText base={16} style={styles.label}>
          {t('fast.freeWrite')}
        </ScaledText>
        <TextInput
          style={[styles.textBox, { fontSize: 14 * fontSizeMultiplier }]}
          placeholder={t('fast.placeholder')}
          placeholderTextColor="#aaa"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.listenButton, processing && { opacity: 0.6 }]}
          onPress={handleListen}
          disabled={processing}
        >
          {processing
            ? <ActivityIndicator size="small" color="#000" />
            : <ScaledText base={16} style={styles.listenText}>
                {t('fast.listen')}
              </ScaledText>}
        </TouchableOpacity>
      </View>

      {/* Idioma */}
      <View style={styles.section}>
        <ScaledText base={16} style={styles.label}>
          {t('fast.language')}
        </ScaledText>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => { triggerHaptic(); playClick(); setModalVisible(true); }}
        >
          <Image source={selectedLang.flag} style={styles.flag} />
          <ScaledText base={14} style={styles.dropdownText}>
            {t(`languages.${selectedLang.code}`)}
          </ScaledText>
          <MaterialIcons name="arrow-drop-down" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Velocidade */}
      <View style={styles.section}>
        <ScaledText base={16} style={styles.label}>
          {t('fast.speed')}
        </ScaledText>
        <View style={styles.speedOptions}>
          {speedLabels.map(label => (
            <TouchableOpacity
              key={label}
              style={[styles.speedButton, selectedSpeed === label && styles.speedButtonActive]}
              onPress={() => handleSpeedSelect(label)}
            >
              <ScaledText
                base={12}
                style={[styles.speedText, selectedSpeed === label && styles.speedTextActive]}
              >
                {label}
              </ScaledText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Modal Idioma */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.langModal}>
            <ScaledText base={16} style={styles.modalTitle}>
              {t('fast.chooseLanguage')}
            </ScaledText>
            <FlatList
              data={languages}
              keyExtractor={i => i.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.langOption, selectedLang.code === item.code && styles.selected]}
                  onPress={() => handleLangChange(item)}
                >
                  <Image source={item.flag} style={styles.flag} />
                  <ScaledText base={14} style={styles.modalText}>
                    {t(`languages.${item.code}`)}
                  </ScaledText>
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

/* ---------- Estilos ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191919' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
  backText: { color: '#fff', fontFamily: 'Montserrat-SemiBold' },
  logo: { width: 110, height: 40, resizeMode: 'contain' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, marginHorizontal: 15, justifyContent: 'space-between' },
  gridItem: { width: '30%', backgroundColor: '#fff', borderRadius: 10, marginVertical: 7, padding: 10, justifyContent: 'center', alignItems: 'center' },
  gridText: { textAlign: 'center', fontFamily: 'Montserrat-Bold', color: '#000' },
  section: { marginTop: 20, marginHorizontal: 20 },
  label: { color: '#fff', fontFamily: 'Montserrat-SemiBold', marginBottom: 8 },
  textBox: { backgroundColor: '#2a2a2a', borderRadius: 10, padding: 12, color: '#fff', fontFamily: 'Montserrat-Regular' },
  listenButton: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12, marginTop: 10, alignItems: 'center' },
  listenText: { fontFamily: 'Montserrat-Bold', color: '#000' },
  dropdown: { borderWidth: 1, borderColor: '#fff', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  dropdownText: { color: '#fff', fontFamily: 'Montserrat-Regular', flex: 1, marginLeft: 10 },
  flag: { width: 22, height: 15, resizeMode: 'contain' },
  speedOptions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 4 },
  speedButton: { borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, minWidth: 60, alignItems: 'center' },
  speedButtonActive: { backgroundColor: '#fff' },
  speedText: { color: '#fff', fontFamily: 'Montserrat-SemiBold' },
  speedTextActive: { color: '#000', fontFamily: 'Montserrat-Bold' },
  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center' },
  langModal: { backgroundColor: '#2a2a2a', borderRadius: 12, width: '80%', paddingVertical: 20, paddingHorizontal: 15 },
  modalTitle: { color: '#fff', fontFamily: 'Montserrat-Bold', marginBottom: 15, textAlign: 'center' },
  langOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 6 },
  modalText: { color: '#fff', fontFamily: 'Montserrat-Regular', marginLeft: 10 },
  selected: { backgroundColor: '#3c3c3c' },
});