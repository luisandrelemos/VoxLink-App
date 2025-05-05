import React, { useState } from 'react';
import {
  View, StyleSheet, Image, StatusBar, TouchableOpacity,
  Dimensions, LayoutAnimation, UIManager, Platform,
  ScrollView, Modal
} from 'react-native';
import Swiper from 'react-native-swiper';
import BottomNavBar from '../components/BottomNavBar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import useHaptics from '../../utils/useHaptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useSound } from '../../context/SoundContext';
import ScaledText from '../components/ScaledText';

const { width, height } = Dimensions.get('window');

// Ativa animações no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InfoScreen() {
  const { t }          = useTranslation();
  const router         = useRouter();
  const triggerHaptic  = useHaptics();
  const { playClick }  = useSound();

  const [faqOpen, setFaqOpen]         = useState<number | null>(null);
  const [termsVisible, setTermsVisible] = useState(false);

  const toggleFaq = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFaqOpen(faqOpen === i ? null : i);
    triggerHaptic(); playClick();
  };

  const faqs = [
    {
      q: t('info.faq1.q'),
      a: t('info.faq1.a'),
    },
    {
      q: t('info.faq2.q'),
      a: t('info.faq2.a'),
    },
    {
      q: t('info.faq3.q'),
      a: t('info.faq3.a'),
    },
  ];

  const onPress = (cb: ()=>void) => {
    triggerHaptic(); playClick(); cb();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>onPress(()=>router.push('/home'))}>
          <ScaledText base={16} style={styles.backText}>
            ← {t('info.back')}
          </ScaledText>
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
        {/* Slide 1: Sobre */}
        <View style={styles.slide}>
          <Image source={require('../../assets/images/slide-about.png')} style={styles.slideImage} />
          <ScaledText base={22} style={styles.title}>{t('info.about.title')}</ScaledText>
          <ScaledText base={16} style={styles.description}>{t('info.about.desc')}</ScaledText>
        </View>

        {/* Slide 2: Acessibilidade */}
        <View style={styles.slide}>
          <Image source={require('../../assets/images/slide-accessibility.png')} style={styles.slideImage} />
          <ScaledText base={22} style={styles.title}>{t('info.accessibility.title')}</ScaledText>
          <ScaledText base={16} style={styles.description}>{t('info.accessibility.desc')}</ScaledText>
          <TouchableOpacity
            style={styles.button}
            onPress={()=>onPress(()=>router.push('/settings'))}
          >
            <MaterialIcons name="settings-accessibility" size={22} color="#000" />
            <ScaledText base={16} style={styles.buttonText}>
              {t('info.accessibility.btn')}
            </ScaledText>
          </TouchableOpacity>
        </View>

        {/* Slide 3: FAQ */}
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.faqSlideContent} showsVerticalScrollIndicator={false}>
            <Image source={require('../../assets/images/slide-faq.png')} style={styles.slideImage} />
            <ScaledText base={22} style={styles.title}>{t('info.faqTitle')}</ScaledText>

            {faqs.map((f, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.faqItem, faqOpen === i && styles.faqItemOpen]}
                onPress={()=>toggleFaq(i)}
                activeOpacity={0.9}
              >
                <View style={styles.faqHeader}>
                  <ScaledText base={16} style={styles.faqQuestion}>{f.q}</ScaledText>
                  <MaterialIcons
                    name={faqOpen === i ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={26}
                    color="#fff"
                  />
                </View>
                {faqOpen === i && (
                  <ScaledText base={14} style={styles.faqAnswer}>{f.a}</ScaledText>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Slide 4: Contactos */}
        <View style={styles.slide}>
          <Image source={require('../../assets/images/slide-contact.png')} style={styles.slideImage} />
          <ScaledText base={22} style={styles.title}>{t('info.contacts.title')}</ScaledText>
          <ScaledText base={16} style={styles.description}>
            {t('info.contacts.email')}{"\n"}{t('info.contacts.site')}
          </ScaledText>
          <TouchableOpacity
            style={styles.button}
            onPress={()=>{ triggerHaptic(); playClick(); setTermsVisible(true); }}
          >
            <MaterialIcons name="description" size={22} color="#000" />
            <ScaledText base={16} style={styles.buttonText}>
              {t('info.contacts.termsBtn')}
            </ScaledText>
          </TouchableOpacity>

          {/* Modal Termos */}
          <Modal
            visible={termsVisible}
            animationType="slide"
            onRequestClose={()=>setTermsVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={()=>{ triggerHaptic(); playClick(); setTermsVisible(false); }}>
                  <ScaledText base={28} style={styles.modalBack}>←</ScaledText>
                </TouchableOpacity>
                <Image source={require('../../assets/images/logo-header.png')} style={styles.modalLogo} />
              </View>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <ScaledText base={24} style={styles.modalTitle}>{t('info.terms.title')}</ScaledText>
                <ScaledText base={15} style={styles.modalText}>
                  {t('info.terms.p1') + '\n\n'}
                  <ScaledText base={15} style={styles.modalSubTitle}>{t('info.terms.p1_1')}</ScaledText>
                  {'\n\n' + t('info.terms.p2') + '\n\n'}
                  <ScaledText base={15} style={styles.modalSubTitle}>{t('info.terms.p2_1')}</ScaledText>
                  {'\n\n' + t('info.terms.p3') + '\n\n'}
                  <ScaledText base={15} style={styles.modalSubTitle}>{t('info.terms.p3_1')}</ScaledText>
                  {'\n\n' + t('info.terms.p4') + '\n\n'}
                  <ScaledText base={15} style={styles.modalSubTitle}>{t('info.terms.p4_1')}</ScaledText>
                  {'\n\n' + t('info.terms.p5') + '\n\n'}
                  <ScaledText base={15} style={styles.modalSubTitle}>{t('info.terms.p5_1')}</ScaledText>
                  {'\n\n' + t('info.terms.p6') + '\n\n'}
                  <ScaledText base={15} style={styles.modalSubTitle}>{t('info.terms.p6_1')}</ScaledText>
                  {'\n\n' + t('info.terms.updated')}
                </ScaledText>
                <TouchableOpacity
                  style={[styles.button, { alignSelf: 'center', marginTop: 30 }]}
                  onPress={()=>{ triggerHaptic(); playClick(); setTermsVisible(false); }}
                >
                  <ScaledText base={16} style={styles.buttonText}>
                    {t('info.terms.close')}
                  </ScaledText>
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