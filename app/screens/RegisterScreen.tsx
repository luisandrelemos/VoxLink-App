// app/screens/RegisterScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig';
import { useRouter } from 'expo-router';
import useHaptics from '../../utils/useHaptics';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);

  const router = useRouter();
  const triggerHaptic = useHaptics();

  async function handleRegister() {
    if (!acceptedTerms) {
      Alert.alert(t('register.termsTitle'), t('register.termsMessage'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('register.errorTitle'), t('register.passwordMismatch'));
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCred.user, { displayName: name });
      Alert.alert(t('register.successTitle'), t('register.successMessage'));
      router.replace('/usertypescreen');
    } catch (err: any) {
      Alert.alert(t('register.errorTitle'), err.message);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>{t('register.title')}</Text>

          <TextInput
            onFocus={triggerHaptic}
            style={styles.input}
            placeholder={t('register.namePlaceholder')}
            placeholderTextColor="#000"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            onFocus={triggerHaptic}
            style={styles.input}
            placeholder={t('register.emailPlaceholder')}
            placeholderTextColor="#000"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              onFocus={triggerHaptic}
              style={styles.inputPassword}
              placeholder={t('register.passwordPlaceholder')}
              placeholderTextColor="#000"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel={
                showPassword
                  ? t('register.hidePasswordLabel')
                  : t('register.showPasswordLabel')
              }
              style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => {
                setShowPassword(!showPassword);
                triggerHaptic();
              }}
            >
              <Entypo
                name={showPassword ? 'eye-with-line' : 'eye'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              onFocus={triggerHaptic}
              style={styles.inputPassword}
              placeholder={t('register.confirmPasswordPlaceholder')}
              placeholderTextColor="#000"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel={
                showConfirmPassword
                  ? t('register.hideConfirmPasswordLabel')
                  : t('register.showConfirmPasswordLabel')
              }
              style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => {
                setShowConfirmPassword(!showConfirmPassword);
                triggerHaptic();
              }}
            >
              <Entypo
                name={showConfirmPassword ? 'eye-with-line' : 'eye'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.termsRow}>
            <Switch
              value={acceptedTerms}
              onValueChange={(val) => {
                setAcceptedTerms(val);
                triggerHaptic();
              }}
              trackColor={{ false: '#555', true: '#ccc' }}
              thumbColor={acceptedTerms ? '#fff' : '#888'}
            />

            <Text style={styles.termsText}>
              {t('register.acceptTermsPrefix')}
            </Text>

            <TouchableOpacity
              accessible
              accessibilityRole="link"
              accessibilityLabel={t('register.termsLink')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.termsLinkContainer}
              onPress={() => {
                setTermsVisible(true);
                triggerHaptic();
              }}
            >
              <Text style={styles.termsLink}>
                {t('register.termsLink')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => {
              triggerHaptic();
              handleRegister();
            }}
          >
            <Text style={styles.registerButtonText}>
              {t('register.registerButton')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>{t('register.footer')}</Text>
        </ScrollView>

        <Modal
          visible={termsVisible}
          animationType="slide"
          onRequestClose={() => setTermsVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic();
                  setTermsVisible(false);
                }}
              >
                <Text style={styles.modalBack}>
                  {t('register.modalBack')}
                </Text>
              </TouchableOpacity>
              <Image
                source={require('../../assets/images/logo-header.png')}
                style={styles.modalLogo}
              />
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {t('register.termsAndConditions')}
              </Text>
              <Text style={styles.modalText}>
                {t('register.modalText')}
              </Text>
              <TouchableOpacity
                style={[styles.registerButton, { marginTop: 30 }]}
                onPress={() => {
                  triggerHaptic();
                  setTermsVisible(false);
                }}
              >
                <Text style={styles.registerButtonText}>
                  {t('register.modalClose')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#191919' },
  container: { flex: 1 },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 30,
    marginBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  passwordContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    height: 48,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 12,
    height: '100%',
    fontFamily: 'Montserrat-Regular',
  },
  termsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsText: {
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
    marginLeft: 8,
  },
  termsLinkContainer: {
    minHeight: 48,
    justifyContent: 'center',
    marginLeft: 4,
  },
  termsLink: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  registerButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  footerText: {
    marginTop: 30,
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
  },
  modalContainer: { flex: 1, backgroundColor: '#191919' },
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
});
