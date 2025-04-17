import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, StatusBar, TouchableOpacity,
  Dimensions, LayoutAnimation, UIManager, Platform, ScrollView, Modal
} from 'react-native';
import Swiper from 'react-native-swiper';
import BottomNavBar from '../components/BottomNavBar';
import { useRouter } from 'expo-router';
import useHaptics from '../../utils/useHaptics';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Ativa animações em Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InfoScreen() {
  const router = useRouter();
  const triggerHaptic = useHaptics();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [termsVisible, setTermsVisible] = useState(false);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFaqOpen(faqOpen === index ? null : index);
    triggerHaptic();
  };

  const faqs = [
    {
      question: 'Como posso ativar o modo de alto contraste?',
      answer: 'Vai até às Definições > Tema Alto Contraste e escolhe a opção desejada.',
    },
    {
      question: 'A app suporta comandos por voz?',
      answer: 'Sim, podes ativar nas Definições > Comandos por Voz.',
    },
    {
      question: 'Como altero o idioma da app?',
      answer: 'Nas Definições, toca em Idioma e escolhe o teu idioma preferido.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { router.push('/home'); triggerHaptic(); }}>
          <Text style={styles.backText}>← Informações</Text>
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
      >
        {/* Slide 1 - Sobre */}
        <View style={styles.slide}>
          <Image
            source={require('../../assets/images/slide-about.png')}
            style={styles.slideImage}
          />
          <Text style={styles.title}>Sobre a VoxLink</Text>
          <Text style={styles.description}>
            A VoxLink é uma plataforma inclusiva que conecta utilizadores com diferentes necessidades a interfaces acessíveis.
          </Text>
        </View>

        {/* Slide 2 - Acessibilidade */}
        <View style={styles.slide}>
          <Image
            source={require('../../assets/images/slide-accessibility.png')}
            style={styles.slideImage}
          />
          <Text style={styles.title}>Acessibilidade</Text>
          <Text style={styles.description}>
            Ajustes de tema, texto, feedback tátil e muito mais para melhorar a usabilidade para todos os utilizadores.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => { router.push('/settings'); triggerHaptic(); }}>
            <MaterialIcons name="settings-accessibility" size={22} color="#000" />
            <Text style={styles.buttonText}>Ir para Definições</Text>
          </TouchableOpacity>
        </View>

        {/* Slide 3 - FAQ */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.faqSlideContent}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require('../../assets/images/slide-faq.png')}
              style={styles.slideImage}
            />
            <Text style={styles.title}>Perguntas Frequentes</Text>
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.faqItem, isOpen && styles.faqItemOpen]}
                  onPress={() => toggleFaq(index)}
                  activeOpacity={0.9}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <MaterialIcons
                      name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                      size={26}
                      color="#fff"
                    />
                  </View>
                  {isOpen && (
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>



        {/* Slide 4 - Contactos */}
        <View style={styles.slide}>
          <Image
            source={require('../../assets/images/slide-contact.png')}
            style={styles.slideImage}
          />
          <Text style={styles.title}>Contactos</Text>
          <Text style={styles.description}>
            Email: suporte@voxlink.app{"\n"}
            Site: www.voxlink.app
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setTermsVisible(true)}
          >
            <MaterialIcons name="description" size={22} color="#000" />
            <Text style={styles.buttonText}>Ver Termos e Condições</Text>
          </TouchableOpacity>

          <Modal
            visible={termsVisible}
            animationType="slide"
            onRequestClose={() => setTermsVisible(false)}
          >
            <View style={styles.modalContainer}>

              {/* Header fixo no topo */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setTermsVisible(false)}>
                  <Text style={styles.modalBack}>←</Text>
                </TouchableOpacity>
                <Image
                  source={require('../../assets/images/logo-header.png')}
                  style={styles.modalLogo}
                />
              </View>

              {/* Conteúdo scrollável abaixo do header */}
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalTitle}>Termos e Condições</Text>
                <Text style={styles.modalText}>
                  {`1. Aceitação dos Termos\n`}
                  <Text style={styles.modalSubTitle}>
                    Ao utilizar a aplicação VoxLink, concorda com os presentes Termos e Condições.
                  </Text>

                  {`\n\n2. Objetivo da Aplicação\n`}
                  <Text style={styles.modalSubTitle}>
                    A VoxLink visa fornecer uma experiência acessível e inclusiva a todos os utilizadores, com funcionalidades ajustadas a necessidades específicas.
                  </Text>

                  {`\n\n3. Utilização Responsável\n`}
                  <Text style={styles.modalSubTitle}>
                    O utilizador compromete-se a usar a aplicação de forma ética, respeitando os outros utilizadores e os recursos disponibilizados.
                  </Text>

                  {`\n\n4. Privacidade\n`}
                  <Text style={styles.modalSubTitle}>
                    Os dados fornecidos serão tratados com confidencialidade. Recolhemos apenas a informação necessária para melhorar a experiência da aplicação.
                  </Text>

                  {`\n\n5. Atualizações\n`}
                  <Text style={styles.modalSubTitle}>
                    Reservamo-nos o direito de alterar estes Termos a qualquer momento. Recomendamos que consulte esta secção regularmente.
                  </Text>

                  {`\n\n6. Contactos\n`}
                  <Text style={styles.modalSubTitle}>
                    Em caso de dúvidas, contacte-nos através do email suporte@voxlink.app.
                  </Text>

                  {`\n\nÚltima atualização: Abril de 2025.`}
                </Text>

                <TouchableOpacity
                  style={[styles.button, { alignSelf: 'center', marginTop: 30 }]}
                  onPress={() => setTermsVisible(false)}
                >
                  <Text style={styles.buttonText}>Fechar</Text>
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
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  slideScroll: {
    flex: 1,
  },
  slideImage: {
    width: width * 0.9,       
    height: height * 0.4,
    resizeMode: 'contain',
    marginBottom: 30,
    borderRadius: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: '#aaa',
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
  dot: {
    backgroundColor: '#666',
    width: 8,
    height: 8,
    marginBottom: 60,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    marginBottom: 60,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  pagination: {
    bottom: 15,
  },
  faqItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    width: '100%',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 10,
    lineHeight: 20,
  },
  faqItemOpen: {
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },  
  faqSlideContent: {
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 80,
    alignItems: 'center',
  },  
  modalContainer: {
    flex: 1,
    backgroundColor: '#191919',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#191919',
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 10,
    zIndex: 1,
  },
  
  modalBack: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
  },
  
  modalLogo: {
    width: 110,
    height: 40,
    resizeMode: 'contain',
  },
  
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  
  modalText: {
    color: '#aaa',
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 26,
    textAlign: 'justify',
  },
  
  modalSubTitle: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
  },  
});