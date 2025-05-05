/* app/screens/SettingsScreen.tsx */
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, Image, TouchableOpacity, StatusBar,
  Switch, FlatList, Modal, DeviceEventEmitter,
} from 'react-native';
import Slider          from '@react-native-community/slider';
import { useRouter }   from 'expo-router';
import AsyncStorage    from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';  
import BottomNavBar    from '../components/BottomNavBar';
import useHaptics      from '../../utils/useHaptics';
import { useSound }    from '../../context/SoundContext';
import { useFontSize } from '../../context/FontSizeContext';
import { useTTSVoice } from '../../context/TTSVoiceContext';
import type { Voice } from '../../context/TTSVoiceContext';
import ScaledText      from '../components/ScaledText';

/* ─────────── dados estáticos ─────────── */
const languages = [
  { code: 'pt', label: 'Português (Portugal)', flag: require('../../assets/images/flag-pt.png') },
  { code: 'en', label: 'English (US)',         flag: require('../../assets/images/flag-en.png') },
  { code: 'es', label: 'Español (España)',     flag: require('../../assets/images/flag-es.png') },
  { code: 'fr', label: 'Français (France)',    flag: require('../../assets/images/flag-fr.png') },
];

const ttsVoices: { key: Voice; icon: any }[] = [
  { key: 'Feminina',  icon: require('../../assets/images/voice-f.png') },
  { key: 'Masculina', icon: require('../../assets/images/voice-m.png') },
];

const userTypes = [
  { key: 'Cego',   icon: require('../../assets/images/icon-blind.png') },
  { key: 'Surdo',  icon: require('../../assets/images/icon-deaf.png') },
  { key: 'Mudo',   icon: require('../../assets/images/icon-mute.png') },
  { key: 'Outros', icon: require('../../assets/images/icon-others.png') },
];

/* ------------- defaults por tipo ------------- */
const defaults: Record<string, { sound: boolean; haptic: boolean; voiceCmd: boolean }> = {
  Cego:   { sound: true,  haptic: true,  voiceCmd: true  },
  Surdo:  { sound: false, haptic: true,  voiceCmd: true  },
  Mudo:   { sound: true,  haptic: true,  voiceCmd: false },
  Outros: { sound: true,  haptic: true,  voiceCmd: true  },
};

/* ---------- escala de fonte ---------- */
const FONT_STEPS = [0.85, 1, 1.15];
const roundStep  = (v: number) => Math.round(Math.min(2, Math.max(0, v)));
const stepToMult = (s: number) => FONT_STEPS[s] ?? 1;
const multToStep = (m: number) => (m < 0.9 ? 0 : m > 1.05 ? 2 : 1);

