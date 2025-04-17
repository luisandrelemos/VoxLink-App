import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import useHaptics from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';

type LanguageOption = {
  label: string;
  flag: any;
};

const languages: LanguageOption[] = [
  { label: 'Português (Portugal)', flag: require('../../assets/images/flag-pt.png') },
  { label: 'English (US)', flag: require('../../assets/images/flag-en.png') },
  { label: 'Español (España)', flag: require('../../assets/images/flag-es.png') },
  { label: 'Français (France)', flag: require('../../assets/images/flag-fr.png') },
];

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
  const router = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState('1x');
  const [inputText, setInputText] = useState('');

  const handleLangChange = (item: LanguageOption) => {
    setSelectedLang(item);
    triggerHaptic();
    playClick();
    setModalVisible(false);
  };

  const handleSpeedSelect = (label: string) => {
    triggerHaptic();
    playClick();
    setSelectedSpeed(label);
  };

  const handleQuickMessage = (message: string) => {
    triggerHaptic();
    playClick();
    setInputText(message.replace(/\n/g, ' '));
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { triggerHaptic(); playClick(); router.back(); }}>
          <Text style={styles.backText}>← Comunicação Rápida</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />
      </View>

      {/* Grelha de Mensagens Rápidas */}
      <View style={styles.grid}>
        {quickMessages.map((msg, idx) => (
          <TouchableOpacity key={idx} style={styles.gridItem} onPress={() => handleQuickMessage(msg)}>
            <Text style={styles.gridText}>{msg}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Escrita Livre */}
      <View style={styles.section}>
        <Text style={styles.label}>Escrita Livre</Text>
        <TextInput
          style={styles.textBox}
          placeholder="Escrever Aqui"
          placeholderTextColor="#aaa"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.listenButton}>
          <Text style={styles.listenText}>Ouvir</Text>
        </TouchableOpacity>
      </View>

      {/* Idioma */}
      <View style={styles.section}>
        <Text style={styles.label}>Idioma</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => { triggerHaptic(); playClick(); setModalVisible(true); }}>
          <Image source={selectedLang.flag} style={styles.flag} />
          <Text style={styles.dropdownText}>{selectedLang.label}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Velocidade */}
      <View style={styles.section}>
        <Text style={styles.label}>Velocidade</Text>
        <View style={styles.speedOptions}>
          {['0.5x', '0.75x', '1x', '1.25x', '+'].map((label, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.speedButton,
                selectedSpeed === label && styles.speedButtonActive
              ]}
              onPress={() => handleSpeedSelect(label)}
            >
              <Text
                style={[
                  styles.speedText,
                  selectedSpeed === label && styles.speedTextActive
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Modal Idioma */}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    marginHorizontal: 15,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 7,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
    color: '#000',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  label: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
    fontSize: 16,
  },
  textBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  listenButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  listenText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
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
    flex: 1,
    marginLeft: 10,
  },
  flag: {
    width: 22,
    height: 15,
    resizeMode: 'contain',
  },
  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  speedButtonActive: {
    backgroundColor: '#fff',
  },
  speedText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
  },
  speedTextActive: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
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
    marginLeft: 10,
  },
  selected: {
    backgroundColor: '#3c3c3c',
  },
});