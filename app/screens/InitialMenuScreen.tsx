import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function InitialMenuScreen() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    // Aqui depois vamos configurar o login Google
    alert('Login com Google ainda não implementado');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>VoxLink</Text>

      <TouchableOpacity style={styles.buttonOutline} onPress={() => router.push('/register')}>
        <Text style={styles.buttonOutlineText}>Criar Conta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
        <Image source={require('../../assets/images/google-icon.png')} style={styles.icon} />
        <Text style={styles.socialText}>Entrar Com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
        <Image source={require('../../assets/images/facebook-icon.png')} style={styles.icon} />
        <Text style={styles.socialText}>Entrar Com Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
        <Text style={styles.loginText}>Login</Text>
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
