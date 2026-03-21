import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, indexedDBLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase (CORREGIDA)
const firebaseConfig = {
  apiKey: "AIzaSyCMVrKUQYobz2ZlVxL96Me9Hi55mH8Nd64",
  authDomain: "compucosta-99a19.firebaseapp.com",
  projectId: "compucosta-99a19", 
  storageBucket: "compucosta-99a19.appspot.com", 
  messagingSenderId: "588837052005",
  appId: "1:1077713453932:web:1e45d9770c48f4d893e949",
};

// Inicializar Firebase solo una vez
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Inicializar servicios
const auth = getAuth(app);

// Usar IndexedDB en lugar de localStorage para no exponer datos auth
setPersistence(auth, indexedDBLocalPersistence).catch(console.warn);

const db = getFirestore(app);
const storage = getStorage(app);

// Configuración optimizada del proveedor de Google
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configurar persistencia de autenticación
auth.useDeviceLanguage();

// Pre-cargar el SDK para reducir tiempo de primera carga
if (typeof window !== 'undefined') {
  // Forzar la inicialización del SDK en el siguiente tick
  setTimeout(() => {
    auth.authStateReady().catch(console.warn);
  }, 0);
}

export { app, auth, db, storage, googleProvider };