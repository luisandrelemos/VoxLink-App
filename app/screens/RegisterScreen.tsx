import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  async function handleRegister() {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As passwords não coincidem!');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Erro no registo', error.message);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>És Novo? Cria uma Conta!</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#000"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#000"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Password"
              placeholderTextColor="#000"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Entypo name={showPassword ? 'eye-with-line' : 'eye'} size={22} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Confirmação Password"
              placeholderTextColor="#000"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Entypo name={showConfirmPassword ? 'eye-with-line' : 'eye'} size={22} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Criar Conta</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>VoxLink</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#191919',
  },
  container: {
    flex: 1,
  },
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
    padding: 12,
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
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: 'Montserrat-Regular',
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
    marginTop: 80,
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
  },
});
