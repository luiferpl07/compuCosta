export interface HighlightsType {
  _id: number;
  _base: string;
  title: string;
  name: string;
  image: string;
  color: string;
  buttonTitle: string;
}

export interface CategoryProps {
  id: number;
  imagen: string;
  nombre: string;
  slug: string;
  descripcion: string;
  enlaceDestacado?: string;
}

export interface Product {
  idproducto: string; // ID único del producto
  nombreproducto: string; // Nombre del producto
  lista1: number; 
  porciva:     string;  // Porcentaje IVA
  ivaincluido:    string// Precio del producto
  descripcion?: string; // Descripción larga (opcional)
  caracteristica?: string; // Descripción corta (opcional)
  slug: string; // Slug único
  destacado: boolean; // Si el producto es destacado
  cantidad: number; // Cantidad disponible
  vistaGeneral?: string; // Resumen general del producto (opcional)
  enStock: boolean; // Indica si el producto está en stock
  esNuevo: boolean; // Indica si el producto es nuevo
  lista2: number; // Precio con descuento (opcional)
  puntuacionPromedio: number; // Puntuación promedio basada en las reseñas
  reseñasCount: number; // Número total de reseñas
  created_at: Date; // Fecha de creación
  updated_at: Date; // Fecha de última actualización

  // Relación con categorías
  categorias: {
    id: number;
    nombre: string;
    descripcion?: string;
    slug: string;
    imagen?: string;
    enlaceDestacado?: string;
    
  }[];

  // Relación con colores
  colores: {
    id: number;
    nombre: string;
    codigoHex: string;
  }[];

  // Relación con marcas
  marca: {
    id: number;
    nombre: string;
    imagen?: string;
  };

  // Relación con imágenes
  imagenes: {
    id: number;
    url: string;
    alt_text?: string; // Texto alternativo (opcional)
    orden: number; // Orden de las imágenes
    es_principal: boolean; // Indica si es la imagen principal
    created_at: Date; // Fecha de creación de la imagen
  }[];

  // Relación con reseñas
  reviews: {
    id: number;
    id_producto: number;
    nombre_cliente: string; // Nombre del cliente que dejó la reseña
    calificacion: number; // Calificación del producto (1-5)
    comentario?: string; // Comentario del cliente (opcional)
    fecha_review: Date; // Fecha de la reseña
    aprobado: boolean; // Indica si la reseña está aprobada
  }[];
}



export interface OrderTypes {
  orderItems: Product[];
  paymentId: string;
  paymentMethod: string;
  userEmail: string;
}

export interface BannerProps {
  id: number; 
  title: string; 
  imageUrl: string; 
  isActive: boolean;
  bannerType:  string    
  createdAt: string;
}


export interface UserType {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthError {
  code?: string;
  message: string;
}