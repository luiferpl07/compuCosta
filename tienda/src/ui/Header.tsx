import { useEffect, useState, useDeferredValue, useCallback, useRef } from "react";
import { debounce } from "lodash";
import { logo } from "../assets";
import { IoClose, IoMenu } from "react-icons/io5";
import { FiShoppingCart, FiStar, FiUser } from "react-icons/fi";
import { BiSearchAlt2 } from "react-icons/bi"; // Nuevo icono de búsqueda
import Container from "./Container";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { config } from "../../config";
import { getData } from "../lib";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { CategoryProps, Product } from "../../type";
import ProductCard from "./ProductCard";
import { store } from "../lib/store";

const bottomNavigation = [
  { title: "INICIO", link: "/" },
  { title: "PRODUCTOS", link: "/productos" },
  { title: "PEDIDOS", link: "/pedidos" },
  { title: "SERVICIOS", link: "/Servicio"},
  { title: "ACERCA DE NOSOTROS", link: "/Acerca De Nosotros"}
];

// Número de categorías a mostrar antes de "Ver todas"
const CATEGORIES_TO_SHOW = 8;

const Header = () => {
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const deferredSearch = useDeferredValue(searchText);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchIndexRef = useRef<{[key: string]: Product[]}>({});
  const { cartProduct, favoriteProduct, currentUser } = store();

  // 🔥 1️⃣ Cargar categorías y productos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await getData(`${config?.baseUrl}${config?.apiPrefix}/categories`);
        setCategories(categoryData);

        const productData = await getData(`${config?.baseUrl}${config?.apiPrefix}/products`);
        setProducts(productData);
        
        // Crear índice de búsqueda para mejorar rendimiento
        const index: {[key: string]: Product[]} = {};
        
        // Crear índices por nombre de producto para búsqueda rápida
        productData.forEach((product: Product) => {
          const words = product.nombreproducto.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 2) { // Ignorar palabras muy cortas
              if (!index[word]) {
                index[word] = [];
              }
              if (!index[word].includes(product)) {
                index[word].push(product);
              }
            }
          });
          
          // También indexar por descripción si existe
          if (product.descripcion) {
            const descWords = product.descripcion.toLowerCase().split(/\s+/);
            descWords.forEach(word => {
              if (word.length > 2) { // Ignorar palabras muy cortas
                if (!index[word]) {
                  index[word] = [];
                }
                if (!index[word].includes(product)) {
                  index[word].push(product);
                }
              }
            });
          }
        });
        
        searchIndexRef.current = index;
      } catch (error) {
        console.error("Error al obtener datos", error);
      }
    };
    fetchData();
  }, []);

  // 🔥 2️⃣ Sistema de búsqueda completamente reescrito
  const filterProducts = useCallback(
    debounce((query: string) => {
      // Limpiar la búsqueda anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Si no hay texto de búsqueda, limpiar resultados
      if (!query.trim()) {
        setFilteredProducts([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      
      // Usar búsqueda indexada para mejor rendimiento
      searchTimeoutRef.current = setTimeout(() => {
        try {
          const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
          
          // Si tenemos índice de búsqueda, usarlo para búsqueda rápida
          if (Object.keys(searchIndexRef.current).length > 0) {
            let results: Product[] = [];
            let matchedProducts = new Set<number>();
            
            // Buscar productos que coincidan con al menos un término
            searchTerms.forEach(term => {
              // Buscar coincidencias exactas primero
              Object.keys(searchIndexRef.current).forEach(indexTerm => {
                if (indexTerm.includes(term)) {
                  searchIndexRef.current[indexTerm].forEach(product => {
                    if (!matchedProducts.has(product.idproducto)) {
                      results.push(product);
                      matchedProducts.add(product.idproducto);
                    }
                  });
                }
              });
            });
            
            // Ordenar resultados por relevancia (productos que contienen más términos primero)
            results.sort((a, b) => {
              const aMatchCount = searchTerms.filter(term => 
                a.nombreproducto.toLowerCase().includes(term) || 
                a.descripcion?.toLowerCase().includes(term)
              ).length;
              
              const bMatchCount = searchTerms.filter(term => 
                b.nombreproducto.toLowerCase().includes(term) || 
                b.descripcion?.toLowerCase().includes(term)
              ).length;
              
              return bMatchCount - aMatchCount;
            });
            
            setFilteredProducts(results.slice(0, 10)); // Limitar a 20 resultados para mejor rendimiento
          } else {
            // Fallback a búsqueda simple si no hay índice
            const result = products
              .filter(item => {
                const nameLower = item.nombreproducto.toLowerCase();
                const descLower = item.descripcion?.toLowerCase() || '';
                return searchTerms.some(term => 
                  nameLower.includes(term) || descLower.includes(term)
                );
              })
              .slice(0, 10); // Limitar resultados
              
            setFilteredProducts(result);
          }
        } catch (error) {
          console.error("Error en búsqueda:", error);
          // Fallback a búsqueda simple
          const queryLower = query.toLowerCase();
          const result = products
            .filter(item => 
              item.nombreproducto.toLowerCase().includes(queryLower) ||
              item.descripcion?.toLowerCase().includes(queryLower)
            )
            .slice(0, 20);
            
          setFilteredProducts(result);
        } finally {
          setIsSearching(false);
        }
      }, 250);
      
      // Limpieza
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }, 300), // Mayor tiempo de debounce para reducir actualizaciones
    [products]
  );

  // 🔥 3️⃣ Ejecutar el filtro cuando `deferredSearch` cambie
  useEffect(() => {
    const cleanup = filterProducts(deferredSearch);
    return cleanup;
  }, [deferredSearch, filterProducts]);

  // Toggle para el menú móvil
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Cerrar búsqueda si está abierta
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  // Toggle para la búsqueda móvil
  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    // Cerrar menú si está abierto
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchText("");
    setFilteredProducts([]);
  };

  // Manejar clic fuera del componente de búsqueda
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container") && searchText) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchText]);

  return (
    <div className="w-full bg-textoBlanco md:sticky md:top-0 z-50">
      {/* 🔹 Barra superior con logo y búsqueda */}
      <div className="max-w-screen-xl mx-auto min-h-[5rem] flex items-center justify-between px-4 lg:px-0">
        {/* Botón de menú móvil */}
        <button 
          className="md:hidden text-2xl mr-2 flex items-center justify-center" 
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <IoMenu />
        </button>
        
        <Link to={"/"} className="flex-shrink-0">
          <img src={logo} alt="Logo" className="w-28 md:w-44" />
        </Link>

        {/* 🔍 Barra de búsqueda (escritorio) - REDISEÑADA */}
        <div className="hidden md:flex max-w-3xl w-full relative search-container">
          <div className={`flex items-center w-full relative rounded-full bg-gray-50 
            border transition-all duration-300 px-4 py-2 
            ${searchFocused || searchText ? 
              'border-textoRojo shadow-md' : 
              'border-gray-300'}`}>
            
            <BiSearchAlt2 className={`text-xl mr-2 transition-colors duration-300
              ${searchFocused || searchText ? 'text-textoRojo' : 'text-gray-400'}`} />
            
            <input
              type="text"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              onFocus={() => setSearchFocused(true)}
              placeholder="¿Qué estás buscando hoy?"
              className="w-full bg-transparent text-gray-900 text-base outline-none
                placeholder:text-gray-400 placeholder:font-normal"
            />
            
            {searchText && (
              <button
                onClick={clearSearch}
                className="flex items-center justify-center ml-2 p-1 rounded-full
                  hover:bg-gray-200 transition-colors duration-200"
                aria-label="Limpiar búsqueda"
              >
                <IoClose className="text-xl text-gray-600 hover:text-textoRojo" />
              </button>
            )}
          </div>
        </div>

        {/* 🔍 Botón de búsqueda (móvil) */}
        <button 
          className="md:hidden text-2xl mr-2" 
          onClick={toggleMobileSearch}
          aria-label="Buscar"
        >
          <BiSearchAlt2 className="hover:text-textoRojo transition-colors duration-200" />
        </button>

        {/* 🔹 Menú de usuario y carrito */}
        <div className="flex items-center gap-x-3 md:gap-x-6 text-xl md:text-2xl">
          <Link to={"/perfil"}>
            {currentUser ? (
              <img
                src={currentUser?.avatar}
                alt="profileImg"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
              />
            ) : (
              <FiUser className="hover:text-skyText duration-200 cursor-pointer" />
            )}
          </Link>

          <Link to={"/favorito"} className="relative block">
            <FiStar className="hover:text-textoRojo duration-200 cursor-pointer" />
            <span className="inline-flex items-center justify-center bg-textoAmarillo
              text-whiteText absolute -top-1 -right-2 text-[9px] rounded-full w-4 h-4">
              {favoriteProduct?.length > 0 ? favoriteProduct.length : "0"}
            </span>
          </Link>

          <Link to={"/carrito"} className="relative block">
            <FiShoppingCart className="hover:text-textoRojo duration-200 cursor-pointer" />
            <span className="inline-flex items-center justify-center bg-textoAmarillo
              text-whiteText absolute -top-1 -right-2 text-[9px] rounded-full w-4 h-4">
              {cartProduct?.length > 0 ? cartProduct.length : "0"}
            </span>
          </Link>
        </div>
      </div>

      {/* 🔍 Barra de búsqueda móvil - REDISEÑADA */}
      {mobileSearchOpen && (
        <div className="md:hidden w-full px-4 pb-3 search-container">
          <div className={`flex items-center relative rounded-full bg-gray-50 
            border border-textoRojo shadow-md px-3 py-2`}>
            
            <BiSearchAlt2 className="text-xl mr-2 text-textoRojo" />
            
            <input
              type="text"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              placeholder="¿Qué estás buscando hoy?"
              className="w-full bg-transparent text-gray-900 text-base outline-none
                placeholder:text-gray-400 placeholder:font-normal"
              autoFocus
            />
            
            {searchText && (
              <button
                onClick={clearSearch}
                className="flex items-center justify-center p-1 rounded-full
                  hover:bg-gray-200 transition-colors duration-200"
                aria-label="Limpiar búsqueda"
              >
                <IoClose className="text-xl text-gray-600 hover:text-textoRojo" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🔍 Resultados de búsqueda - MEJORADA Y OPTIMIZADA */}
      {searchText && (searchFocused || mobileSearchOpen) && (
        <div className="absolute left-0 top-20 w-full mx-auto max-h-[80vh] px-4 md:px-10 py-5 
          bg-white z-20 overflow-y-auto text-black shadow-lg rounded-b-lg 
          border-t border-gray-100 scrollbar-hide">
          
          {isSearching ? (
            <div className="py-8 w-full flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-200 rounded-full border-t-textoRojo animate-spin mb-4"></div>
              <p className="text-lg text-gray-600">Buscando productos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-textoRojo">
                  Resultados ({filteredProducts.length})
                  {filteredProducts.length === 10 && <span className="text-sm font-normal text-gray-500 ml-2">mostrando los primeros 10</span>}
                </h3>
                <button 
                  onClick={clearSearch}
                  className="text-sm text-gray-500 hover:text-textoRojo flex items-center"
                >
                  Cerrar <IoClose className="ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredProducts.map((item) => (
                  <ProductCard key={item.idproducto} item={item} setSearchText={setSearchText} />
                ))}
              </div>
              
              {filteredProducts.length === 10 && (
                <div className="mt-4 text-center">
                  <Link 
                    to={`/productos?busqueda=${searchText}`}
                    onClick={clearSearch}
                    className="inline-block py-2 px-4 bg-textoRojo text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Ver más resultados
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 bg-gray-50 w-full flex flex-col items-center justify-center 
              border border-gray-200 rounded-lg">
              <BiSearchAlt2 className="text-4xl text-gray-400 mb-3" />
              <p className="text-lg font-normal px-4 text-center text-gray-600">
                No hay productos que coincidan con{" "}
                <span className="font-semibold text-textoRojo">
                  "{searchText}"
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Intenta con otras palabras o navega por las categorías
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Menú de navegación */}
      <div className="w-full bg-textoRojo text-textoBlanco">
        <Container className="py-2 max-w-4xl flex items-center gap-3 md:gap-5 justify-between">
          <Menu>
            <MenuButton className="inline-flex items-center gap-1 md:gap-2 rounded-md border border-gray-50 hover:border-white py-1 md:py-1.5 px-2 md:px-3 text-sm md:text-base font-semibold text-gray-100 hover:text-textoBlanco">
              Categorias <FaChevronDown className="text-sm md:text-base mt-1" />
            </MenuButton>
            <Transition
              enter="transition ease-out duration-75"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <MenuItems
                anchor="bottom end"
                className="w-48 md:w-52 origin-top-right rounded-xl border border-white bg-red-600 p-1 text-xs/6 md:text-sm/6 text-gray-200 [--anchor-gap:var(--spacing-1)] focus:outline-none hover:text-white z-50"
              >
                {/* Mostrar solo las primeras CATEGORIES_TO_SHOW categorías */}
                {categories.slice(0, CATEGORIES_TO_SHOW).map((item: CategoryProps) => (
                  <MenuItem key={item?.id}>
                    <Link
                      to={`/productos?categoria=${item?.slug}`}
                      className="flex w-full items-center gap-2 rounded-lg py-1.5 md:py-2 px-2 md:px-3 data-[focus]:bg-white/20 tracking-wide"
                    >
                      {item?.nombre}
                    </Link>
                  </MenuItem>
                ))}
                
                {/* Opción "Ver todas" si hay más categorías que el límite */}
                {categories.length > CATEGORIES_TO_SHOW && (
                  <MenuItem>
                    <Link
                      to="/productos"
                      className="flex w-full items-center gap-2 rounded-lg py-1.5 md:py-2 px-2 md:px-3 data-[focus]:bg-white/20 tracking-wide font-medium border-t border-white/20 mt-1"
                    >
                      Ver todas
                    </Link>
                  </MenuItem>
                )}
              </MenuItems>
            </Transition>
          </Menu>
          
          {/* Enlaces de navegación (escritorio) */}
          {bottomNavigation.map(({ title, link }) => (
            <Link 
              to={link}
              key={title} 
              className="uppercase hidden md:inline-flex text-sm 
                font-semibold text-textoBlanco/90 hover:text-textoBlanco duration-200
                relative overflow-hidden group"
            > 
              {title}
              <span className="inline-flex w-full h-[1px] bg-textoBlanco absolute bottom-0 left-0 transform -translate-x-[105%] group-hover:translate-x-0 duration-300" />
            </Link>
          ))}
        </Container>
      </div>

      {/* 🔹 Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute z-50 top-20 left-0 right-0 bg-textoRojo text-textoBlanco shadow-lg">
          <div className="flex flex-col p-4">
            {bottomNavigation.map(({ title, link }) => (
              <Link
                key={title}
                to={link}
                className="py-3 uppercase font-semibold border-b border-white/20 last:border-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                {title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;