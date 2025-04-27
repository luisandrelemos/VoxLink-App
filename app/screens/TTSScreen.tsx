/* app/TTSScreen.tsx */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { synthesizeTTS } from '../../utils/googleTTS';
import { translateText } from '../../utils/googleTranslate';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import BottomNavBar      from '../components/BottomNavBar';
import useHaptics        from '../../utils/useHaptics';
import { useSound }      from '../../context/SoundContext';
import { useTTSVoice }   from '../../context/TTSVoiceContext';
import ScaledText        from '../components/ScaledText';
import { useFontSize }   from '../../context/FontSizeContext';

/* ───────────── Opções ───────────── */
export type LanguageOption = { label: string; flag: any };
const languages: LanguageOption[] = [
  { label: 'Português (Portugal)', flag: require('../../assets/images/flag-pt.png') },
  { label: 'English (US)',         flag: require('../../assets/images/flag-en.png') },
  { label: 'Español (España)',     flag: require('../../assets/images/flag-es.png') },
  { label: 'Français (France)',    flag: require('../../assets/images/flag-fr.png') },
];

type VoiceOption = { label: 'Masculina' | 'Feminina'; icon: any };
const voices: VoiceOption[] = [
  { label: 'Masculina', icon: require('../../assets/images/voice-m.png') },
  { label: 'Feminina',  icon: require('../../assets/images/voice-f.png') },
];

/* Idioma → código  */
const langMap: Record<string, string> = {
  'Português (Portugal)': 'pt-PT',
  'English (US)'        : 'en-US',
  'Español (España)'    : 'es-ES',
  'Français (France)'   : 'fr-FR',
};

/* Código + voz → nome Standard gratuito */
const voiceMap: Record<string, Record<'Masculina' | 'Feminina', string>> = {
  'pt-PT': { Masculina: 'pt-PT-Standard-B', Feminina: 'pt-PT-Standard-A' },
  'en-US': { Masculina: 'en-US-Standard-D', Feminina: 'en-US-Standard-F' },
  'es-ES': { Masculina: 'es-ES-Standard-B', Feminina: 'es-ES-Standard-A' },
  'fr-FR': { Masculina: 'fr-FR-Standard-B', Feminina: 'fr-FR-Standard-A' },
};

/* Velocidades */
const speedMap: Record<string, number> = {
  '0.5x' : 0.5,
  '0.75x': 0.75,
  '1x'   : 1,
  '1.25x': 1.25,
  '1.5x' : 1.5,
};