/* ─────────── componente ─────────── */
export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  /* helpers */
  const router        = useRouter();
  const haptic        = useHaptics();
  const { playClick } = useSound();

  /* contexto de fonte */
  const { fontSizeMultiplier, setFontSizeMultiplier } = useFontSize();
  const [sliderVal, setSliderVal] = useState(multToStep(fontSizeMultiplier));

  /* prefs seleccionadas */
  const [selectedLang,     setSelectedLang]     = useState(languages[0]);
  const [selectedUserType, setSelectedUserType] = useState(userTypes[0]);

  /* voz TTS */
  const { voice, setVoice } = useTTSVoice();

  /* visibilidade modais */
  const [langModalVisible,    setLangModalVisible]    = useState(false);
  const [voiceModalVisible,   setVoiceModalVisible]   = useState(false);
  const [userTypeModalVisible,setUserTypeModalVisible]= useState(false);

  /* switches */
  const [feedbackSound, setFeedbackSound]  = useState(false);
  const [hapticFeedback,setHapticFeedback] = useState(false);
  const [voiceCommands, setVoiceCommands]  = useState(false);

  /* ---------- aplicar defaults ---------- */
  const applyTypeDefaults = async (typeLabel:string) => {
    const { sound, haptic, voiceCmd } = defaults[typeLabel] ?? defaults.Outros;

    /* actualizar estado */
    setFeedbackSound(sound);
    setHapticFeedback(haptic);
    setVoiceCommands(voiceCmd);

    /* persistir */
    await AsyncStorage.multiSet([
      ['feedbackSound',  JSON.stringify(sound)],
      ['hapticFeedback', JSON.stringify(haptic)],
      ['voiceCommands',  JSON.stringify(voiceCmd)],
    ]);

    /* avisar BottomNavBar se necessário */
    DeviceEventEmitter.emit('voiceCommandsToggle', voiceCmd);
  };

  /* ---------- carregar prefs ---------- */
  useEffect(() => {
    (async () => {
      const [[, lang], [, type], [, sound], [, haptic], [, vcmd]] = await AsyncStorage.multiGet([
        'selectedLang', 'selectedUserType', 'feedbackSound', 'hapticFeedback', 'voiceCommands'
      ]);
      if (lang)  {
        const found = languages.find(l => l.code === JSON.parse(lang).code);
        if (found) setSelectedLang(found);
      }
      if (type) {
        const obj = JSON.parse(type);
        const found = userTypes.find(u => u.key === obj.key);
        if (found) setSelectedUserType(found);
      }
      if (sound) setFeedbackSound(JSON.parse(sound));
      if (haptic)setHapticFeedback(JSON.parse(haptic));
      if (vcmd)  setVoiceCommands(JSON.parse(vcmd));
    })();
  }, []);

  /* ---------- font slider ---------- */
  // Atualiza em tempo real o tamanho do texto
  const onSlide = (val: number) => {
     setSliderVal(val);
     const step = roundStep(val);
     setFontSizeMultiplier(stepToMult(step));
   };
  
  // Só dispara feedback háptico e sonoro quando soltar
  const onSlideComplete = (val: number) => {
     const step = roundStep(val);
     setSliderVal(step);
     setFontSizeMultiplier(stepToMult(step));
     haptic(); playClick();
   };

  /* troca de idioma */
  const changeAppLanguage = async (code: string) => {
    await i18n.changeLanguage(code);
  };

  /* ──────────────────────────── UI ──────────────────────────── */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#191919" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>{ router.push('/home'); haptic(); playClick(); }}>
          <ScaledText base={16} style={styles.backText}>{t('settings.back')}</ScaledText>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo}/>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>

        {/* Idioma */}
        <ScaledText base={16} style={styles.label}>{t('settings.language')}</ScaledText>
        <TouchableOpacity style={styles.dropdown} onPress={()=>{ setLangModalVisible(true); haptic(); playClick(); }}>
          <Image source={selectedLang.flag} style={styles.flag}/>
          <ScaledText base={14} style={styles.dropdownText}>{selectedLang.label}</ScaledText>
        </TouchableOpacity>
        <Modal visible={langModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={()=>setLangModalVisible(false)}>
            <View style={styles.langModal}>
              <ScaledText base={16} style={styles.modalTitle}>{t('settings.chooseLanguage')}</ScaledText>
              <FlatList
                data={languages}
                keyExtractor={l => l.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.langOption, item.code === selectedLang.code && styles.selected]}
                    onPress={async () => {
                      setSelectedLang(item);
                      await AsyncStorage.setItem('selectedLang', JSON.stringify(item));
                      changeAppLanguage(item.code);
                      setLangModalVisible(false);
                      haptic(); playClick();
                    }}
                  >
                    <Image source={item.flag} style={styles.flag}/>
                    <ScaledText base={14} style={styles.dropdownText}>{item.label}</ScaledText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Tamanho do texto */}
        <ScaledText base={16} style={styles.label}>{t('settings.textSize')}</ScaledText>
        <View style={styles.sliderTrack}>
          <ScaledText base={13} style={styles.sliderLabel}>aA</ScaledText>
          <Slider
            minimumValue={0}
            maximumValue={2}
            step={0.01}
            value={sliderVal}
            onValueChange={onSlide}
            onSlidingComplete={onSlideComplete}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#444"
            thumbTintColor="#fff"
            style={{ flex: 1 }}
          />
          <ScaledText base={18} style={styles.sliderLabel}>aA</ScaledText>
        </View>

        {/* Voz TTS */}
        <ScaledText base={16} style={styles.label}>{t('settings.ttsVoice')}</ScaledText>
        <TouchableOpacity style={styles.dropdown} onPress={()=>{ setVoiceModalVisible(true); haptic(); playClick(); }}>
          <Image source={ttsVoices.find(v=>v.key===voice)?.icon} style={styles.voiceIcon}/>
          <ScaledText base={14} style={styles.dropdownText}>{t(`voices.${voice}`)}</ScaledText>
        </TouchableOpacity>
        <Modal visible={voiceModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={()=>setVoiceModalVisible(false)}>
            <View style={styles.langModal}>
              <ScaledText base={16} style={styles.modalTitle}>{t('settings.chooseVoice')}</ScaledText>
              {ttsVoices.map(v => (
                <TouchableOpacity
                  key={v.key}
                  style={[styles.langOption, voice === v.key && styles.selected]}
                  onPress={async () => {
                    setVoice(v.key);
                    await AsyncStorage.setItem('ttsVoice', JSON.stringify(v.key));
                    setVoiceModalVisible(false);
                    haptic(); playClick();
                  }}
                >
                  <Image source={v.icon} style={styles.voiceIcon}/>
                  <ScaledText base={14} style={styles.dropdownText}>{t(`voices.${v.key}`)}</ScaledText>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Tipo de utilizador */}
        <ScaledText base={16} style={styles.label}>{t('settings.userType')}</ScaledText>
        <TouchableOpacity style={styles.dropdown} onPress={()=>{ setUserTypeModalVisible(true); haptic(); playClick(); }}>
          <Image source={selectedUserType.icon} style={styles.optionIcon}/>
          <ScaledText base={14} style={styles.dropdownText}>{t(`users.${selectedUserType.key}`)}</ScaledText>
        </TouchableOpacity>
        <Modal visible={userTypeModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={()=>setUserTypeModalVisible(false)}>
            <View style={styles.langModal}>
              <ScaledText base={16} style={styles.modalTitle}>{t('settings.chooseUserType')}</ScaledText>
              <FlatList
                data={userTypes}
                keyExtractor={u => u.key}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.langOption, item.key === selectedUserType.key && styles.selected]}
                    onPress={async () => {
                      setSelectedUserType(item);
                      await AsyncStorage.setItem('selectedUserType', JSON.stringify(item));
                      await applyTypeDefaults(item.key);
                      setUserTypeModalVisible(false);
                      haptic(); playClick();
                    }}
                  >
                    <Image source={item.icon} style={styles.optionIcon}/>
                    <ScaledText base={14} style={styles.dropdownText}>{t(`users.${item.key}`)}</ScaledText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Switches */}
        {[
          { key:'feedbackSound',  labelKey:'settings.soundFeedback',  descKey:'settings.soundDesc',  value:feedbackSound,  setter:setFeedbackSound },
          { key:'hapticFeedback', labelKey:'settings.hapticFeedback', descKey:'settings.hapticDesc', value:hapticFeedback, setter:setHapticFeedback },
          { key:'voiceCommands',  labelKey:'settings.voiceCommands',  descKey:'settings.voiceDesc',  value:voiceCommands,  setter:setVoiceCommands },
        ].map(({ key, labelKey, descKey, value, setter }) => (
          <View style={styles.switchRow} key={key}>
            <View>
              <ScaledText base={16} style={styles.switchLabel}>{t(labelKey)}</ScaledText>
              <ScaledText base={14} style={styles.switchDescription}>{t(descKey)}</ScaledText>
            </View>
            <Switch
              value={value}
              onValueChange={async val => {
                setter(val);
                await AsyncStorage.setItem(key, JSON.stringify(val));
                if (key === 'voiceCommands') DeviceEventEmitter.emit('voiceCommandsToggle', val);
                haptic(); playClick();
              }}
              trackColor={{ false: '#444', true: '#fff' }}
              thumbColor="#fff"
            />
          </View>
        ))}

        {/* Footer */}
        <ScaledText base={14} style={styles.footer}>{t('settings.footer')}</ScaledText>
      </View>

      <BottomNavBar/>
    </View>
  );
}

/* ---------- estilos ---------- */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#191919' },

  header:{ flexDirection:'row', justifyContent:'space-between',
           alignItems:'center', paddingHorizontal:15 },
  backText:{ color:'#fff', fontFamily:'Montserrat-SemiBold', fontSize:16 },
  logo:{ width:110, height:40, resizeMode:'contain' },

  content:{ paddingHorizontal:20 },

  label:{ color:'#fff', fontSize:16, fontFamily:'Montserrat-Bold',
          marginBottom:6, marginTop:15 },

  dropdown:{ borderWidth:1, borderColor:'#fff', padding:12, borderRadius:8,
             flexDirection:'row', alignItems:'center' },
  dropdownText:{ color:'#fff', fontSize:14, fontFamily:'Montserrat-Regular' },

  flag:{ width:24, height:16, marginRight:10, resizeMode:'contain' },

  voiceIcon:{ width:20, height:20, marginRight:10, tintColor:'#fff',
              resizeMode:'contain' },
  optionIcon:{ width:20, height:20, marginRight:10, tintColor:'#fff',
               resizeMode:'contain' },

  sliderTrack:{ flexDirection:'row', alignItems:'center',
                justifyContent:'space-between', marginTop:5 },
  sliderLabel:{ color:'#fff', fontSize:14, fontFamily:'Montserrat-Regular' },

  switchRow:{ marginTop:20, flexDirection:'row',
              justifyContent:'space-between', alignItems:'center' },
  switchLabel:{ color:'#fff', fontSize:16, fontFamily:'Montserrat-Bold' },
  switchDescription:{ color:'#aaa', fontSize:14,
                      fontFamily:'Montserrat-Regular' },

  footer:{ color:'#aaa', textAlign:'center', marginTop:40,
           fontFamily:'Montserrat-SemiBold', fontSize:14 },

  modalOverlay:{ flex:1, backgroundColor:'#00000088',
                 justifyContent:'center', alignItems:'center' },
  langModal:{ backgroundColor:'#2a2a2a', borderRadius:12,
              width:'80%', paddingVertical:20, paddingHorizontal:15 },
  modalTitle:{ color:'#fff', fontSize:16, fontFamily:'Montserrat-Bold',
               marginBottom:15, textAlign:'center' },

  langOption:{ flexDirection:'row', alignItems:'center',
               paddingVertical:12, paddingHorizontal:10, borderRadius:6 },
  selected:{ backgroundColor:'#3c3c3c' },
});
