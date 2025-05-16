import { FirebaseError } from "firebase/app";
import { AuthError } from "../type";

export const handleFirebaseError = (error: unknown): AuthError => {
  if (error instanceof FirebaseError) {
    const errorMessages: Record<string, string> = {
      "auth/email-already-in-use": "Este correo ya está en uso.",
      "auth/invalid-email": "El correo no es válido.",
      "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
      "auth/user-not-found": "No existe una cuenta con este correo.",
      "auth/wrong-password": "Contraseña incorrecta.",
      "auth/weak-password": "La contraseña es muy débil.",
      "auth/network-request-failed": "Error de conexión.",
      "auth/too-many-requests": "Demasiados intentos. Inténtalo más tarde.",
      "auth/popup-closed-by-user": "Inicio de sesión cancelado.",
    };

    return {
      code: error.code,
      message: errorMessages[error.code] || "Error desconocido.",
    };
  }

  return {
    code: "unknown",
    message: "Error desconocido. Inténtalo de nuevo.",
  };
};
