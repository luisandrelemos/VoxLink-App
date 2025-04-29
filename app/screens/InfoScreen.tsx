import React, { useState } from 'react';
import {
  View, StyleSheet, Image, StatusBar, TouchableOpacity,
  Dimensions, LayoutAnimation, UIManager, Platform,
  ScrollView, Modal
} from 'react-native';
import Swiper from 'react-native-swiper';
import BottomNavBar from '../components/BottomNavBar';
import { useRouter } from 'expo-router';
import useHaptics from '../../utils/useHaptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useSound } from '../../context/SoundContext';
import ScaledText from '../components/ScaledText';

const { width, height } = Dimensions.get('window');

/* Ativa animações no Android */
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InfoScreen() {
  const router        = useRouter();
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

  const [faqOpen, setFaqOpen]     = useState<number | null>(null);
  const [termsVisible, setTermsVisible] = useState(false);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFaqOpen(faqOpen === index ? null : index);
    triggerHaptic();
    playClick();
  };

  const faqs = [
    { question: 'Como posso alterar o tamanho do texto?', answer: 'Vai até às Definições > Tamanho Do Texto e altere para a opção desejada.' },
    { question: 'A app suporta comandos por voz?',             answer: 'Sim, podes ativar nas Definições > Comandos por Voz.' },
    { question: 'Como altero o idioma da app?',                answer: 'Nas Definições, toca em Idioma e escolhe o teu idioma preferido.' },
  ];

  /* ─────────── UI ─────────── */
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { router.push('/home'); triggerHaptic(); playClick(); }}>
          <ScaledText base={16} style={styles.backText}>← Informações</ScaledText>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />
      </View>

      {/* Swiper */}
      <Swiper
        loop={false}
        showsPagination
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        paginationStyle={styles.pagination}
        onIndexChanged={triggerHaptic}
      >

        {/* Slide 1 - Sobre */}
        <View style={styles.slide}>
          <Image source={require('../../assets/images/slide-about.png')} style={styles.slideImage} />
          <ScaledText base={22} style={styles.title}>Sobre a VoxLink</ScaledText>
          <ScaledText base={16} style={styles.description}>
            A VoxLink é uma plataforma inclusiva que conecta utilizadores com diferentes necessidades a interfaces acessíveis.
          </ScaledText>
        </View>

        {/* Slide 2 - Acessibilidade */}
        <View style={styles.slide}>
          <Image source={require('../../assets/images/slide-accessibility.png')} style={styles.slideImage} />
          <ScaledText base={22} style={styles.title}>Acessibilidade</ScaledText>
          <ScaledText base={16} style={styles.description}>
            Ajustes de tema, texto, feedback tátil e muito mais para melhorar a usabilidade para todos os utilizadores.
          </ScaledText>

          <TouchableOpacity style={styles.button} onPress={() => { router.push('/settings'); triggerHaptic(); playClick(); }}>
            <MaterialIcons name="settings-accessibility" size={22} color="#000" />
            <ScaledText base={16} style={styles.buttonText}>Ir para Definições</ScaledText>
          </TouchableOpacity>
        </View>

        {/* Slide 3 - FAQ */}
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.faqSlideContent} showsVerticalScrollIndicator={false}>
            <Image source={require('../../assets/images/slide-faq.png')} style={styles.slideImage} />
            <ScaledText base={22} style={styles.title}>Perguntas Frequentes</ScaledText>

            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  style={[styles.faqItem, isOpen && styles.faqItemOpen]}
                  onPress={() => toggleFaq(index)}
                >
                  <View style={styles.faqHeader}>
                    <ScaledText base={16} style={styles.faqQuestion}>{faq.question}</ScaledText>
                    <MaterialIcons
                      name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={26}
                      color="#fff"
                    />
                  </View>
                  {isOpen && (
                    <ScaledText base={14} style={styles.faqAnswer}>{faq.answer}</ScaledText>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Slide 4 - Contactos */}
        <View style={styles.slide}>
          <Image source={require('../../assets/images/slide-contact.png')} style={styles.slideImage} />
          <ScaledText base={22} style={styles.title}>Contactos</ScaledText>
          <ScaledText base={16} style={styles.description}>
            Email: suporte@voxlink.app{"\n"}Site: www.voxlink.app
          </ScaledText>

          <TouchableOpacity
            style={styles.button}
            onPress={() => { triggerHaptic(); playClick(); setTermsVisible(true); }}
          >
            <MaterialIcons name="description" size={22} color="#000" />
            <ScaledText base={16} style={styles.buttonText}>Ver Termos e Condições</ScaledText>
          </TouchableOpacity>

          {/* Modal Termos */}
          <Modal visible={termsVisible} animationType="slide" onRequestClose={() => setTermsVisible(false)}>
            <View style={styles.modalContainer}>

              {/* Header do modal */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => { triggerHaptic(); playClick(); setTermsVisible(false); }}>
                  <ScaledText base={28} style={styles.modalBack}>←</ScaledText>
                </TouchableOpacity>
                <Image source={require('../../assets/images/logo-header.png')} style={styles.modalLogo} />
              </View>

              {/* Conteúdo */}
              <ScrollView contentContainerStyle={styles.modalContent}>
                <ScaledText base={24} style={styles.modalTitle}>Termos e Condições</ScaledText>

                <ScaledText base={15} style={styles.modalText}>
                  {`1. Aceitação dos Termos\n`}
                  <ScaledText base={15} style={styles.modalSubTitle}>
                    Ao utilizar a aplicação VoxLink, concorda com os presentes Termos e Condições.
                  </ScaledText>

                  {`\n\n2. Objetivo da Aplicação\n`}
                  <ScaledText base={15} style={styles.modalSubTitle}>
                    A VoxLink visa fornecer uma experiência acessível e inclusiva a todos os utilizadores, com funcionalidades ajustadas a necessidades específicas.
                  </ScaledText>

                  {`\n\n3. Utilização Responsável\n`}
                  <ScaledText base={15} style={styles.modalSubTitle}>
                    O utilizador compromete-se a usar a aplicação de forma ética, respeitando os outros utilizadores e os recursos disponibilizados.
                  </ScaledText>

                  {`\n\n4. Privacidade\n`}
                  <ScaledText base={15} style={styles.modalSubTitle}>
                    Os dados fornecidos serão tratados com confidencialidade. Recolhemos apenas a informação necessária para melhorar a experiência da aplicação.
                  </ScaledText>

                  {`\n\n5. Atualizações\n`}
                  <ScaledText base={15} style={styles.modalSubTitle}>
                    Reservamo-nos o direito de alterar estes Termos a qualquer momento. Recomendamos que consulte esta secção regularmente.
                  </ScaledText>

                  {`\n\n6. Contactos\n`}
                  <ScaledText base={15} style={styles.modalSubTitle}>
                    Em caso de dúvidas, contacte-nos através do email suporte@voxlink.app.
                  </ScaledText>

                  {`\n\nÚltima atualização: Abril de 2025.`}
                </ScaledText>

                <TouchableOpacity
                  style={[styles.button, { alignSelf: 'center', marginTop: 30 }]}
                  onPress={() => { triggerHaptic(); playClick(); setTermsVisible(false); }}
                >
                  <ScaledText base={16} style={styles.buttonText}>Fechar</ScaledText>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Modal>
        </View>
      </Swiper>

      <BottomNavBar />
    </View>
  );
}

