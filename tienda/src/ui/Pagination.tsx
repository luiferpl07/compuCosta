import { useEffect, useState, RefObject } from "react";
import { config } from "../../config";
import { Product } from "../../type";
import ProductCard from "./ProductCard";
import { getData } from "../lib";
import { FaSpinner } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const ITEMS_PER_PAGE = 8; // 8 productos por página

interface PaginationProps {
  scrollTargetRef?: RefObject<HTMLDivElement>;
}

const Pagination = ({ scrollTargetRef }: PaginationProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products.slice(startIndex, endIndex);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Fetch paginated until we have all active products
        let allProductsData: Product[] = [];
        let cursor: number | null = null;
          
        do {
          const url = `${config?.baseUrl}${config?.apiPrefix}/products?limit=100${cursor ? `&cursor=${cursor}` : ""}`;
          const res = await getData(url);
          const page: Product[] = res?.productos || [];
          allProductsData = [...allProductsData, ...page];
          cursor = res?.nextCursor ?? null;
        } while (cursor !== null);
        
        const productosActivos = allProductsData.filter((product: Product) => {
          const tieneStock = (product.cantidad || 0) > 0;
          const estaActivo = product.activo === true;
          return estaActivo && tieneStock;
        });
        
        console.log('✅ Pagination productos CON stock:', productosActivos.length);
        
        // Formatear los productos (las reviews no se traen todas de golpe por rendimiento)
        const enhancedProducts = productosActivos.map((product: Product) => {
          return {
            ...product,
            enStock: true,
            reseñasCount: product.reseñasCount || 0,
            puntuacionPromedio: product.puntuacionPromedio || 0,
            marca: product.marca || "Sin marca",
            categorias: product.categorias || "Sin categoría",
            imagenes: product.imagenes || [{ url: `/images/products/${product.slug}.jpg` }]
          };
        });
        
        const sortedProducts = enhancedProducts.sort((a: Product, b: Product) => 
          (b.puntuacionPromedio || 0) - (a.puntuacionPromedio || 0)
        );
        
        setProducts(sortedProducts);
      } catch (error) {
        console.error("❌ Pagination error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (currentPage > 1 && scrollTargetRef?.current) {
      const element = scrollTargetRef.current;
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  }, [currentPage, scrollTargetRef]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="animate-spin text-4xl text-textoRojo" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay productos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {getCurrentPageProducts().map((item: Product) => (
          <ProductCard key={item?.idproducto} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <IoChevronBack className="w-5 h-5" />
          </button>

          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === "number" && setCurrentPage(pageNum)}
              disabled={pageNum === "..."}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                pageNum === currentPage
                  ? "bg-orange-500 text-white font-semibold"
                  : pageNum === "..."
                  ? "cursor-default text-gray-400"
                  : "text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            <IoChevronForward className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="text-center text-sm text-gray-600 mt-4">
        Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, products.length)} de {products.length} productos
      </div>
    </div>
  );
};

export default Pagination;