/* ───────────── Componente ───────────── */
export default function TTSScreen() {
  const router        = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();
  const { fontSizeMultiplier } = useFontSize();

  /* preferência global vinda das Definições */
  const { voice: globalVoice } = useTTSVoice();

  /* helper seguro: devolve sempre um VoiceOption válido */
  const byLabel = (lbl: string): VoiceOption =>
    voices.find(v => v.label.toLowerCase().startsWith(lbl.toLowerCase())) ?? voices[0];

  /* Estado local (voz inicial = global) */
  const [selectedVoice, setVoice] = useState<VoiceOption>(byLabel(globalVoice));
  const [text, setText]           = useState('');
  const [selectedLang, setLang]   = useState<LanguageOption>(languages[0]);
  const [selectedSpeed, setSpeed] = useState('1x');
  const [processing, setProcessing] = useState(false);

  const [langModal, setLangModal]     = useState(false);
  const [voiceModal, setVoiceModal]   = useState(false);

  /* sempre que o valor global mudar */
  useEffect(() => { setVoice(byLabel(globalVoice)); }, [globalVoice]);

  /* …e cada vez que o ecrã ganha foco */
  useFocusEffect(
    useCallback(() => {
      setVoice(byLabel(globalVoice));
    }, [globalVoice])
  );

  /* Carregar prefs (idioma/velocidade) */
  useEffect(() => {
    (async () => {
      const lang  = await AsyncStorage.getItem('selectedLang');
      const speed = await AsyncStorage.getItem('selectedSpeed');
      if (lang)  setLang(JSON.parse(lang));
      if (speed) setSpeed(speed);
    })();
  }, []);

  /* sintetiza e reproduz */
  const playTTS = async (txt: string) => {
    const uri = await synthesizeTTS({
      text: txt,
      langCode: langMap[selectedLang.label],
      speakingRate: speedMap[selectedSpeed],
      voiceName: voiceMap[langMap[selectedLang.label]][selectedVoice.label],
    });
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  /* Handlers */
  const handleLangChange = async (item: LanguageOption) => {
    setLang(item);
    await AsyncStorage.setItem('selectedLang', JSON.stringify(item));
    triggerHaptic(); playClick(); setLangModal(false);
  };

  const handleVoiceChange = async (item: VoiceOption) => {
    setVoice(item);                         // ↔ só local
    triggerHaptic(); playClick(); setVoiceModal(false);
  };

  const handleSpeedSelect = async (label: string) => {
    setSpeed(label);
    await AsyncStorage.setItem('selectedSpeed', label);
    triggerHaptic(); playClick();
  };

  const handleConvert = async () => {
    triggerHaptic(); playClick();
    setProcessing(true);
    try {
      const translated = await translateText(text.trim() || ' ', langMap[selectedLang.label]);
      await playTTS(translated);
    } catch (err) {
      console.warn('Erro TTS:', err);
    } finally {
      setProcessing(false);
    }
  };

  /* UI */
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { triggerHaptic(); playClick(); router.back(); }}>
          <ScaledText base={16} style={styles.backText}>← Texto-para-Voz</ScaledText>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo}/>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Texto */}
        <View style={styles.textBox}>
          <TextInput
            style={[styles.input, { fontSize: 16 * fontSizeMultiplier }]}
            placeholder="Escreve aqui…"
            placeholderTextColor="#000"
            multiline
            value={text}
            onChangeText={setText}
          />
        </View>

        {/* Voz (apenas local) */}
        <View style={styles.sectionTight}>
          <ScaledText base={16} style={styles.label}>Voz</ScaledText>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => { triggerHaptic(); playClick(); setVoiceModal(true); }}
          >
            <Image source={selectedVoice.icon} style={styles.voiceIcon}/>
            <ScaledText base={14} style={styles.dropdownText}>{selectedVoice.label}</ScaledText>
            <MaterialIcons name="arrow-drop-down" size={24} color="#fff"/>
          </TouchableOpacity>
        </View>

        {/* Idioma */}
        <View style={styles.sectionTight}>
          <ScaledText base={16} style={styles.label}>Idioma</ScaledText>
          <TouchableOpacity style={styles.dropdown} onPress={() => { triggerHaptic(); playClick(); setLangModal(true); }}>
            <Image source={selectedLang.flag} style={styles.flag}/>
            <ScaledText base={14} style={styles.dropdownText}>{selectedLang.label}</ScaledText>
            <MaterialIcons name="arrow-drop-down" size={24} color="#fff"/>
          </TouchableOpacity>
        </View>

        {/* Velocidade */}
        <View style={styles.section}>
          <ScaledText base={16} style={styles.label}>Velocidade</ScaledText>
          <View style={styles.speedOptions}>
            {Object.keys(speedMap).map(label => (
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

        {/* Converter */}
        <TouchableOpacity
          style={[styles.convertButton, processing && { opacity: 0.6 }]}
          onPress={handleConvert}
          disabled={processing}
        >
          {processing
            ? <ActivityIndicator size="small" color="#000" />
            : <ScaledText base={20} style={styles.convertText}>Converter</ScaledText>}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Voz */}
      <Modal visible={voiceModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVoiceModal(false)}>
          <View style={styles.langModal}>
            <ScaledText base={16} style={styles.modalTitle}>Escolhe a voz</ScaledText>
            {voices.map(v => (
              <TouchableOpacity
                key={v.label}
                style={[styles.langOption, selectedVoice.label===v.label && styles.selected]}
                onPress={() => handleVoiceChange(v)}
              >
                <Image source={v.icon} style={styles.voiceIcon}/>
                <ScaledText base={14} style={styles.modalText}>{v.label}</ScaledText>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Idioma */}
      <Modal visible={langModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangModal(false)}>
          <View style={styles.langModal}>
            <ScaledText base={16} style={styles.modalTitle}>Escolhe o idioma</ScaledText>
            <FlatList
              data={languages}
              keyExtractor={item => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.langOption, selectedLang.label === item.label && styles.selected]}
                  onPress={() => handleLangChange(item)}
                >
                  <Image source={item.flag} style={styles.flag}/>
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

/* ───────────── Estilos ───────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191919' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backText: { color: '#fff', fontFamily: 'Montserrat-SemiBold' },
  logo:     { width: 110, height: 40, resizeMode: 'contain' },

  textBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 250,
    marginTop: 25,
    marginHorizontal: 20,
    padding: 12,
  },
  input: {
    fontFamily: 'Montserrat-Regular',
    color: '#000',
    flex: 1,
    textAlignVertical: 'top',
    textAlign: 'left',
  },

  section:      { marginTop: 10, marginHorizontal: 20 },
  sectionTight: { marginTop: 10, marginHorizontal: 20 },

  label: { color: '#fff', fontFamily: 'Montserrat-SemiBold', marginBottom: 8 },

  dropdown: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: { color: '#fff', fontFamily: 'Montserrat-Regular', flex: 1, marginLeft: 10 },

  flag:      { width: 22, height: 15, resizeMode: 'contain' },
  voiceIcon: { width: 20, height: 20, tintColor: '#fff', marginRight: 10 },

  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  speedButton: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  speedButtonActive: { backgroundColor: '#fff' },
  speedText:         { color: '#fff', fontFamily: 'Montserrat-SemiBold' },
  speedTextActive:   { color: '#000', fontFamily: 'Montserrat-Bold' },

  convertButton: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  convertText: { fontFamily: 'Montserrat-Bold', color: '#000' },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    width: '80%',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  modalTitle: { color: '#fff', fontFamily: 'Montserrat-Bold', marginBottom: 15, textAlign: 'center' },
  langOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 6 },
  modalText:  { color: '#fff', fontFamily: 'Montserrat-Regular', marginLeft: 10 },
  selected:   { backgroundColor: '#3c3c3c' },
});