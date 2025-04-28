import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, StatusBar,
  Switch, FlatList, Modal
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';
import { useFontSize } from '../../context/FontSizeContext';
import ScaledText from '../components/ScaledText'; 
import { useTTSVoice } from '../../context/TTSVoiceContext';

// Dados
const languages = [
  { label: 'Português (Portugal)', flag: require('../../assets/images/flag-pt.png') },
  { label: 'English (US)', flag: require('../../assets/images/flag-en.png') },
  { label: 'Español (España)', flag: require('../../assets/images/flag-es.png') },
  { label: 'Français (France)', flag: require('../../assets/images/flag-fr.png') },
];

const ttsVoices = [
  { label: 'Feminina',  icon: require('../../assets/images/voice-f.png') },
  { label: 'Masculina', icon: require('../../assets/images/voice-m.png') },
];

const userTypes = [
  { label: 'Cego', icon: require('../../assets/images/icon-blind.png') },
  { label: 'Surdo', icon: require('../../assets/images/icon-deaf.png') },
  { label: 'Mudo', icon: require('../../assets/images/icon-mute.png') },
];

/* Escalas: 0 = pequeno, 1 = normal, 2 = grande */
const FONT_STEPS = [0.85, 1, 1.15];
const stepToMultiplier   = (s: number) => FONT_STEPS[s] ?? 1;
const multiplierToStep   = (m: number) => (m < 0.9 ? 0 : m > 1.05 ? 2 : 1);

