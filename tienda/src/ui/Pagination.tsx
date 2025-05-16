"use client";
import { useEffect, useState } from "react";
import { config } from "../../config";
import { getData } from "../lib";
import { Product } from "../../type";
import ProductCard from "./ProductCard";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ItemsProps {
  currentItems: Product[];
}

const Items = ({ currentItems }: ItemsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
      {currentItems &&
        currentItems?.map((item: Product) => (
          <ProductCard key={item?.idproducto} item={item} />
        ))}
    </div>
  );
};

const Pagination = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${config?.baseUrl}${config?.apiPrefix}/products`;
      try {
        setLoading(true);
        const data = await getData(endpoint);
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data", error);
        setError("Error al cargar los productos. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const itemsPerPage = 15;
  const [itemOffset, setItemOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = products.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(products.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    setItemOffset(newOffset);
    setCurrentPage(event.selected);
    
    // Scroll a la sección de productos
    const productSection = document.querySelector('.container');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        <p>No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Items currentItems={currentItems} />
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-200 pt-6">
        {/* Información de productos */}
        <p className="text-sm text-gray-600 order-2 md:order-1">
          Mostrando productos {itemOffset + 1} al {Math.min(endOffset, products.length)}{" "}
          de {products.length} totales
        </p>

        {/* Paginación */}
        <div className="order-1 md:order-2">
          <ReactPaginate
            breakLabel="..."
            nextLabel={<ChevronRight className="w-4 h-4" />}
            previousLabel={<ChevronLeft className="w-4 h-4" />}
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            renderOnZeroPageCount={null}
            className="flex items-center gap-2"
            pageClassName="page-item"
            pageLinkClassName="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            previousClassName="page-item"
            previousLinkClassName="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            nextClassName="page-item"
            nextLinkClassName="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            breakClassName="page-item"
            breakLinkClassName="w-10 h-10 flex items-center justify-center"
            containerClassName="flex items-center gap-2"
            activeClassName="!bg-red-600 !text-white !border-red-600 hover:!text-black"
            disabledClassName="opacity-50 cursor-not-allowed"
            disabledLinkClassName="cursor-not-allowed"
          />
        </div>

        {/* Navegación rápida */}
        <div className="flex items-center gap-2 order-3">
          <button
            onClick={() => handlePageClick({ selected: 0 })}
            disabled={currentPage === 0}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageClick({ selected: pageCount - 1 })}
            disabled={currentPage === pageCount - 1}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;