import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase (REVISADA)
const firebaseConfig = {
  apiKey: "AIzaSyBOnDRq-qPP1mNLemUuebytGVbTf1o7g8A",
  authDomain: "prueba-5f0ca.firebaseapp.com",
  projectId: "prueba-5f0ca",
  storageBucket: "prueba-5f0ca.appspot.com", 
  messagingSenderId: "1077713453932",
  appId: "1:1077713453932:web:1e45d9770c48f4d893e949",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configuración del proveedor de Google
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
