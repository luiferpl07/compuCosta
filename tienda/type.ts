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
  nombre: string;
  descripcion?: string;
  slug: string;
  imagen?: string;
  enlaceDestacado?: string;
  padre_id?: number | null;
  activo: boolean;
  subcategorias?: CategoryProps[];
}

export interface ProductCategory {
  id: number;
  categoria: CategoryProps;
}

export interface ProductColor {
  id: number;
  nombre: string;
  codigoHex: string;
}

export interface ProductBrand {
  id: number;
  marca: {
    id: number;
    nombre: string;
    imagen?: string;
  };
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  orden: number;
  es_principal: boolean;
  created_at: Date;
}

export interface ProductReview {
  id: number;
  id_producto: number;
  nombre_cliente: string;
  calificacion: number;
  comentario?: string;
  fecha_review: Date;
  aprobado: boolean;
}

export interface Product {
  id?: number;
  idproducto: string;
  nombreproducto: string;
  lista1: number;
  porciva: string;
  ivaincluido: string;
  descripcion?: string;
  caracteristica?: string;
  slug: string;
  destacado: boolean;
  cantidad: number;
  vistaGeneral?: string;
  enStock: boolean;
  esNuevo: boolean;
  lista2: number;
  lista2_activa: boolean;
  puntuacionPromedio: number;
  reseñasCount: number;
  created_at: Date;
  updated_at: Date;
  activo?: boolean;          
  activo_manual?: boolean | null;
  shopify_product_id?: string;
  shopify_variant_id?: string;

  // Relaciones corregidas
  categorias: ProductCategory[];
  colores: ProductColor[];
  marca: ProductBrand[];
  imagenes: ProductImage[];
  reviews: ProductReview[];
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