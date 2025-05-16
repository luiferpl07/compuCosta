import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { UserCredentials, RegistrationData, AuthError } from "../../type";
import { store } from "../lib/store";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  // Añadimos estas dos nuevas variables de estado
  const [needsAdditionalInfo, setNeedsAdditionalInfo] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { getUserInfo } = store();

  const getErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
      "auth/invalid-email": "Por favor, ingresa un correo válido.",
      "auth/wrong-password": "La contraseña es incorrecta. Intenta de nuevo.",
      "auth/user-not-found": "No se encuentra una cuenta con ese correo. Regístrate primero.",
      "auth/email-already-in-use": "Este correo ya está en uso. Prueba con otro.",
      "auth/missing-password": "Por favor, ingresa una contraseña.",
      default: "Ocurrió un error. Por favor, intenta de nuevo.",
    };

    return errorMessages[code] || errorMessages.default;
  };

  const handleAuthError = (error: any) => {
    console.error(error);
    setError({
      code: error.code || "unknown",
      message: getErrorMessage(error.code),
    });
  };

  // Añadimos la función clearError
  const clearError = () => {
    setError(null);
  };

  // Añadimos la función handleAdditionalInfoComplete
  const handleAdditionalInfoComplete = async () => {
    setNeedsAdditionalInfo(false);
    if (currentUserId) {
      await getUserInfo(currentUserId);
    }
  };

  // Función para verificar si el usuario ya completó su perfil
  const checkProfileCompletion = async (userId: string): Promise<boolean> => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data().hasCompletedProfile === true;
      }
      return false;
    } catch (error) {
      console.error("Error al verificar el perfil:", error);
      return false;
    }
  };

  const login = async ({ email, password }: UserCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await getUserInfo(userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      handleAuthError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Verificar si el usuario es nuevo o si no ha completado su perfil
      const isFirstLogin = result.additionalUserInfo?.isNewUser || false;
      const hasCompletedProfile = isFirstLogin ? false : await checkProfileCompletion(user.uid);

      const userDoc = doc(db, "users", user.uid);
      const userData = {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        id: user.uid,
        // Solo marcamos como completado si ya tenemos esta confirmación
        hasCompletedProfile: hasCompletedProfile
      };

      await setDoc(userDoc, userData, { merge: true });
      
      // Si es un usuario nuevo o no ha completado su perfil, solicitar información adicional
      if (!hasCompletedProfile) {
        setCurrentUserId(user.uid);
        setNeedsAdditionalInfo(true);
      } else {
        await getUserInfo(user.uid);
      }
      
      return user;
    } catch (error: any) {
      handleAuthError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, firstName, lastName }: Omit<RegistrationData, "confirmPassword">) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", result.user.uid), {
        firstName,
        lastName,
        email,
        id: result.user.uid,
        hasCompletedProfile: true // Usuarios registrados normalmente tienen perfil completo por defecto
      });

      await getUserInfo(result.user.uid);
      return result.user;
    } catch (error: any) {
      handleAuthError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    needsAdditionalInfo,
    currentUserId,
    login,
    loginWithGoogle,
    register,
    clearError,
    handleAdditionalInfoComplete
  };
};