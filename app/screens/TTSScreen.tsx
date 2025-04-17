import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../components/BottomNavBar';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';

const languages = [
  { label: 'Português (Portugal)', flag: require('../../assets/images/flag-pt.png') },
  { label: 'English (US)', flag: require('../../assets/images/flag-en.png') },
  { label: 'Español (España)', flag: require('../../assets/images/flag-es.png') },
  { label: 'Français (France)', flag: require('../../assets/images/flag-fr.png') },
];

export default function TTSScreen() {
  const router = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadLang = async () => {
      const stored = await AsyncStorage.getItem('selectedLang');
      if (stored) setSelectedLang(JSON.parse(stored));
    };
    loadLang();
  }, []);

  const handleLangChange = async (item: any) => {
    setSelectedLang(item);
    await AsyncStorage.setItem('selectedLang', JSON.stringify(item));
    triggerHaptic();
    playClick();
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            playClick();
            router.back();
          }}
        >
          <Text style={styles.backText}>← Text-to-Speech</Text>
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/logo-header.png')}
          style={styles.logo}
        />
      </View>

      {/* Caixa de introdução de texto */}
      <View style={styles.textBox}>
        <TextInput
          style={styles.input}
          placeholder="Escreve aqui..."
          placeholderTextColor="#000"
          multiline
          editable
        />
      </View>

      {/* Idioma */}
      <View style={styles.section}>
        <Text style={styles.label}>Idioma</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            triggerHaptic();
            playClick();
            setModalVisible(true);
          }}
        >
          <Image source={selectedLang.flag} style={styles.flag} />
          <Text style={styles.dropdownText}>{selectedLang.label}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Velocidade */}
      <View style={styles.section}>
        <Text style={styles.label}>Velocidade</Text>
        <View style={styles.speedOptions}>
          {['0.5x', '0.75x', '1x', '1.25x', 'Personalizado'].map((label, idx) => (
            <TouchableOpacity key={idx} style={styles.speedButton}>
              <Text style={styles.speedText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botão Converter */}
      <TouchableOpacity style={styles.convertButton}>
        <Text style={styles.convertText}>Converter</Text>
      </TouchableOpacity>

      {/* Modal de seleção de idioma */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.langModal}>
            <Text style={styles.modalTitle}>Escolhe o idioma</Text>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.langOption, selectedLang.label === item.label && styles.selected]}
                  onPress={() => handleLangChange(item)}
                >
                  <Image source={item.flag} style={styles.flag} />
                  <Text style={styles.modalText}>{item.label}</Text>
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
    paddingHorizontal: 15,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  logo: {
    width: 110,
    height: 40,
    resizeMode: 'contain',
  },
  textBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 250,
    marginTop: 25,
    marginHorizontal: 20,
    padding: 12,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
    flex: 1,
  },
  section: {
    marginTop: 25,
    marginHorizontal: 20,
  },
  label: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
    fontSize: 14,
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
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
  },
  flag: {
    width: 22,
    height: 15,
    resizeMode: 'contain',
    marginRight: 10,
  },
  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  speedButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  speedText: {
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
  },
  convertButton: {
    backgroundColor: '#fff',
    marginTop: 30,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  convertText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#000',
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
  modalText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  selected: {
    backgroundColor: '#3c3c3c',
  },
});