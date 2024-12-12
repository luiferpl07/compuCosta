// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBOnDRq-qPP1mNLemUuebytGVbTf1o7g8A",
  authDomain: "prueba-5f0ca.firebaseapp.com",
  projectId: "prueba-5f0ca",
  storageBucket: "prueba-5f0ca.firebasestorage.app",
  messagingSenderId: "1077713453932",
  appId: "1:1077713453932:web:1e45d9770c48f4d893e949",
};

// Inicialización de Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();

// Configuración del proveedor de Google
export const googleProvider = new GoogleAuthProvider();
