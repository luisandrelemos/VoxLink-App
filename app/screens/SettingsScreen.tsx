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

// Dados
const languages = [
  { label: 'Português (Portugal)', flag: require('../../assets/images/flag-pt.png') },
  { label: 'English (US)', flag: require('../../assets/images/flag-en.png') },
  { label: 'Español (España)', flag: require('../../assets/images/flag-es.png') },
  { label: 'Français (France)', flag: require('../../assets/images/flag-fr.png') },
];

const contrastThemes = [
  { label: 'Monocromático', icon: require('../../assets/images/icon-theme-mono.png') },
  { label: 'Colorido', icon: require('../../assets/images/icon-theme-color.png') },
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

  /* ‣ Fonte via contexto */
  const { fontSizeMultiplier, setFontSizeMultiplier } = useFontSize();
  const [sliderValue, setSliderValue] = useState(multiplierToStep(fontSizeMultiplier));

  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [selectedTheme, setSelectedTheme] = useState(contrastThemes[0]);
  const [selectedUserType, setSelectedUserType] = useState(userTypes[1]);

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);

  const [feedbackSound, setFeedbackSound] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      const lang = await AsyncStorage.getItem('selectedLang');
      const theme = await AsyncStorage.getItem('selectedTheme');
      const type = await AsyncStorage.getItem('selectedUserType');
      const sound = await AsyncStorage.getItem('feedbackSound');
      const haptic = await AsyncStorage.getItem('hapticFeedback');
      const voice = await AsyncStorage.getItem('voiceCommands');

      if (lang) setSelectedLang(JSON.parse(lang));
      if (theme) setSelectedTheme(JSON.parse(theme));
      if (type) setSelectedUserType(JSON.parse(type));
      if (sound) setFeedbackSound(JSON.parse(sound));
      if (haptic) setHapticFeedback(JSON.parse(haptic));
      if (voice) setVoiceCommands(JSON.parse(voice));
    };

    loadPreferences();
  }, []);
  
  const handleFontSizeChange = (step: number) => {
    setSliderValue(step);                    // UI
    setFontSizeMultiplier(stepToMultiplier(step));  // contexto + AsyncStorage
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

        {/* Tema */}
        <ScaledText base={16} style={styles.label}>Tema Alto Contraste</ScaledText>
        <TouchableOpacity style={styles.dropdown} onPress={() => { setThemeModalVisible(true); triggerHaptic(); playClick();}}>
          <Image source={selectedTheme.icon} style={styles.optionIcon} />
          <ScaledText base={14} style={styles.dropdownText}>{selectedTheme.label}</ScaledText>
        </TouchableOpacity>

        <Modal visible={themeModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setThemeModalVisible(false)} activeOpacity={1}>
            <View style={styles.langModal}>
              <ScaledText base={16} style={styles.modalTitle}>Escolhe o tema</ScaledText>
              <FlatList
                data={contrastThemes}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.langOption, selectedTheme.label === item.label && styles.selected]}
                    onPress={async () => {
                      setSelectedTheme(item);
                      await AsyncStorage.setItem('selectedTheme', JSON.stringify(item));
                      setThemeModalVisible(false);
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