/* ─────────── componente ─────────── */
export default function SettingsScreen() {
  const router = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

  /* Fonte */
  const { fontSizeMultiplier, setFontSizeMultiplier } = useFontSize();
  const [sliderValue, setSliderValue] = useState(multiplierToStep(fontSizeMultiplier));

  /* Idioma & tipo de utilizador */
  const [selectedLang, setSelectedLang]     = useState(languages[0]);
  const [selectedUserType, setSelectedUserType] = useState(userTypes[1]);

  /* Voz global do TTS */
  const { voice, setVoice } = useTTSVoice();
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);

  /* Modais */
  const [langModalVisible,  setLangModalVisible]  = useState(false);
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);

  /* Switches */
  const [feedbackSound, setFeedbackSound]   = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [voiceCommands,  setVoiceCommands]  = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      const lang = await AsyncStorage.getItem('selectedLang');
      const type = await AsyncStorage.getItem('selectedUserType');
      const sound = await AsyncStorage.getItem('feedbackSound');
      const haptic = await AsyncStorage.getItem('hapticFeedback');
      const voice = await AsyncStorage.getItem('voiceCommands');

      if (lang) setSelectedLang(JSON.parse(lang));
      if (type) {
          const saved = JSON.parse(type);
          // se já temos o ícone gravado, usamos directamente
          if (saved.icon) {
            setSelectedUserType(saved);
          } else {
            // compatibilidade com registos antigos
            const mapped = userTypes.find(u => u.label === saved.label) || userTypes[0];
            setSelectedUserType(mapped);
          }
        }     
        if (sound) setFeedbackSound(JSON.parse(sound));
        if (haptic) setHapticFeedback(JSON.parse(haptic));
        if (voice) setVoiceCommands(JSON.parse(voice));
      };

    loadPreferences();
  }, []);
  
  const handleFontSizeChange = (step: number) => {
    setSliderValue(step);                 
    setFontSizeMultiplier(stepToMultiplier(step)); 
    triggerHaptic();
    playClick();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { router.push('/home'); triggerHaptic(); playClick();}}>
          <ScaledText base={16} style={styles.backText}>← Definições</ScaledText>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>

        {/* Idioma */}
        <ScaledText base={16} style={styles.label}>Idioma</ScaledText>
        <TouchableOpacity style={styles.dropdown} onPress={() => { setLangModalVisible(true); triggerHaptic(); playClick();}}>
          <Image source={selectedLang.flag} style={styles.flag} />
          <ScaledText base={14} style={styles.dropdownText}>{selectedLang.label}</ScaledText>
        </TouchableOpacity>

        <Modal visible={langModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setLangModalVisible(false)} activeOpacity={1}>
            <View style={styles.langModal}>
              <ScaledText base={16} style={styles.modalTitle}>Escolhe o idioma</ScaledText>
              <FlatList
                data={languages}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.langOption, selectedLang.label === item.label && styles.selected]}
                    onPress={async () => {
                      setSelectedLang(item);
                      await AsyncStorage.setItem('selectedLang', JSON.stringify(item));
                      setLangModalVisible(false);
                      triggerHaptic();
                      playClick();
                    }}
                  >
                    <Image source={item.flag} style={styles.flag} />
                    <ScaledText base={14} style={styles.dropdownText}>{item.label}</ScaledText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Tamanho do texto */}
        <ScaledText base={16} style={styles.label}>Tamanho Do Texto</ScaledText>
        <View style={styles.sliderTrack}>
          <ScaledText base={13} style={styles.sliderLabel}>aA</ScaledText>

          <Slider
            minimumValue={0}
            maximumValue={2}
            step={1}
            value={sliderValue}
            onValueChange={handleFontSizeChange}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#444"
            thumbTintColor="#fff"
            style={{ flex: 1 }}
          />

          <ScaledText base={18} style={styles.sliderLabel}>aA</ScaledText>
        </View>

        {/* Voz Global do TTS */}
        <ScaledText base={16} style={styles.label}>Voz do TTS</ScaledText>
        <TouchableOpacity style={styles.dropdown} onPress={() => { setVoiceModalVisible(true); triggerHaptic(); playClick(); }}>
          <Image source={voice === 'Feminina' ? ttsVoices[0].icon : ttsVoices[1].icon} style={styles.voiceIcon}/>
          <ScaledText base={14} style={styles.dropdownText}>{voice}</ScaledText>
        </TouchableOpacity>

        <Modal visible={voiceModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setVoiceModalVisible(false)} activeOpacity={1}>
            <View style={styles.langModal}>
              <ScaledText base={16} style={styles.modalTitle}>Escolhe a voz</ScaledText>
              {ttsVoices.map(v => (
                <TouchableOpacity
                  key={v.label}
                  style={[styles.langOption, voice === v.label && styles.selected]}
                  onPress={() => { setVoice(v.label as any); setVoiceModalVisible(false); triggerHaptic(); playClick(); }}
                >
                  <Image source={v.icon} style={styles.voiceIcon}/>
                  <ScaledText base={14} style={styles.dropdownText}>{v.label}</ScaledText>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Tipo de Utilizador */}
        <ScaledText base={16} style={styles.label}>Tipo de Utilizador</ScaledText>
        <TouchableOpacity style={styles.dropdown} onPress={() => { setUserTypeModalVisible(true); triggerHaptic(); playClick();}}>
          <Image source={selectedUserType.icon} style={styles.optionIcon} />
          <ScaledText base={14} style={styles.dropdownText}>{selectedUserType.label}</ScaledText>
        </TouchableOpacity>

        <Modal visible={userTypeModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setUserTypeModalVisible(false)} activeOpacity={1}>
            <View style={styles.langModal}>
              <ScaledText base={16} style={styles.modalTitle}>Escolhe o tipo</ScaledText>
              <FlatList
                data={userTypes}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.langOption, selectedUserType.label === item.label && styles.selected]}
                    onPress={async () => {
                      setSelectedUserType(item);
                      await AsyncStorage.setItem('selectedUserType', JSON.stringify(item));
                      setUserTypeModalVisible(false);
                      triggerHaptic();
                      playClick();
                    }}
                  >
                    <Image source={item.icon} style={styles.optionIcon} />
                    <ScaledText base={14} style={styles.dropdownText}>{item.label}</ScaledText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Switches */}
        {[
          { label: 'Feedback Sonoro', desc: 'Sons em interações', value: feedbackSound, setter: setFeedbackSound, key: 'feedbackSound' },
          { label: 'Feedback Tátil', desc: 'Vibração em Interações', value: hapticFeedback, setter: setHapticFeedback, key: 'hapticFeedback' },
          { label: 'Comandos por Voz', desc: 'Ative a navegação por voz', value: voiceCommands, setter: setVoiceCommands, key: 'voiceCommands' },
        ].map((item, i) => (
          <View style={styles.switchRow} key={i}>
            <View>
              <ScaledText base={16} style={styles.switchLabel}>{item.label}</ScaledText>
              <ScaledText base={14} style={styles.switchDescription}>{item.desc}</ScaledText>
            </View>
            <Switch
              value={item.value}
              onValueChange={async (val) => {
                item.setter(val);
                await AsyncStorage.setItem(item.key, JSON.stringify(val));
                triggerHaptic();
                playClick();
              }}
              trackColor={{ false: '#444', true: '#fff' }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <ScaledText base={14} style={styles.footer}>VoxLink{"\n"}Versão 1.0</ScaledText>
      </View>

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
    paddingHorizontal: 15,
  },
  backText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
  },
  logo: {
    width: 110,
    height: 40,
    resizeMode: 'contain',
  },
  content: { paddingHorizontal: 20 },
  label: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 6,
    marginTop: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 10,
    resizeMode: 'contain',
  },
  voiceIcon: {  
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  optionIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  sliderTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  switchRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  switchDescription: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  footer: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
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
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  selected: {
    backgroundColor: '#3c3c3c',
  },
});