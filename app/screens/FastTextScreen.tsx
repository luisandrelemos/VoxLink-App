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

/* ---------- Configs partilhadas com TTSScreen ---------- */
type LanguageOption = { label: string; flag: any };
const languages: LanguageOption[] = [
  { label: 'Português (Portugal)', flag: require('../../assets/images/flag-pt.png') },
  { label: 'English (US)',         flag: require('../../assets/images/flag-en.png') },
  { label: 'Español (España)',     flag: require('../../assets/images/flag-es.png') },
  { label: 'Français (France)',    flag: require('../../assets/images/flag-fr.png') },
];

/* label → BCP-47 */
const langMap: Record<string, string> = {
  'Português (Portugal)': 'pt-PT',
  'English (US)'        : 'en-US',
  'Español (España)'    : 'es-ES',
  'Français (France)'   : 'fr-FR',
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
  '0.5x' : 0.5,
  '0.75x': 0.75,
  '1x'   : 1,
  '1.25x': 1.25,
  '1.5x' : 1.5,
};

/* Mensagens predefinidas */
const quickMessages = [
  'Olá,\nTudo Bem?',
  'Preciso\nde Ajuda',
  'Boa\nTarde!',
  'Vamos\nSair?',
  'Preciso\nde Boleia',
  'Desculpa',
  'Muito\nObrigado',
  'Estou\ncom Fome',
  'Onde\nfica a WC?',
];

export default function FastTextScreen() {
  const router         = useRouter();
  const triggerHaptic  = useHaptics();
  const { playClick }  = useSound();
  const { fontSizeMultiplier } = useFontSize();
  const { voice } = useTTSVoice();      

  /* Estado */
  const [selectedLang,  setSelectedLang] = useState<LanguageOption>(languages[0]);
  const [selectedSpeed, setSelectedSpeed] = useState<typeof speedLabels[number]>('1x');
  const [inputText,     setInputText] = useState('');
  const [modalVisible,  setModalVisible] = useState(false);
  const [processing,    setProcessing] = useState(false);

  /* Auxiliar — traduz + sintetiza e reproduz */
  const speak = async (plainText: string) => {
    const txt = plainText.trim() || ' ';
    setProcessing(true);
    try {
      const translated = await translateText(txt, langMap[selectedLang.label]);
      const uri = await synthesizeTTS({
        text: translated,
        langCode: langMap[selectedLang.label],
        speakingRate: speedMap[selectedSpeed],
        voiceName: voiceMap[langMap[selectedLang.label]][voice],
      });
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (err) {
      console.warn('Erro TTS:', err);
    } finally {
      setProcessing(false);
    }
  };

  /* Handlers */
  const handleLangChange = (item: LanguageOption) => {
    setSelectedLang(item);
    triggerHaptic(); playClick(); setModalVisible(false);
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

  /* UI */
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { triggerHaptic(); playClick(); router.back(); }}>
          <ScaledText base={16} style={styles.backText}>← Comunicação Rápida</ScaledText>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />
      </View>

      {/* Grelha de Mensagens Rápidas */}
      <View style={styles.grid}>
        {quickMessages.map((msg, idx) => (
          <TouchableOpacity key={idx} style={styles.gridItem} onPress={() => handleQuickMessage(msg)}>
            <ScaledText base={14} style={styles.gridText}>{msg}</ScaledText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Escrita Livre */}
      <View style={styles.section}>
        <ScaledText base={16} style={styles.label}>Escrita Livre</ScaledText>
        <TextInput
          style={[styles.textBox, { fontSize: 14 * fontSizeMultiplier }]}
          placeholder="Escrever Aqui"
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
            : <ScaledText base={16} style={styles.listenText}>Ouvir</ScaledText>}
        </TouchableOpacity>
      </View>

      {/* Idioma */}
      <View style={styles.section}>
        <ScaledText base={16} style={styles.label}>Idioma</ScaledText>
        <TouchableOpacity style={styles.dropdown} onPress={() => { triggerHaptic(); playClick(); setModalVisible(true); }}>
          <Image source={selectedLang.flag} style={styles.flag} />
          <ScaledText base={14} style={styles.dropdownText}>{selectedLang.label}</ScaledText>
          <MaterialIcons name="arrow-drop-down" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Velocidade */}
      <View style={styles.section}>
        <ScaledText base={16} style={styles.label}>Velocidade</ScaledText>
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
            <ScaledText base={16} style={styles.modalTitle}>Escolhe o idioma</ScaledText>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.langOption, selectedLang.label === item.label && styles.selected]}
                  onPress={() => handleLangChange(item)}
                >
                  <Image source={item.flag} style={styles.flag} />
                  <ScaledText base={14} style={styles.modalText}>{item.label}</ScaledText>
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
  label:   { color: '#fff', fontFamily: 'Montserrat-SemiBold', marginBottom: 8 },

  textBox: { backgroundColor: '#2a2a2a', borderRadius: 10, padding: 12, color: '#fff', fontFamily: 'Montserrat-Regular' },

  listenButton: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12, marginTop: 10, alignItems: 'center' },
  listenText:   { fontFamily: 'Montserrat-Bold', color: '#000' },

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
  modalText:  { color: '#fff', fontFamily: 'Montserrat-Regular', marginLeft: 10 },
  selected:   { backgroundColor: '#3c3c3c' },
});