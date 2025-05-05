import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import useHaptics from '../../utils/useHaptics';

export default function InitialMenuScreen() {
  const router        = useRouter();
  const triggerHaptic = useHaptics();
  const { t }         = useTranslation();

  const handleGoogleLogin = () => {
    triggerHaptic();
    alert(t('initial.alertGoogle'));
  };

  const handleFacebookLogin = () => {
    triggerHaptic();
    alert(t('initial.alertFacebook'));
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>{t('initial.title')}</Text>

      <TouchableOpacity
        style={styles.buttonOutline}
        onPress={() => {
          triggerHaptic();
          router.push('/register');
        }}
      >
        <Text style={styles.buttonOutlineText}>
          {t('initial.createAccount')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
        <Image source={require('../../assets/images/google-icon.png')} style={styles.icon} />
        <Text style={styles.socialText}>{t('initial.googleLogin')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
        <Image source={require('../../assets/images/facebook-icon.png')} style={styles.icon} />
        <Text style={styles.socialText}>{t('initial.facebookLogin')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => {
          triggerHaptic();
          router.push('/login');
        }}
      >
        <Text style={styles.loginText}>{t('initial.login')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191919',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#fff',
    marginBottom: 30,
  },
  buttonOutline: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    marginBottom: 12,
  },
  buttonOutlineText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  socialButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialText: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    marginTop: 12,
  },
  loginText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});