import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#191919' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar backgroundColor="#191919" barStyle="light-content" />

          <View style={styles.container}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.title}>És Novo? Cria uma Conta!</Text>

            <TextInput placeholder="Nome" placeholderTextColor="#999" style={styles.input} />
            <TextInput placeholder="Email" placeholderTextColor="#999" style={styles.input} keyboardType="email-address" />

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                style={styles.inputInside}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#ccc" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Confirmação Password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                style={styles.inputInside}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#ccc" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footerContainer}>
          <Text style={styles.footer}>VoxLink</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  container: {
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#2b2b2b',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'Montserrat-SemiBold',
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#2b2b2b',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputInside: {
    flex: 1,
    paddingVertical: 12,
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
  },
  createButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    marginTop: 10,
  },
  createButtonText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footer: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
  },
});
