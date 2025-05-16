import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, useNavigate, Link  } from "react-router-dom";
import { config } from "../../config";
import { Product, CategoryProps } from "../../type";
import { getData } from "../lib";
import Loading from "../ui/Loading";
import Container from "../ui/Container";
import PriceTag from "../ui/PriceTag";
import { FaRegEye } from "react-icons/fa";
import { MdStar, MdStarHalf, MdOutlineStarOutline } from "react-icons/md";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import FormatoPrecio from "../ui/FormatoPrecio";
import AddToCartBtn from "../ui/AddToCartBtn";
import { productPayment } from "../assets";
import ProductCard from "../ui/ProductCard";
import Filters from "../ui/Filtros";
import ReviewsSection from "../ui/Review";
import ProductDescription from "../ui/DescripcionProducto";
import CaracteristicaProducto from "../ui/CaracteristicaProducto";
import { getProductImage } from "../../utils/imageUtils";



interface Review {
  id: number;
  id_producto: number;
  nombre_cliente: string;
  calificacion: number;
  comentario?: string;
  fecha_review: string | Date;
  aprobado: boolean;
}

const ITEMS_PER_PAGE = 12;

const Producto = () => {

  const [productData, setProductData] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("rating_desc");
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState<Product["colores"][0] | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categorySelected, setCategorySelected] = useState<CategoryProps | null>(null);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const { id } = useParams<{ id: string }>();

  

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  };

  useEffect(() => {
    if (categories.length > 0) {
      const foundCategory = categories.find((cat) => cat.slug === selectedCategory) || null;
      setCategorySelected(foundCategory);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getData(`${config?.baseUrl}${config?.apiPrefix}/products/${id}`);
          setProductData(data);

          const reviewsResponse = await getData(`${config?.baseUrl}${config?.apiPrefix}/reviews?productId=${id}`);
          if (Array.isArray(reviewsResponse)) {
            const filteredReviews = reviewsResponse.filter(review => review.id_producto === Number(id));
            setReviews(filteredReviews);
          }
        } else {
          const data = await getData(`${config?.baseUrl}${config?.apiPrefix}/products`);
          const categoriesData = await getData(`${config?.baseUrl}${config?.apiPrefix}/categories`);
          
          // Store categories in state
          setCategories(categoriesData);
          
          setAllProducts(data);
          setFilteredProducts(data);
          
          // Set category if there's a category in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const categorySlug = urlParams.get('categoria');
          if (categorySlug) {
            const foundCategory = categoriesData.find((cat: CategoryProps) => cat.slug === categorySlug);
            setCategorySelected(foundCategory || null);
            setSelectedCategory(categorySlug);
          }
        }
      } catch (error) {
        console.error("Error al cargar los productos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);


  useEffect(() => {
    if (productData?.imagenes) {
      setImgUrl(getProductImage(productData.imagenes));
    }
    if (productData?.colores) {
      setSelectedColor(productData.colores[0] || null);
    }
  }, [productData]);

  useEffect(() => {
    if (!allProducts.length) return;
    
    const sortedAndFiltered = allProducts
      .filter(product => {
        if (!product.categorias || !Array.isArray(product.categorias)) {
          return selectedCategory === "";
        }
        
        const belongsToCategory = selectedCategory === "" || 
          product.categorias.some(cat => cat.slug === selectedCategory);
        
        const inPriceRange = 
          (product.lista1 >= priceRange[0] && product.lista1 <= priceRange[1]) ||
          (product.lista2 >= priceRange[0] && product.lista2 <= priceRange[1]);
        
        return belongsToCategory && inPriceRange;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name_asc":
            return a.nombreproducto.localeCompare(b.nombreproducto);
          case "name_desc":
            return b.nombreproducto.localeCompare(a.nombreproducto);
          case "price_asc":
            return (a.lista2 || a.lista1) - (b.lista2 || b.lista1);
          case "price_desc":
            return (b.lista2 || b.lista1) - (a.lista2 || a.lista1);
          case "rating_desc":
            return b.puntuacionPromedio - a.puntuacionPromedio;
          default:
            return 0;
        }
      });
    
    setFilteredProducts(sortedAndFiltered);
    setCurrentPage(1);
  }, [allProducts, selectedCategory, sortBy, priceRange]);

  const handleCategoryChange = (category: string) => {
    const currentUrl = new URL(window.location.href);
    
    if (category) {
      currentUrl.searchParams.set('categoria', category);
    } else {
      currentUrl.searchParams.delete('categoria');
    }
    
    window.history.pushState({}, '', currentUrl.toString());
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleAddReview = (newReview: Review) => {
    setProductData((prevData) => {
      if (!prevData) return null;
  
      return {
        ...prevData,
        reviews: [
          ...prevData.reviews,
          {
            ...newReview,
            fecha_review: newReview.fecha_review instanceof Date
              ? newReview.fecha_review
              : new Date(newReview.fecha_review),
          },
        ],
      };
    });
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


  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, review) => acc + review.calificacion, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) {
    return <Loading />;
  }

  if (id && productData) {
    return (
      <Container>
        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6">
            {/* Galería de imágenes */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex md:flex-col gap-2 order-2 md:order-1">
                {productData.imagenes.map((item) => (
                  <img
                    src={getProductImage([item])}
                    alt={item.alt_text || "Imagen del producto"}
                    key={item.id}
                    className={`w-24 h-24 object-cover cursor-pointer rounded-lg ${
                      imgUrl === getProductImage([item])
                        ? "border-2 border-amber-500"
                        : "border border-gray-200 hover:border-amber-300"
                    }`}
                    onClick={() => setImgUrl(getProductImage([item]))}
                  />
                ))}
              </div>
              <div className="order-1 md:order-2 flex-grow">
                <img
                  src={imgUrl}
                  alt="Imagen principal"
                  className="h-96 w-96 object-cover rounded-lg mx-auto"
                />
              </div>
            </div>

            {/* Información del producto */}
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold">{productData.nombreproducto}</h2>
              <div className="flex items-center justify-between">
                <PriceTag precio={productData.lista2} precioDescuento={productData.lista1} className="text-xl" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => {
                      const ratingValue = index + 1;
                      const isHalfStar = parseFloat(averageRating) - index > 0 && parseFloat(averageRating) - index < 1;
                      const isFullStar = parseFloat(averageRating) >= ratingValue;
                      
                      return isFullStar ? (
                        <MdStar key={index} className="text-yellow-400" />
                      ) : isHalfStar ? (
                        <MdStarHalf key={index} className="text-yellow-400" />
                      ) : (
                        <MdOutlineStarOutline key={index} className="text-gray-300" />
                      );
                    })}
                  </div>
                  <p className="text-base font-semibold">({reviews.length} reseñas)</p>
                </div>
              </div>

              <p>
                Estás ahorrando
                <span className="text-base font-semibold text-green-500">
                  <FormatoPrecio amount={(productData.lista2 || 0) - (productData.lista1 || 0)} />
                </span>{" "}
                al comprar
              </p>

              {/* Selector de colores */}
              <div>
                {selectedColor && (
                  <p>
                    Color:{" "}
                    <span className="font-semibold capitalize" style={{ color: selectedColor.codigoHex }}>
                      {selectedColor.nombre}
                    </span>
                  </p>
                )}

                <div className="flex items-center gap-x-3">
                  {productData.colores.map((item) => (
                    <div
                      key={item.codigoHex}
                      className={`${
                        item.codigoHex === selectedColor?.codigoHex
                          ? "border border-black p-1 rounded-full"
                          : "border-transparent"
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full cursor-pointer"
                        style={{ backgroundColor: item.codigoHex }}
                        onClick={() => setSelectedColor(item)}
                      />
                    </div>
                  ))}
                </div>

                {selectedColor && (
                  <button
                    onClick={() => setSelectedColor(null)}
                    className="font-semibold mt-1 flex items-center gap-1 hover:text-red-600 duration-200"
                  >
                    <IoClose /> Limpiar
                  </button>
                )}
              </div>

              <p>
                  Marca:{" "}
                  <span className="font-medium">
                    {Array.isArray(productData?.marca) && productData.marca.length > 0
                      ? productData.marca[0].marca.nombre
                      : "Sin marca"}
                  </span>
                </p>
                <p>
                  Categoría:{" "}
                  <span className="font-medium">
                    {Array.isArray(productData?.categorias) && productData.categorias.length > 0
                      ? productData.categorias[0].nombre
                      : "Sin categoría"}
                  </span>
                </p>
                <br />
              <AddToCartBtn
                product={productData}
                title="Comprar ahora"
                className="bg-black/80 py-3 text-base text-gray-200 hover:text-white duration-200"
                showPrice={false}
              />

              <div className="bg-[#f7f7f7] p-5 rounded-md flex flex-col items-center justify-center gap-2">
                <img src={productPayment} alt="Pago seguro" className="w-auto object-cover" />
                <p className="font-semibold">Garantía de pago seguro y protegido</p>
              </div>
            </div>
          </div>

          <CaracteristicaProducto producto={productData} />
          <ProductDescription product={productData} />
          <ReviewsSection productId={id} onAddReview={handleAddReview} />
        </div>
      </Container>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar de filtros */}
      <div className="w-full md:w-1/4 lg:w-1/5 xl:w-1/5 md:min-w-[250px] md:max-w-[300px] md:sticky md:top-0 md:h-screen overflow-y-auto p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-white">
        <Filters
          selectedCategory={selectedCategory}
          priceRange={priceRange}
          onCategoryChange={handleCategoryChange}
          onPriceRangeChange={setPriceRange}
          onFilterProducts={setFilteredProducts}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-grow w-full md:w-3/4 lg:w-4/5 xl:w-4/5 px-2 sm:px-4 py-4 sm:py-6 overflow-y-auto relative">
      
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <p className="text-sm text-gray-500">
            Mostrando {Math.min(ITEMS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length} productos
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="rating_desc">Mejor valorados</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="name_asc">A-Z</option>
            <option value="name_desc">Z-A</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          {getCurrentPageProducts().map((item: Product) => (
            <div key={item.idproducto} className="relative">
              <ProductCard item={item} />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 mt-8 sm:mt-10">
            No se encontraron productos en esta categoría.
          </p>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mt-6 sm:mt-8 flex justify-center items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <IoChevronBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {getPageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === "number" && setCurrentPage(pageNum)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-md ${
                    pageNum === currentPage
                      ? "bg-amber-500 text-white"
                      : pageNum === "..."
                      ? "cursor-default"
                      : "border border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <IoChevronForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Featured Link Moved Here and Made Reactive */}
              {categorySelected?.enlaceDestacado && (
                <a 
                  href={categorySelected.enlaceDestacado}
                  target="_blank" 
                  className="ml-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-md hover:bg-red-700 flex items-center justify-center"
                  
                >
                  Ver más {categorySelected?.nombre || 'esta categoría'}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Producto;