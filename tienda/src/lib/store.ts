import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "./firebase";
import { Product } from "../../type";

// Actualizamos CartProduct para usar la nueva interfaz Product
interface CartProduct extends Product {
  cantidad: number;
}

// Actualizamos UserType para que coincida con UserTypes de tu interfaz
interface UserType {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  id: string;
}

interface StoreType {
  // User
  currentUser: UserType | null;
  isLoading: boolean;
  getUserInfo: (uid: string) => Promise<void>;
  
  // Cart
  cartProduct: CartProduct[];
  addToCart: (product: Product) => Promise<void>;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  resetCart: () => void;
  
  // Favorite
  favoriteProduct: CartProduct[];
  addToFavorite: (product: Product) => Promise<void>;
  removeFromFavorite: (productId: string) => void;
  resetFavorite: () => void;
}

const customStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const store = create<StoreType>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoading: true,
      cartProduct: [],
      favoriteProduct: [],

      getUserInfo: async (uid: string) => {
        if (!uid) return set({ currentUser: null, isLoading: false });

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        try {
          if (docSnap.exists()) {
            set({ currentUser: docSnap.data() as UserType, isLoading: false });
          }
        } catch (error) {
          console.log("getUserInfo error", error);
          set({ currentUser: null, isLoading: false });
        }
      },

      addToCart: (product: Product) => {
        return new Promise<void>((resolve) => {
          set((state: StoreType) => {
            const existingProduct = state.cartProduct.find((p) => p.idproducto === product.idproducto);
      
            if (existingProduct) {
              // Si ya existe, solo aumenta la cantidad
              return {
                cartProduct: state.cartProduct.map((p) =>
                  p.idproducto === product.idproducto
                    ? { ...p, cantidad: (p.cantidad || 0) + 1 }
                    : p
                ),
              };
            } else {
              // Si no existe, lo agregamos con cantidad 1
              return {
                cartProduct: [
                  ...state.cartProduct,
                  { ...product, cantidad: 1 },
                ],
              };
            }
          });
          resolve();
        });
      },

      decreaseQuantity: (productId: string) => {
        set((state: StoreType) => {
          const existingProduct = state.cartProduct.find(
            (p) => p.idproducto === productId
          );
      
          if (existingProduct) {
            return {
              cartProduct: state.cartProduct.map((p) =>
                p.idproducto === productId
                  ? { ...p, cantidad: Math.max(p.cantidad - 1, 1) } // Cambiar quantity por cantidad
                  : p
              ),
            };
          } else {
            return state;
          }
        });
      },

      removeFromCart: (productId: string) => {
        set((state: StoreType) => ({
          cartProduct: state.cartProduct.filter(
            (item) => item.idproducto !== productId
          ),
        }));
      },

      resetCart: () => {
        set({ cartProduct: [] });
      },

      addToFavorite: (product: Product) => {
        return new Promise<void>((resolve) => {
          set((state: StoreType) => {
            const isFavorite = state.favoriteProduct.some(
              (item) => item.idproducto === product.idproducto
            );
            return {
              favoriteProduct: isFavorite
                ? state.favoriteProduct.filter(
                    (item) => item.idproducto !== product.idproducto
                  )
                : [...state.favoriteProduct, { ...product, quantity: 1 }],
            };
          });
          resolve();
        });
      },

      removeFromFavorite: (productId: string) => {
        set((state: StoreType) => ({
          favoriteProduct: state.favoriteProduct.filter(
            (item) => item.idproducto !== productId
          ),
        }));
      },

      resetFavorite: () => {
        set({ favoriteProduct: [] });
      },
    }),
    {
      name: "computadoresDeLaCosta-storage",
      storage: customStorage,
    }
  )
);