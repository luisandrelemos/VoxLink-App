import React, { useEffect, useState } from 'react';
import {
  View, TouchableOpacity, Image, StyleSheet, StatusBar,
  DeviceEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';
import ScaledText from '../components/ScaledText';

/* ─────────── perfis disponíveis ─────────── */
const userTypes = [
  {
    key: 'Surdo',
    icon: require('../../assets/images/icon-deaf.png'),
  },
  {
    key: 'Cego',
    icon: require('../../assets/images/icon-blind.png'),
  },
  {
    key: 'Mudo',
    icon: require('../../assets/images/icon-mute.png'),
  },
  {
    key: 'Outros',
    icon: require('../../assets/images/icon-others.png'),
  },
];

/* ─────────── defaults ─────────── */
const defaults: Record<string, { sound: boolean; haptic: boolean; voiceCmd: boolean }> = {
  Cego:   { sound: true,  haptic: true,  voiceCmd: true  },
  Surdo:  { sound: false, haptic: true,  voiceCmd: true  },
  Mudo:   { sound: true,  haptic: true,  voiceCmd: false },
  Outros: { sound: true,  haptic: true,  voiceCmd: true  },
};

export default function UserTypeScreen() {
  const { t }         = useTranslation();
  const router        = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

  const [soundOn, setSoundOn]     = useState(true);
  const [selected, setSelected]   = useState<string | null>(null);

  // Carregar prefs
  useEffect(() => {
    (async () => {
      const [[, storedType], [, storedSound]] = await AsyncStorage.multiGet([
        'selectedUserType', 'feedbackSound',
      ]);

      if (storedType) {
        const obj = JSON.parse(storedType);
        setSelected(obj.key);
      }
      if (storedSound !== null) {
        setSoundOn(JSON.parse(storedSound));
      }
    })();
  }, []);

  const click = () => {
    if (soundOn) playClick();
  };

  // Guardar e aplicar defaults
  async function handleContinue() {
    if (!selected) return;
    const profile = { key: selected, icon: userTypes.find(u=>u.key===selected)!.icon };

    await AsyncStorage.setItem('selectedUserType', JSON.stringify(profile));
    const defs = defaults[selected] ?? defaults.Outros;
    await AsyncStorage.multiSet([
      ['feedbackSound',  JSON.stringify(defs.sound)],
      ['hapticFeedback', JSON.stringify(defs.haptic)],
      ['voiceCommands',  JSON.stringify(defs.voiceCmd)],
    ]);
    DeviceEventEmitter.emit('voiceCommandsToggle', defs.voiceCmd);

    triggerHaptic();
    click();
    router.replace('/home');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#191919" />

      <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />

      <ScaledText base={24} style={styles.heading}>
        {t('userType.heading')}
      </ScaledText>
      <ScaledText base={14} style={styles.sub}>
        {t('userType.sub')}
      </ScaledText>

      <View style={styles.grid}>
        {userTypes.map(u => {
          const active = selected === u.key;
          return (
            <TouchableOpacity
              key={u.key}
              activeOpacity={0.9}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => { triggerHaptic(); click(); setSelected(u.key); }}
            >
              <Image source={u.icon} style={styles.cardIcon} />
              <ScaledText base={16} style={styles.cardTitle}>
                {t(`userType.profiles.${u.key}.title`)}
              </ScaledText>
              <ScaledText base={12} style={styles.cardDesc}>
                {t(`userType.profiles.${u.key}.desc`)}
              </ScaledText>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !selected && { opacity: 0.4 }]}
        disabled={!selected}
        onPress={handleContinue}
      >
        <ScaledText base={18} style={styles.continueTxt}>
          {t('userType.continue')}
        </ScaledText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#191919', alignItems:'center', paddingTop:10 },
  logo:{ width:110, height:40, resizeMode:'contain', marginBottom:25 },

  heading:{ color:'#fff', fontFamily:'Montserrat-Bold', textAlign:'center' },
  sub:{ color:'#ccc', fontFamily:'Montserrat-Regular', textAlign:'center',
        marginVertical:10, width:'80%' },

  grid:{ width:'90%', flexDirection:'row', flexWrap:'wrap',
         justifyContent:'space-between', marginTop:20 },

  card:{ width:'47%', backgroundColor:'#fff', borderRadius:16, padding:14,
         marginBottom:16, alignItems:'center', elevation:3 },
  cardActive:{ backgroundColor:'#e8f0ff', borderWidth:2, borderColor:'#4ea1ff',
               elevation:8, shadowColor:'#4ea1ff', shadowRadius:6, shadowOpacity:0.6 },

  cardIcon:{ width:42, height:42, tintColor:'#000', marginBottom:8, resizeMode:'contain' },
  cardTitle:{ fontFamily:'Montserrat-Bold', color:'#000', marginBottom:4 },
  cardDesc:{ fontFamily:'Montserrat-Regular', color:'#000', textAlign:'center' },

  continueBtn:{ backgroundColor:'#fff', borderRadius:12,
                paddingVertical:16, paddingHorizontal:44, marginTop:20 },
  continueTxt:{ fontFamily:'Montserrat-Bold', color:'#000' },
});
