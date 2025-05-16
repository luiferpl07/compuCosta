import { getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserType } from "../../type";

export const getUserData = async (uid: string): Promise<UserType | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      console.warn(`❌ Usuario ${uid} no encontrado en Firestore`);
      return null; // No devolver error, solo null
    }

    return userDoc.data() as UserType;
  } catch (error) {
    console.error("🔥 Error al obtener datos del usuario:", error);
    return null; // Evita que Firestore tire un error fatal
  }
};


export async function saveUserData(userData: any) {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
  
      if (!res.ok) throw new Error("Error guardando usuario");
  
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }