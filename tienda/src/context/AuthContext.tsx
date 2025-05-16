import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { UserType, LoginData, RegistrationData, AuthError } from "../../type";
import { getUserData, saveUserData } from "../services/userService";
import { handleFirebaseError } from "../../utils/authErrors";

interface AuthContextType {
  currentUser: UserType | null;
  loading: boolean;
  error: AuthError | null;
  register: (data: RegistrationData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setLoading(true);
      if (user) {
        let userData = localStorage.getItem(`user_${user.uid}`);
        if (userData) {
          setCurrentUser(JSON.parse(userData));
        } else {
          const fetchedUserData = await getUserData(user.uid);
          if (fetchedUserData) {
            localStorage.setItem(`user_${user.uid}`, JSON.stringify(fetchedUserData));
            setCurrentUser(fetchedUserData);
          } else {
            const fallbackUser: UserType = {
              uid: user.uid,
              email: user.email || "",
              firstName: user.displayName?.split(" ")[0] || "",
              lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
              avatar: user.photoURL || undefined,
            };
            setCurrentUser(fallbackUser);
            localStorage.setItem(`user_${user.uid}`, JSON.stringify(fallbackUser));
          }
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (data: RegistrationData) => {
    setAuthLoading(true);
    setError(null);
    try {
      const { email, password, firstName, lastName } = data;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      const userData: UserType = {
        uid,
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
      };

      await saveUserData(userData);
      setCurrentUser(userData);
      localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    } catch (err: unknown) {
      setError(handleFirebaseError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setAuthLoading(true);
    setError(null);
    try {
      const { email, password } = data;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      setError(handleFirebaseError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { uid, email, displayName, photoURL } = result.user;

      let userData = await getUserData(uid);
      if (!userData) {
        const [firstName, ...lastNameParts] = displayName?.split(" ") || ["Usuario"];
        const lastName = lastNameParts.join(" ") || "";

        userData = {
          uid,
          firstName,
          lastName,
          email: email || "",
          avatar: photoURL || undefined,
          createdAt: new Date().toISOString(),
        };

        await saveUserData(userData);
      }

      setCurrentUser(userData);
      localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    } catch (err: unknown) {
      setError(handleFirebaseError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, register, login, loginWithGoogle, logout, clearError: () => setError(null) }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
