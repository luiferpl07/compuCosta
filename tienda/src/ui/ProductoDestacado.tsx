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
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  const settings = {
    dots: products.length > 4,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, arrows: false } },
      { breakpoint: 768,  settings: { slidesToShow: 2, slidesToScroll: 1, arrows: false } },
      { breakpoint: 640,  settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false, dots: false, centerMode: false } },
      { breakpoint: 480,  settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false, dots: false, centerMode: false, centerPadding: "12px" } }
    ]
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "8");
        params.set("visibilidad", "visibles");
        params.set("cantidadMin", "1");
        params.set("destacado", "true");

        const response = await fetch(`${config?.baseUrl}${config?.apiPrefix}/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();
        let destacados: Product[] = Array.isArray(data?.productos) ? data.productos : [];

        if (!destacados.length || destacados.length < 8) {
          const collected: Product[] = destacados.slice();
          let page = 1;
          let hasMore = true;

          while (hasMore && collected.length < 8 && page <= 10) {
            const fbParams = new URLSearchParams();
            fbParams.set("page", page.toString());
            fbParams.set("limit", "50");
            fbParams.set("visibilidad", "visibles");
            fbParams.set("cantidadMin", "1");

            const resp = await fetch(`${config?.baseUrl}${config?.apiPrefix}/products?${fbParams.toString()}`);
            if (!resp.ok) break;

            const pageData = await resp.json();
            const pageProducts: Product[] = Array.isArray(pageData?.productos) ? pageData.productos : [];
            const featuredInPage = pageProducts.filter((p) => p.destacado === true);
            collected.push(...featuredInPage);

            hasMore = Boolean(pageData?.hasMore);
            page += 1;
          }

          destacados = collected;
        }

        console.log('Productos destacados:', destacados.length);
        setProducts(destacados.slice(0, 8));
      } catch (error) {
        console.error('❌ Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    const onResize = () => setIsMobileView(window.innerWidth <= 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="mb-10">
          <Title text="Productos Destacados" />
          <div className="w-full h-[1px] bg-gray-200 mt-2" />
        </div>
        <div className="flex space-x-6 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse border border-gray-200 rounded-lg p-4 w-full min-w-[250px]">
              <div className="bg-gray-200 h-60 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container>
        <div className="mb-10">
          <Title text="Productos Destacados" />
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
        <Title text="Productos Destacados" />
        <div className="w-full h-[1px] bg-gray-200 mt-2" />
      </div>

      <div className="relative mb-12">
        {/*  Flechas solo en desktop */}
        {products.length > 4 && (
          <>
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 -ml-4 opacity-80 hover:opacity-100 transition-opacity"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 -mr-4 opacity-80 hover:opacity-100 transition-opacity"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </>
        )}

        {/* En móviles renderizamos una lista horizontal simple para evitar problemas del carousel */}
        {isMobileView ? (
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="flex gap-3">
              {products.map((item) => (
                <div key={item.idproducto} className="min-w-full shrink-0 px-2">
                  <div className="mx-auto max-w-md">
                    <ProductCard item={item} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <Slider ref={sliderRef} {...settings}>
              {products.map((item) => (
                <div key={item.idproducto} className="px-2 min-w-full sm:min-w-[200px]">
                  <ProductCard item={item} />
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </Container>
  );
};

export default ProductoDestacado;