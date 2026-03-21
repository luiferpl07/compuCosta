import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { UserType, LoginData, RegistrationData, AuthError } from "../../type";
import { getUserData, saveUserData } from "../services/userService";
import { handleFirebaseError } from "../../utils/authErrors";

interface AuthContextType {
  currentUser: UserType | null;
  loading: boolean;
  authLoading: boolean;
  error: AuthError | null;
  register: (data: RegistrationData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};

// Cache optimizado con TTL
const userCache = new Map<string, { data: UserType; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Pre-configurar el provider de Google para máxima velocidad
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Optimizaciones adicionales para velocidad
  include_granted_scopes: 'true',
  access_type: 'online'
});

// Pre-calentar la conexión a Google
const preWarmGoogleConnection = () => {
  // Crear una imagen invisible que pre-conecta a los dominios de Google
  const img = new Image();
  img.src = 'https://accounts.google.com/favicon.ico';
  
  // Pre-resolver DNS de Google Auth
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = '//accounts.google.com';
  document.head.appendChild(link);
};

// Ejecutar pre-calentamiento inmediatamente
preWarmGoogleConnection();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Cache optimizado con TTL
  const getUserFromCache = useCallback((userId: string): UserType | null => {
    const cached = userCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      userCache.delete(userId); // Limpiar cache expirado
    }
    return null;
  }, []);

  const setUserInCache = useCallback((userId: string, userData: UserType) => {
    userCache.set(userId, { data: userData, timestamp: Date.now() });
  }, []);

  const clearUserCache = useCallback(() => {
    userCache.clear();
  }, []);

  const createFallbackUser = useCallback((user: FirebaseUser): UserType => {
    const displayName = user.displayName || "";
    const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
    
    return {
      uid: user.uid,
      email: user.email || "",
      firstName: nameParts[0] || "Usuario",
      lastName: nameParts.slice(1).join(" ") || "",
      avatar: user.photoURL || undefined,
      createdAt: new Date().toISOString(),
    };
  }, []);

  // VERSIÓN ULTRA OPTIMIZADA: No bloqueante para TODO tipo de login
  const handleAuthenticatedUserInstant = useCallback(async (user: FirebaseUser, isNewLogin = false) => {
    const userId = user.uid;
    
    // 1. CACHE EN MEMORIA (instantáneo)
    const cachedUser = getUserFromCache(userId);
    if (cachedUser) {
      setCurrentUser(cachedUser);
      return;
    }

    // 2. CREAR USUARIO INMEDIATAMENTE (Placeholder veloz con los datos base de Firebase Auth)
    const instantUser = createFallbackUser(user);
    setCurrentUser(instantUser);     // Desbloquea la UI inmediatamente
    setUserInCache(userId, instantUser);
    
    // 3. OBTENER DE FIRESTORE EN BACKGROUND SIN BLOQUEAR
    setTimeout(async () => {
      try {
        const realUserData = await getUserData(userId);
        if (realUserData) {
          // Si hay datos en Firestore y son distintos a los básicos, actualizar silenciosamente
          if (JSON.stringify(realUserData) !== JSON.stringify(instantUser)) {
             setCurrentUser(realUserData);
             setUserInCache(userId, realUserData);
          }
        } else if (isNewLogin) {
          // Si no está registrado en Firestore (ej: Primer login Google), lo guardamos
          await saveUserData(instantUser);
        }
      } catch (error) {
        console.error("Error silencioso en actualización background:", error);
      }
    }, 0);

  }, [getUserFromCache, setUserInCache, createFallbackUser]);

  const handleUnauthenticatedUser = useCallback(async () => {
    setCurrentUser(null);
    clearUserCache();
  }, [clearUserCache]);

  // Auth state listener optimizado
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        await auth.authStateReady();
        
        if (!mounted) return;

        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
          if (!mounted) return;
          
          try {
            if (user) {
              // NO marcamos como Google login aquí para mantener compatibilidad
              await handleAuthenticatedUserInstant(user, false);
            } else {
              await handleUnauthenticatedUser();
            }
          } catch (error) {
            console.error("Error en onAuthStateChanged:", error);
            setError(handleFirebaseError(error));
          } finally {
            if (mounted) {
              setLoading(false);
              setIsInitialized(true);
            }
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error inicializando AuthProvider:", error);
        if (mounted) {
          setError(handleFirebaseError(error));
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      mounted = false;
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [handleAuthenticatedUserInstant, handleUnauthenticatedUser]);

  const register = async (data: RegistrationData) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const { email, password, firstName, lastName } = data;
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email.toLowerCase().trim(), 
        password
      );
      
      const { uid } = userCredential.user;

      const userData: UserType = {
        uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
      };

      setCurrentUser(userData);
      setUserInCache(uid, userData);
      saveUserData(userData).catch(console.warn);

    } catch (err: unknown) {
      console.error("Error en registro:", err);
      setError(handleFirebaseError(err));
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const { email, password } = data;
      
      await signInWithEmailAndPassword(
        auth, 
        email.toLowerCase().trim(), 
        password
      );
      
    } catch (err: unknown) {
      console.error("Error en login:", err);
      setError(handleFirebaseError(err));
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // GOOGLE LOGIN DIRECTO SIN ESTADOS NI ANIMACIONES
  const loginWithGoogle = useCallback(async () => {
    setError(null);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Procesamiento inmediato
      await handleAuthenticatedUserInstant(result.user, true);
      
    } catch (err: unknown) {
      console.error("Error en Google login:", err);
      
      const firebaseError = err as any;
      
      if (firebaseError.code !== 'auth/popup-closed-by-user' && 
          firebaseError.code !== 'auth/cancelled-popup-request') {
        setError(handleFirebaseError(err));
      }
      
      throw err;
    }
  }, [handleAuthenticatedUserInstant]);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      clearUserCache();
    } catch (error) {
      console.error("Error en logout:", error);
      setError(handleFirebaseError(error));
    }
  };

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextType = {
    currentUser,
    loading,
    authLoading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    clearError,
    isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};