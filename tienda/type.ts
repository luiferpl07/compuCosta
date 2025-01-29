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
}

export interface Product {
  id: string; // ID único del producto
  nombre: string; // Nombre del producto
  precio: number; // Precio del producto
  descripcionLarga?: string; // Descripción larga (opcional)
  descripcionCorta?: string; // Descripción corta (opcional)
  slug: string; // Slug único
  destacado: boolean; // Si el producto es destacado
  cantidad: number; // Cantidad disponible
  vistaGeneral?: string; // Resumen general del producto (opcional)
  enStock: boolean; // Indica si el producto está en stock
  esNuevo: boolean; // Indica si el producto es nuevo
  precioDescuento?: number; // Precio con descuento (opcional)
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
    nombre_cliente: string; // Nombre del cliente que dejó la reseña
    calificacion: number; // Calificación del producto (1-5)
    comentario?: string; // Comentario del cliente (opcional)
    fecha_review: Date; // Fecha de la reseña
    aprobado: boolean; // Indica si la reseña está aprobada
  }[];
}

export interface UserTypes {
  currentUser: {
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
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
  createdAt: string;
}
