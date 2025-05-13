// app/screens/LoginScreen.tsx

import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  StyleSheet,
} from 'react-native'
import { Entypo } from '@expo/vector-icons'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../utils/firebaseConfig'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import useHaptics from '../../utils/useHaptics'
import { useTranslation } from 'react-i18next'

export default function LoginScreen() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stayConnected, setStayConnected] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const triggerHaptic = useHaptics()

  useEffect(() => {
    async function checkStayConnected() {
      const flag = await AsyncStorage.getItem('stayConnected')
      onAuthStateChanged(auth, user => {
        if (user && flag === 'true') {
          router.replace('/home')
        }
      })
    }
    checkStayConnected()
  }, [])

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      if (stayConnected) {
        await AsyncStorage.setItem('stayConnected', 'true')
      } else {
        await AsyncStorage.removeItem('stayConnected')
      }
      Alert.alert(t('login.successTitle'), t('login.successMessage'))
      router.replace('/home')
    } catch (err: any) {
      Alert.alert(t('login.errorTitle'), err.message)
    }
  }

  const handleSocial = (provider: 'Google' | 'Facebook') => {
    triggerHaptic()
    Alert.alert(
      t('login.notImplementedTitle'),
      t('login.notImplemented', { provider })
    )
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
          <Text style={styles.title}>{t('login.title')}</Text>

          {/* Email */}
          <TextInput
            onFocus={triggerHaptic}
            style={styles.input}
            placeholder={t('login.emailPlaceholder')}
            placeholderTextColor="#000"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Password */}
          <View style={styles.passwordContainer}>
            <TextInput
              onFocus={triggerHaptic}
              style={styles.inputPassword}
              placeholder={t('login.passwordPlaceholder')}
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
                  ? t('login.hidePasswordLabel')
                  : t('login.showPasswordLabel')
              }
              style={styles.passwordToggle}
              onPress={() => {
                setShowPassword(!showPassword)
                triggerHaptic()
              }}
            >
              <Entypo
                name={showPassword ? 'eye-with-line' : 'eye'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Stay connected */}
          <View style={styles.stayConnectedRow}>
            <Text style={styles.stayConnectedText}>
              {t('login.stayConnected')}
            </Text>
            <View style={styles.switchContainer}>
              <Switch
                accessible
                accessibilityRole="checkbox"
                accessibilityLabel={t('login.stayConnectedLabel')}
                accessibilityState={{ checked: stayConnected }}
                value={stayConnected}
                onValueChange={val => {
                  setStayConnected(val)
                  triggerHaptic()
                }}
                thumbColor="#fff"
                trackColor={{ false: '#888', true: '#444' }}
              />
            </View>
          </View>

          {/* Entrar */}
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('login.loginButton')}
            style={styles.loginButton}
            onPress={() => {
              triggerHaptic()
              handleLogin()
            }}
          >
            <Text style={styles.loginButtonText}>
              {t('login.loginButton')}
            </Text>
          </TouchableOpacity>

          {/* Esqueceu-se da Password? */}
          <TouchableOpacity
            accessible
            accessibilityRole="link"
            accessibilityLabel={t('login.forgotPassword')}
            style={styles.forgotPasswordTouchable}
            onPress={() => {
              triggerHaptic()
            }}
          >
            <Text style={styles.forgotPassword}>
              {t('login.forgotPassword')}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>{t('login.or')}</Text>
            <View style={styles.line} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('login.loginWithGoogle')}
              style={styles.socialButton}
              onPress={() => handleSocial('Google')}
            >
              <Image
                source={require('../../assets/images/google-icon.png')}
                style={styles.icon}
              />
              <Text style={styles.socialText}>{t('login.google')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('login.loginWithFacebook')}
              style={styles.socialButton}
              onPress={() => handleSocial('Facebook')}
            >
              <Image
                source={require('../../assets/images/facebook-icon.png')}
                style={styles.icon}
              />
              <Text style={styles.socialText}>{t('login.facebook')}</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>{t('login.footer')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#191919' },
  container: { flex: 1 },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
    alignItems: 'center',
    marginTop: 30,
  },
  logo: {
    width: 100, height: 100, resizeMode: 'contain',
    marginTop: 30, marginBottom: 15,
  },
  title: {
    color: '#fff', fontSize: 22, fontFamily: 'Montserrat-Bold',
    marginBottom: 25,
  },
  input: {
    width: '100%', backgroundColor: '#fff', borderRadius: 8,
    height: 48, paddingHorizontal: 12, marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  passwordContainer: {
    width: '100%', backgroundColor: '#fff', borderRadius: 8,
    flexDirection: 'row', alignItems: 'center',
    height: 48, marginBottom: 15,
  },
  inputPassword: {
    flex: 1, height: '100%', paddingHorizontal: 12,
    fontFamily: 'Montserrat-Regular',
  },
  passwordToggle: {
    width: 48, height: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  stayConnectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', marginBottom: 20,
  },
  stayConnectedText: {
    color: '#fff', fontFamily: 'Montserrat-Regular',
  },
  switchContainer: {
    width: 48, height: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  loginButton: {
    width: '100%', borderWidth: 2, borderColor: '#fff',
    height: 48, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold',
  },
  forgotPasswordTouchable: {
    width: '100%', height: 48,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
  },
  forgotPassword: {
    color: '#aaa', fontSize: 13, fontFamily: 'Montserrat-Regular',
  },
  dividerContainer: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', marginBottom: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: '#555' },
  orText: { color: '#aaa', marginHorizontal: 8, fontFamily: 'Montserrat-Regular' },
  socialButtons: {
    flexDirection: 'row', width: '100%', marginBottom: 20,
  },
  socialButton: {
    flex: 1, height: 48, backgroundColor: '#fff',
    borderRadius: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 4,
  },
  icon: { width: 20, height: 20, marginRight: 6 },
  socialText: { color: '#000', fontFamily: 'Montserrat-SemiBold' },
  footerText: {
    marginTop: 20, color: '#fff',
    fontSize: 24, fontFamily: 'Montserrat-SemiBold',
  },
})
