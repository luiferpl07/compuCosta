import { Link } from "react-router-dom";
import { config } from "../../config";
import { Product } from "../../type";
import Title from "./Title";
import Container from "./Container";
import { useEffect, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ProductoDestacado = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<Slider>(null);
  
  const maxProducts = 8; // Limitamos a 8 productos destacados

  // Configuración del carrusel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const nextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Obtener todos los productos
        const response = await fetch(`${config?.baseUrl}${config?.apiPrefix}/products`);
        const data = await response.json();
        
        // Filtrar solo productos destacados del lado del cliente
        // y limitar a maxProducts (8)
        const featuredProducts = data
          .filter((product: Product) => product.destacado === true)
          .slice(0, maxProducts);
          
        // Agregar propiedades adicionales para compatibilidad con ProductCard
        const enhancedProducts = featuredProducts.map((product: Product) => ({
          ...product,
          enStock: product.cantidad > 0,
          reviews: product.reseñasCount ? [{ calificacion: product.puntuacionPromedio }] : [],
          marca: product.marca || "Sin marca",
          categorias: product.categorias || "Sin categoría",
          imagenes: product.imagenes || [{ url: `/images/products/${product.slug}.jpg` }]
        }));
        
        setProducts(enhancedProducts);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <Title text="Productos Destacados" />
            <div className="w-40 h-6 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="w-full h-[1px] bg-gray-200 mt-2" />
        </div>
        <div className="flex space-x-6 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse border border-gray-200 rounded-lg p-4 w-full min-w-[250px]">
              <div className="bg-gray-200 h-60 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-gray-200"></div>
                ))}
              </div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // Si no hay productos destacados
  if (products.length === 0) {
    return (
      <Container>
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <Title text="Productos Destacados" />
            
          </div>
          <div className="w-full h-[1px] bg-gray-200 mt-2" />
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No hay productos destacados disponibles.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <Title text="Productos Destacados" />
          
        </div>
        <div className="w-full h-[1px] bg-gray-200 mt-2" />
      </div>

      <div className="relative mb-12">
        {/* Botones de navegación */}
        <button 
          onClick={prevSlide} 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 -ml-4 opacity-80 hover:opacity-100 transition-opacity"
        >
          <FaChevronLeft className="text-gray-600" />
        </button>
        
        <div className="px-6">
          <Slider ref={sliderRef} {...settings}>
            {products.map((item) => (
              <div key={item.idproducto} className="px-2">
                <ProductCard item={item} />
              </div>
            ))}
          </Slider>
        </div>
        
        <button 
          onClick={nextSlide} 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 -mr-4 opacity-80 hover:opacity-100 transition-opacity"
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>
    </Container>
  );
};

export default ProductoDestacado;