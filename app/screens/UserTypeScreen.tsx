/* app/screens/UserTypeScreen.tsx */
import React, { useEffect, useState } from 'react';
import {
  View, TouchableOpacity, Image, StyleSheet, StatusBar,
  DeviceEventEmitter,                     
} from 'react-native';
import AsyncStorage    from '@react-native-async-storage/async-storage';
import { useRouter }   from 'expo-router';
import useHaptics      from '../../utils/useHaptics';
import { useSound }    from '../../context/SoundContext';
import ScaledText      from '../components/ScaledText';

/* ---------- perfis disponíveis ---------- */
const userTypes = [
  {
    key: 'Surdo',
    title: 'Surdo',
    desc: 'Ativa legendas, feedback visual\n e funcionalidades de texto em tempo real (STT).',
    icon: require('../../assets/images/icon-deaf.png'),
  },
  {
    key: 'Cego',
    title: 'Cego',
    desc: 'Ativa leitor de ecrã, feedback por voz (TTS), tamanhos de texto ampliados e contraste elevado.',
    icon: require('../../assets/images/icon-blind.png'),
  },
  {
    key: 'Mudo',
    title: 'Mudo',
    desc: 'Ativa comunicação rápida com frases pré-definidas,\n escrita convertida em voz e atalhos.',
    icon: require('../../assets/images/icon-mute.png'),
  },
  {
    key: 'Outros',
    title: 'Outros',
    desc: 'Acede a todas as funcionalidades de forma padrão.',
    icon: require('../../assets/images/icon-others.png'),
  },
];

/* ---------- defaults de switches ---------- */
const defaults: Record<string, { sound:boolean; haptic:boolean; voiceCmd:boolean }> = {
  Cego:   { sound:true,  haptic:true,  voiceCmd:true  },
  Surdo:  { sound:false, haptic:true,  voiceCmd:true  },
  Mudo:   { sound:true,  haptic:true,  voiceCmd:false },
  Outros: { sound:true,  haptic:true,  voiceCmd:true  },
};

export default function UserTypeScreen() {
  const router         = useRouter();
  const triggerHaptic  = useHaptics();
  const { playClick }  = useSound();

  const [soundOn,  setSoundOn] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  /* ---------- carregar prefs existentes ---------- */
  useEffect(() => {
    (async () => {
      const [ storedType , storedSound ] = await AsyncStorage.multiGet([
        'selectedUserType', 'feedbackSound',
      ]);

      if (storedType[1]) {
        const { label } = JSON.parse(storedType[1]);
        const found     = userTypes.find(u => u.title === label);
        if (found) setSelected(found.key);
      }
      if (storedSound[1] !== null) setSoundOn(JSON.parse(storedSound[1]));
    })();
  }, []);

  const click = () => { if (soundOn) playClick(); };

  /* ---------- aplicar defaults & navegar ---------- */
  async function handleContinue() {
    if (!selected) return;

    const profile = userTypes.find(u => u.key === selected)!;

    /* guardar tipo de utilizador */
    await AsyncStorage.setItem(
      'selectedUserType',
      JSON.stringify({ label: profile.title, icon: profile.icon })
    );

    /* aplicar defaults associados */
    const { sound, haptic, voiceCmd } = defaults[profile.title] ?? defaults.Outros;
    await AsyncStorage.multiSet([
      ['feedbackSound',  JSON.stringify(sound)],
      ['hapticFeedback', JSON.stringify(haptic)],
      ['voiceCommands',  JSON.stringify(voiceCmd)],
    ]);

    /* notificar BottomNavBar se “Comandos por Voz” mudou */
    DeviceEventEmitter.emit('voiceCommandsToggle', voiceCmd);

    triggerHaptic();
    click();
    router.replace('/home');
  }

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#191919" />

      <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />

      <ScaledText base={24} style={styles.heading}>
        Escolhe o Teu Perfil{'\n'}De Utilizador
      </ScaledText>

      <ScaledText base={14} style={styles.sub}>
        Personaliza a tua experiência. Podes mudar depois em Definições.
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
              <ScaledText base={16} style={styles.cardTitle}>{u.title}</ScaledText>
              <ScaledText base={12} style={styles.cardDesc}>{u.desc}</ScaledText>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !selected && { opacity: 0.4 }]}
        disabled={!selected}
        onPress={handleContinue}
      >
        <ScaledText base={18} style={styles.continueTxt}>Continuar</ScaledText>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- estilos ---------- */
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