import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  Switch, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Entypo } from '@expo/vector-icons';

// Importa o signIn e a config do Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';

// Se quiseres redirecionar ao login, podes usar expo-router
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stayConnected, setStayConnected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Sucesso!', 'Login efetuado com sucesso!');
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Erro no login', error.message);
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
          <Text style={styles.title}>Olá de Novo!</Text>

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
              <Entypo
                name={showPassword ? 'eye-with-line' : 'eye'}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.stayConnected}>
            <Text style={styles.stayConnectedText}>Ficar Conectado</Text>
            <Switch
              value={stayConnected}
              onValueChange={setStayConnected}
              thumbColor="#fff"
              trackColor={{ false: '#888', true: '#444' }}
            />
          </View>

          {/* Botão de Login que chama handleLogin */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          {/* Continuação do teu layout - forgot password, social logins, etc. */}
          {/* ... */}
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
    marginTop: 70,
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
  stayConnected: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  stayConnectedText: {
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
  },
  loginButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  forgotPassword: {
    color: '#aaa',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#555',
  },
  orText: {
    color: '#aaa',
    marginHorizontal: 8,
    fontFamily: 'Montserrat-Regular',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  socialText: {
    color: '#000',
    fontFamily: 'Montserrat-SemiBold',
  },
  footerText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
  },
});
