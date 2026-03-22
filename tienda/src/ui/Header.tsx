import { useEffect, useState, useRef } from "react";
import { logo } from "../assets";
import { IoClose, IoMenu, IoGridOutline } from "react-icons/io5";
import { FiShoppingCart, FiStar, FiUser } from "react-icons/fi";
import { BiSearchAlt2 } from "react-icons/bi";
import { HiOutlineSparkles, HiOutlineTag } from "react-icons/hi";
import Container from "./Container";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { config } from "../../config";
import { getData } from "../lib";
import { CategoryProps, Product } from "../../type";
import ProductCard from "./ProductCard";
import { store } from "../lib/store";

const bottomNavigation = [
  { title: "INICIO", link: "/", icon: <HiOutlineSparkles className="w-4 h-4" /> },
  { title: "SERVICIOS", link: "/Servicio", icon: <HiOutlineTag className="w-4 h-4" /> },
  { title: "ACERCA DE NOSOTROS", link: "/acerca-de-nosotros", icon: <FiUser className="w-4 h-4" /> },
  { title: "CONTACTO", link: "/Contacto", icon: <IoGridOutline className="w-4 h-4" /> },
];

interface CategoryWithSubcategories extends CategoryProps {
  subcategorias?: CategoryProps[];
}





const Header = () => {
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexReady, setIsIndexReady] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const navigate = useNavigate();
  const { cartProduct, favoriteProduct, currentUser } = store();

  // ─── Organizar categorías desde API ──────────────────────────────────────
  const organizeCategoriesFromAPI = (categoryData: CategoryProps[]): CategoryWithSubcategories[] => {
    const activas = categoryData.filter(cat => cat.activo === true);
    const parents  = activas.filter(cat => cat.padre_id === null);
    const children = activas.filter(cat => cat.padre_id !== null);

    const subcategoriesGrouped: { [key: number]: CategoryProps[] } = {};
    children.forEach(sub => {
      const padreActivo = parents.find(p => p.id === sub.padre_id);
      if (padreActivo && sub.padre_id) {
        if (!subcategoriesGrouped[sub.padre_id]) subcategoriesGrouped[sub.padre_id] = [];
        subcategoriesGrouped[sub.padre_id].push(sub);
      }
    });

    return parents.map(parent => ({
      ...parent,
      subcategorias: subcategoriesGrouped[parent.id]?.length
        ? subcategoriesGrouped[parent.id]
        : undefined,
    }));
  };

  // ─── Carga inicial: Solo categorías (búsqueda perezosa) ─────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await getData(`${config?.baseUrl}${config?.apiPrefix}/categories`);
        
        const organizedCategories = organizeCategoriesFromAPI(categoryData);
        const subcategoriesGrouped: { [key: number]: CategoryProps[] } = {};
        organizedCategories.forEach(parent => {
          if (parent.subcategorias?.length) {
            subcategoriesGrouped[parent.id] = parent.subcategorias;
          }
        });

        setCategories(organizedCategories);
        setIsIndexReady(true);
      } catch (error) {
        console.error("❌ Error al cargar datos del Header:", error);
      }
    };

    fetchData();

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
        searchAbortRef.current = null;
      }
    };
  }, []);

  // ─── Búsqueda server-side con debounce y abort ────────────────────────────
  useEffect(() => {
    const query = searchText.toLowerCase().trim();
    
    // Auto-limpiar búsqueda caracteres extraños básicos
    const sanitizedQuery = query.replace(/[<>{}\\]/g, "");

    if (!sanitizedQuery) {
      setFilteredProducts([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        if (searchAbortRef.current) {
          searchAbortRef.current.abort();
        }

        const controller = new AbortController();
        searchAbortRef.current = controller;

        const terms = sanitizedQuery.split(/\s+/).filter(t => t.length >= 2);
        if (terms.length === 0) {
          setFilteredProducts([]);
          setIsSearching(false);
          return;
        }

        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "10");
        params.set("search", sanitizedQuery);
        params.set("visibilidad", "visibles");
        params.set("cantidadMin", "1");

        const response = await fetch(
          `${config?.baseUrl}${config?.apiPrefix}/products?${params.toString()}`,
          {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();

        if (searchAbortRef.current !== controller) return;

        const candidates: Product[] = Array.isArray(data?.productos)
          ? data.productos.slice(0, 10)
          : [];

        setFilteredProducts(candidates);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setFilteredProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, [searchText]);

  // ─── Handlers de hover para mega menú ────────────────────────────────────
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowProductsMenu(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowProductsMenu(false);
      setActiveCategory(null);
    }, 300);
  };

  // ─── Navegación a categoría ───────────────────────────────────────────────
  const handleCategoryNavigation = (categorySlug: string) => {
    setShowProductsMenu(false);
    setMobileMenuOpen(false);
    setActiveCategory(null);
    setShowMobileCategories(false);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    navigate(`/productos?categoria=${encodeURIComponent(categorySlug)}`, {
      replace: false,
      state: { timestamp: Date.now(), categoria: categorySlug },
    });
  };

  const clearSearch = () => {
    setSearchText("");
    setFilteredProducts([]);
    setSearchFocused(false);
  };


  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(prev => !prev);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  // ─── Eventos globales ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen || mobileSearchOpen) {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen, mobileSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container") && !target.closest(".search-results") && searchText) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setShowProductsMenu(false);
        setSearchFocused(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const organizeCategories = () => {
    const isLargeScreen = window.innerWidth >= 1400;
    const isTablet = window.innerWidth < 1024;
    const isMobile = window.innerWidth < 768;

    let columns = 3;
    if (isMobile) columns = 1;
    else if (isTablet) columns = 2;
    else if (isLargeScreen) columns = 4;

    const perColumn = Math.ceil(categories.length / columns);
    return Array.from({ length: columns }, (_, i) =>
      categories.slice(i * perColumn, (i + 1) * perColumn)
    );
  };

  const hasActiveCategories = categories.length > 0;

  return (
    <div className="w-full bg-gradient-to-r from-white to-gray-50 sticky top-0 z-50 shadow-sm border-b border-gray-100">
      {/* ── Barra superior ───────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto min-h-[4.5rem] sm:min-h-[5.5rem] flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        {/* Botón menú móvil */}
        <button
          className="lg:hidden group relative text-2xl sm:text-3xl mr-2 sm:mr-3 flex items-center justify-center
            hover:text-textoRojo transition-all duration-300 p-2 rounded-xl hover:bg-red-50"
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <IoMenu className="group-hover:scale-110 transition-transform duration-200" />
        </button>

        {/* Logo */}
        <Link to={"/"} className="flex-shrink-0 group">
          <img
            src={logo}
            alt="Logo"
            className="w-24 h-auto sm:w-28 md:w-32 lg:w-48 max-h-14 sm:max-h-16 object-contain
              group-hover:scale-105 transition-transform duration-300 filter drop-shadow-sm"
          />
        </Link>

        {/* Barra de búsqueda (desktop) */}
        <div className="hidden lg:flex max-w-md xl:max-w-2xl w-full mx-6 relative search-container">
          <div
            className={`flex items-center w-full relative rounded-2xl bg-white
              border-2 transition-all duration-300 px-4 xl:px-5 py-3 shadow-sm hover:shadow-md
              ${searchFocused || searchText
                ? "border-textoRojo shadow-lg ring-4 ring-red-50"
                : "border-gray-200 hover:border-gray-300"
              }`}
          >
            <BiSearchAlt2
              className={`text-xl xl:text-2xl mr-3 transition-all duration-300
                ${searchFocused || searchText ? "text-textoRojo scale-110" : "text-gray-400"}`}
            />
            <input
              type="text"
              onChange={e => setSearchText(e.target.value)}
              value={searchText}
              onFocus={() => setSearchFocused(true)}
              placeholder={isIndexReady ? "¿Qué estás buscando hoy?" : "Cargando productos..."}
              className="w-full bg-transparent text-gray-800 text-sm xl:text-base outline-none
                placeholder:text-gray-400 placeholder:font-normal font-medium"
            />
            {searchText && (
              <button
                onClick={clearSearch}
                className="flex items-center justify-center ml-3 p-1.5 rounded-full
                  hover:bg-red-50 transition-all duration-200 group"
                aria-label="Limpiar búsqueda"
              >
                <IoClose className="text-xl xl:text-2xl text-gray-500 group-hover:text-textoRojo
                  group-hover:scale-110 transition-all duration-200" />
              </button>
            )}
          </div>
        </div>

        {/* Botón búsqueda móvil */}
        <button
          className="lg:hidden group text-2xl sm:text-3xl mr-2 sm:mr-3 hover:text-textoRojo
            transition-all duration-300 p-2 rounded-xl hover:bg-red-50"
          onClick={toggleMobileSearch}
          aria-label="Buscar"
        >
          <BiSearchAlt2 className="group-hover:scale-110 transition-transform duration-200" />
        </button>

        {/* Iconos usuario / favoritos / carrito */}
        <div className="flex items-center gap-x-3 sm:gap-x-4 md:gap-x-5 lg:gap-x-6 text-xl sm:text-2xl md:text-2xl">
          <Link to={"/perfil"} className="group relative hover:text-textoRojo transition-all duration-300 p-2 rounded-xl hover:bg-red-50">
            {currentUser ? (
              <img
                src={currentUser?.avatar}
                alt="profileImg"
                className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover
                  ring-2 ring-transparent group-hover:ring-textoRojo group-hover:scale-110
                  transition-all duration-300 shadow-sm"
              />
            ) : (
              <FiUser className="group-hover:scale-110 transition-transform duration-200" />
            )}
          </Link>

          <Link to={"/favorito"} className="group relative hover:text-textoRojo transition-all duration-300 p-2 rounded-xl hover:bg-red-50">
            <FiStar className="group-hover:scale-110 transition-transform duration-200" />
            <span className="inline-flex items-center justify-center bg-gradient-to-r from-textoAmarillo to-yellow-400
              text-white absolute -top-1 -right-1 text-[9px] sm:text-[10px]
              rounded-full w-4 h-4 sm:w-5 sm:h-5 font-bold shadow-sm ring-2 ring-white
              group-hover:scale-110 transition-transform duration-200">
              {favoriteProduct?.length > 0 ? favoriteProduct.length : "0"}
            </span>
          </Link>

          <Link to={"/carrito"} className="group relative hover:text-textoRojo transition-all duration-300 p-2 rounded-xl hover:bg-red-50">
            <FiShoppingCart className="group-hover:scale-110 transition-transform duration-200" />
            <span className="inline-flex items-center justify-center bg-gradient-to-r from-textoRojo to-red-600
              text-white absolute -top-1 -right-1 text-[9px] sm:text-[10px]
              rounded-full w-4 h-4 sm:w-5 sm:h-5 font-bold shadow-sm ring-2 ring-white
              group-hover:scale-110 transition-transform duration-200">
              {cartProduct?.length > 0 ? cartProduct.length : "0"}
            </span>
          </Link>
        </div>
      </div>

      {/* ── Barra de búsqueda móvil ───────────────────────────────────────── */}
      {mobileSearchOpen && (
        <div className="lg:hidden w-full px-4 sm:px-6 pb-4 search-container">
          <div className="flex items-center relative rounded-2xl bg-white
            border-2 border-textoRojo shadow-lg px-4 py-3 ring-4 ring-red-50">
            <BiSearchAlt2 className="text-xl sm:text-2xl mr-3 text-textoRojo" />
            <input
              type="text"
              onChange={e => setSearchText(e.target.value)}
              value={searchText}
              placeholder={isIndexReady ? "¿Qué estás buscando hoy?" : "Cargando productos..."}
              className="w-full bg-transparent text-gray-800 text-sm sm:text-base outline-none
                placeholder:text-gray-400 placeholder:font-normal font-medium"
              autoFocus
            />
            {searchText && (
              <button
                onClick={clearSearch}
                className="flex items-center justify-center p-1.5 rounded-full
                  hover:bg-red-50 transition-colors duration-200"
                aria-label="Limpiar búsqueda"
              >
                <IoClose className="text-xl sm:text-2xl text-gray-500 hover:text-textoRojo" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Resultados de búsqueda ────────────────────────────────────────── */}
      {searchText && (searchFocused || mobileSearchOpen) && (
        <div className="absolute left-0 right-0 top-full w-full max-h-[75vh] sm:max-h-[80vh]
          px-4 sm:px-6 lg:px-8 py-6 bg-white z-30 overflow-y-auto
          text-black shadow-2xl border-t border-gray-200 backdrop-blur-sm search-results">

          {isSearching ? (
            <div className="py-8 sm:py-12 w-full flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-gray-200 rounded-full
                  border-t-textoRojo animate-spin mb-4"></div>
              </div>
              <p className="text-lg sm:text-xl text-gray-600 font-medium">Buscando productos...</p>
              <p className="text-sm text-gray-400 mt-1">Encontrando las mejores opciones para ti</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="mb-4 sm:mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-textoRojo flex items-center gap-2">
                    <HiOutlineSparkles className="w-5 h-5" />
                    Resultados ({filteredProducts.length})
                  </h3>
                  {filteredProducts.length === 10 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Mostrando los 10 más relevantes
                    </p>
                  )}
                </div>
                <button
                  onClick={clearSearch}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-textoRojo
                    bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  Cerrar <IoClose className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {filteredProducts.map((item: Product) => (
                  <div key={item.idproducto} className="group">
                    <ProductCard item={item} setSearchText={setSearchText} />
                  </div>
                ))}
              </div>

              {filteredProducts.length === 10 && (
                <div className="mt-6 text-center">
                  <Link
                    to={`/productos?busqueda=${encodeURIComponent(searchText)}`}
                    onClick={clearSearch}
                    className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-textoRojo to-red-600
                      text-white rounded-xl hover:from-red-600 hover:to-red-700
                      transition-all duration-300 font-semibold shadow-lg hover:shadow-xl
                      hover:scale-105 transform"
                  >
                    <FaChevronRight className="w-4 h-4" />
                    Ver más resultados
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-red-50 w-full flex flex-col
              items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="text-4xl sm:text-5xl mb-4 text-gray-300">
                <BiSearchAlt2 />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">
                No encontramos productos
              </h3>
              <p className="text-base sm:text-lg font-medium px-4 text-center text-gray-600 mb-1">
                No hay productos que coincidan con{" "}
                <span className="font-bold text-textoRojo bg-red-50 px-2 py-1 rounded">
                  "{searchText}"
                </span>
              </p>
              <p className="text-sm text-gray-500 px-4 text-center max-w-md">
                Intenta con otras palabras clave o navega por nuestras categorías
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Barra de navegación ───────────────────────────────────────────── */}
      <div className="w-full bg-gradient-to-r from-textoRojo via-red-600 to-textoRojo text-white shadow-lg">
        <Container className="py-3 max-w-5xl flex items-center gap-3 sm:gap-4 md:gap-6 justify-between">

          {hasActiveCategories && (
            <div
              className="relative group hidden lg:block"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="inline-flex items-center gap-2 sm:gap-3 rounded-xl bg-white/10 backdrop-blur-sm
                hover:bg-white/20 py-2 sm:py-2.5 px-3 sm:px-4 text-sm sm:text-base lg:text-lg
                font-bold text-white cursor-pointer transition-all duration-300 border border-white/20
                hover:border-white/40 hover:shadow-lg group-hover:scale-105">
                <IoGridOutline className="w-4 h-4 sm:w-5 sm:h-5" />
                <Link to="/productos" className="flex items-center gap-2">
                  PRODUCTOS
                  <FaChevronDown className="text-xs sm:text-sm lg:text-base transform transition-all duration-300 group-hover:rotate-180" />
                </Link>
              </div>

              {showProductsMenu && (
                <div className="absolute left-0 top-full z-50 hidden lg:block">
                  <div className="w-full h-2 bg-transparent"></div>
                  <div
                    className="bg-white border border-gray-200 rounded-xl shadow-xl
                      min-w-[350px] max-w-[850px] w-[85vw] p-4 backdrop-blur-sm"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-textoRojo to-red-600 rounded-lg flex items-center justify-center">
                          <IoGridOutline className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">Portafolio de Productos</h3>
                          <p className="text-xs text-gray-500">Descubre nuestra variedad</p>
                        </div>
                      </div>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
                      {organizeCategories().map((columnCategories, columnIndex) => (
                        <div key={columnIndex} className="space-y-1">
                          {columnCategories.map((category: CategoryWithSubcategories) => (
                            <div
                              key={category.id}
                              className="group relative"
                              onMouseEnter={() => setActiveCategory(category.id)}
                              onMouseLeave={() => setActiveCategory(null)}
                            >
                              <button
                                onClick={() => handleCategoryNavigation(category.slug)}
                                className="group flex items-center gap-2 w-full py-1.5 px-2.5
                                  text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50
                                  hover:to-red-100 hover:text-textoRojo rounded-lg transition-all
                                  duration-300 font-medium border border-transparent
                                  hover:border-red-200 hover:shadow-sm text-left"
                              >
                                <div className="w-1 h-1 bg-textoRojo rounded-full opacity-0
                                  group-hover:opacity-100 transition-all duration-300
                                  group-hover:scale-125 flex-shrink-0" />
                                <span className="group-hover:translate-x-0.5 transition-transform
                                  duration-300 truncate text-sm leading-tight">
                                  {category.nombre}
                                </span>
                                {category.subcategorias?.length && (
                                  <FaChevronRight className="w-2.5 h-2.5 ml-auto opacity-0
                                    group-hover:opacity-100 text-textoRojo transition-all
                                    duration-300 flex-shrink-0" />
                                )}
                              </button>

                              {category.subcategorias?.length && activeCategory === category.id && (
                                <div className="absolute left-full top-0 z-50 ml-1 w-44 sm:w-48 md:w-52
                                  bg-white border border-gray-200 rounded-lg shadow-lg p-2
                                  animate-in slide-in-from-left-2 duration-200
                                  max-w-[calc(100vw-2rem)] overflow-hidden">
                                  <div className="space-y-0.5 max-h-36 sm:max-h-40 overflow-y-auto">
                                    {category.subcategorias.map((subcat: CategoryProps) => (
                                      <button
                                        key={subcat.id}
                                        onClick={() => handleCategoryNavigation(subcat.slug)}
                                        className="flex items-center gap-1.5 w-full py-1.5 px-2
                                          text-xs text-gray-700 rounded-md hover:bg-red-50
                                          hover:text-textoRojo transition-all duration-200
                                          border border-transparent hover:border-red-100 text-left"
                                      >
                                        <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0" />
                                        <span className="truncate leading-tight">{subcat.nombre}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Link
                        to="/productos"
                        className="group inline-flex items-center justify-center w-full py-3 px-4
                          bg-gradient-to-r from-textoRojo to-red-600 text-white rounded-lg
                          hover:from-red-600 hover:to-red-700 transition-all duration-300
                          font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transform"
                        onClick={() => {
                          setShowProductsMenu(false);
                          setActiveCategory(null);
                          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        }}
                      >
                        <HiOutlineSparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                        Ver todos los productos
                        <FaChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Links desktop */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {bottomNavigation.map(({ title, link, icon }) => (
              <Link
                to={link}
                key={title}
                className="group relative uppercase text-xs xl:text-sm font-bold text-white/90
                  hover:text-white transition-all duration-300 py-2 px-3 rounded-lg
                  hover:bg-white/10 flex items-center gap-2 whitespace-nowrap"
              >
                <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
                {title}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white
                  group-hover:w-full group-hover:left-0 transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Links móvil */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
            {bottomNavigation.map(({ title, link, icon }) => (
              <Link
                to={link}
                key={title}
                className="group flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg
                  hover:bg-white/10 transition-all duration-300 whitespace-nowrap
                  text-white/90 hover:text-white text-xs font-medium"
              >
                <span className="group-hover:scale-110 transition-transform duration-200 text-xs">{icon}</span>
                <span className="hidden sm:inline">{title}</span>
              </Link>
            ))}
          </div>
        </Container>
      </div>

      {/* ── Menú móvil ───────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white to-gray-50
              text-gray-800 shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200
              bg-gradient-to-r from-textoRojo to-red-600 text-white">
              <div className="flex items-center gap-3">
                <IoGridOutline className="w-6 h-6" />
                <h2 className="text-xl font-bold">Menú Principal</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <IoClose />
              </button>
            </div>

            <div className="flex flex-col p-6">
              {hasActiveCategories && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 mb-4 border border-red-200">
                  <button
                    onClick={() => setShowMobileCategories(!showMobileCategories)}
                    className="flex items-center justify-between w-full py-3 uppercase font-bold
                      text-base text-textoRojo hover:text-red-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <IoGridOutline className="w-5 h-5" />
                      PRODUCTOS
                    </div>
                    <FaChevronDown className={`transform transition-all duration-300
                      ${showMobileCategories ? "rotate-180 text-red-700" : ""}`} />
                  </button>

                  {showMobileCategories && (
                    <div className="mt-4 space-y-1.5 max-h-60 overflow-y-auto">
                      <Link
                        to="/productos"
                        className="flex items-center gap-3 py-2.5 px-3 text-sm font-medium text-gray-700
                          hover:text-textoRojo hover:bg-white rounded-lg transition-all duration-200
                          border border-transparent hover:border-red-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <HiOutlineSparkles className="w-4 h-4" />
                        Ver todos los productos
                      </Link>

                      {categories.map((category: CategoryWithSubcategories) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryNavigation(category.slug)}
                          className="flex items-center gap-3 py-2.5 px-3 text-sm text-gray-600 w-full text-left
                            hover:text-textoRojo hover:bg-white rounded-lg transition-all duration-200
                            border border-transparent hover:border-red-200"
                        >
                          <div className="w-1.5 h-1.5 bg-textoRojo rounded-full flex-shrink-0" />
                          <span className="truncate">{category.nombre}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {bottomNavigation.map(({ title, link, icon }) => (
                  <Link
                    key={title}
                    to={link}
                    className="flex items-center gap-4 py-4 px-4 uppercase font-bold text-sm
                      text-gray-700 hover:text-textoRojo hover:bg-red-50 rounded-xl
                      transition-all duration-300 border border-transparent hover:border-red-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-textoRojo flex-shrink-0">{icon}</span>
                    <span className="truncate">{title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;