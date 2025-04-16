// app/utils/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "voxlink-8ce17.firebaseapp.com",
  projectId: "voxlink-8ce17",
  storageBucket: "voxlink-8ce17.firebasestorage.app",
  messagingSenderId: "847261915494",
  appId: "1:847261915494:web:99da7ad0954546eebdd0a7"
};

// Inicializa a App Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Auth com persistência local
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
})