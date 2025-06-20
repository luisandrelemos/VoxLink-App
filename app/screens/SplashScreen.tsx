import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkStayConnected = async () => {
      const stayConnected = await AsyncStorage.getItem('@stayConnected');
      setTimeout(() => {
        if (stayConnected === 'true') {
          router.replace('/home');
        } else {
          router.replace('/initialmenuscreen');
        }
      }, 2000); // splash delay
    };

    checkStayConnected();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Força a status bar com fundo escuro e ícones claros */}
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      <View style={styles.centerContent}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
      </View>
      <Text style={styles.text}>VoxLink</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191919',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
  },
});