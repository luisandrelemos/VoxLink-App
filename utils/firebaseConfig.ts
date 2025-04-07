// app/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDlUf5sL-JuKj72aaA7BLvLglj3msYS53E",
    authDomain: "voxlink-e00bb.firebaseapp.com",
    projectId: "voxlink-e00bb",
    storageBucket: "voxlink-e00bb.firebasestorage.app",
    messagingSenderId: "838044936912",
    appId: "1:838044936912:web:c2cc2251d7d85c7393ccd5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