/* ─────────── estilos ─────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191919' },

  /* topo */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
  backText: { color: '#fff', fontFamily: 'Montserrat-SemiBold' },
  logo: { width: 110, height: 40, resizeMode: 'contain' },

  /* slides */
  slide: { flex: 1, alignItems: 'center', paddingHorizontal: 30, paddingTop: 60 },
  slideImage: { width: width * 0.9, height: height * 0.4, resizeMode: 'contain', marginBottom: 30, borderRadius: 20 },
  title: { color: '#fff', fontFamily: 'Montserrat-Bold', textAlign: 'center', marginBottom: 10 },
  description: { color: '#aaa', fontFamily: 'Montserrat-Regular', textAlign: 'center', lineHeight: 24 },

  /* botões */
  button: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 30, alignItems: 'center', gap: 10 },
  buttonText: { color: '#000', fontFamily: 'Montserrat-Bold' },

  /* Swiper dots */
  dot: { backgroundColor: '#666', width: 8, height: 8, marginBottom: 60, borderRadius: 4, marginHorizontal: 4 },
  activeDot: { backgroundColor: '#fff', width: 10, height: 10, marginBottom: 60, borderRadius: 5, marginHorizontal: 4 },
  pagination: { bottom: 15 },

  /* FAQ */
  faqSlideContent: { paddingHorizontal: 30, paddingTop: 50, paddingBottom: 80, alignItems: 'center' },
  faqItem: { backgroundColor: '#2a2a2a', borderRadius: 8, padding: 15, marginVertical: 8, width: '100%' },
  faqItemOpen: { backgroundColor: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { color: '#fff', fontFamily: 'Montserrat-Bold', flex: 1, marginRight: 10 },
  faqAnswer: { color: '#ccc', fontFamily: 'Montserrat-Regular', marginTop: 10, lineHeight: 20 },

  /* Modal */
  modalContainer: { flex: 1, backgroundColor: '#191919' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#191919', paddingTop: 10, paddingHorizontal: 15, paddingBottom: 10 },
  modalBack: { color: '#fff', fontFamily: 'Montserrat-Bold' },
  modalLogo: { width: 110, height: 40, resizeMode: 'contain' },
  modalContent: { paddingHorizontal: 20, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontFamily: 'Montserrat-Bold', textAlign: 'center', marginBottom: 20, marginTop: 10 },
  modalText: { color: '#aaa', fontFamily: 'Montserrat-Regular', lineHeight: 26, textAlign: 'justify' },
  modalSubTitle: { color: '#fff', fontFamily: 'Montserrat-SemiBold' },
});