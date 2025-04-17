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

export default function STTScreen() {
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
          <Text style={styles.backText}>← Speech-to-Text</Text>
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/logo-header.png')}
          style={styles.logo}
        />
      </View>

      {/* Caixa de transcrição */}
      <View style={styles.textBox}>
        <TextInput
          style={styles.input}
          placeholder="Fala aqui..."
          placeholderTextColor="#000"
          multiline
          editable={false}
          value="Olá, onde fica a estação mais próxima ?"
        />
        <TouchableOpacity style={styles.copyIcon}>
          <MaterialIcons name="content-copy" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Dropdown + Microfone */}
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.dropdown} onPress={() => { playClick(); triggerHaptic(); setModalVisible(true); }}>
          <Image source={selectedLang.flag} style={styles.dropdownIcon} />
          <Text style={styles.dropdownText}>{selectedLang.label}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.micButton}>
          <Image
            source={require('../../assets/images/mic-icon.png')}
            style={styles.micIcon}
          />
        </TouchableOpacity>
      </View>

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
                  <Image source={item.flag} style={styles.dropdownIcon} />
                  <Text style={styles.modalOptionText}>{item.label}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#191919',
  },
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
    position: 'relative',
  },
  input: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#000',
    flex: 1,
  },
  copyIcon: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  bottomArea: {
    marginTop: 120,
    alignItems: 'center',
    gap: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#000',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    marginLeft: 10,
  },
  modalOptionText: {
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    marginLeft: 10,
  },
  dropdownIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  micButton: {
    alignSelf: 'center',
  },
  micIcon: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
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