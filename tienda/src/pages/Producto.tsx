import { useEffect, useLayoutEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { config } from "../../config";
import { Product, CategoryProps } from "../../type";
import { getData } from "../lib";
import Loading from "../ui/Loading";
import Container from "../ui/Container";
import { MdStar, MdStarHalf, MdOutlineStarOutline } from "react-icons/md";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import { HiAdjustments } from "react-icons/hi";
import FormatoPrecio from "../ui/FormatoPrecio";
import AddToCartBtn from "../ui/AddToCartBtn";
import ProductCard from "../ui/ProductCard";
import Filters from "../ui/Filtros";
import SkeletonProductCard from "../ui/SkeletonProductCard";
import ReviewsSection from "../ui/Review";
import ProductDescription from "../ui/DescripcionProducto";
import CaracteristicaProducto from "../ui/CaracteristicaProducto";
import { getProductImage } from "../../utils/imageUtils";
import toast from "react-hot-toast";

interface Review {
  id: number;
  id_producto: number;
  nombre_cliente: string;
  calificacion: number;
  comentario?: string;
  fecha_review: string | Date;
  aprobado: boolean;
}

const ITEMS_PER_PAGE = 28;
const MAX_PRICE = 20000000;
const DEFAULT_PRICE_RANGE: [number, number] = [0, MAX_PRICE];

interface ProductsApiResponse {
  productos: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface CategoryWithSubcategories extends CategoryProps {
  subcategorias?: CategoryProps[];
}

const readSavedProductsViewState = () => {
  if (typeof window === "undefined") return null;

  const saved = sessionStorage.getItem("productsViewState");
  if (!saved) return null;

  try {
    return JSON.parse(saved) as {
      scrollY?: number;
      search?: string;
      page?: number;
      productId?: number;
      timestamp?: number;
    };
  } catch {
    return null;
  }
};

const Producto = () => {
  const { id } = useParams<{ id: string }>();
  const [savedProductsViewState, setSavedProductsViewState] = useState<ReturnType<typeof readSavedProductsViewState>>(() => (!id ? readSavedProductsViewState() : null));
  const [productData, setProductData] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (!savedProductsViewState?.search) return "";
    return new URLSearchParams(savedProductsViewState.search).get("categoria") || "";
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    if (!savedProductsViewState?.search) return "";
    return new URLSearchParams(savedProductsViewState.search).get("busqueda") || "";
  });
  const [sortBy, setSortBy] = useState("rating_desc");
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState<Product["colores"][0] | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    if (!savedProductsViewState?.search) return DEFAULT_PRICE_RANGE;
    const params = new URLSearchParams(savedProductsViewState.search);
    return [
      params.get("precioMin") ? Number(params.get("precioMin")) : DEFAULT_PRICE_RANGE[0],
      params.get("precioMax") ? Number(params.get("precioMax")) : DEFAULT_PRICE_RANGE[1]
    ];
  });
  const [offerOnly, setOfferOnly] = useState(() => {
    if (!savedProductsViewState?.search) return false;
    const params = new URLSearchParams(savedProductsViewState.search);
    return params.get("oferta") === "1" || params.get("oferta") === "true";
  });
  const [stockOnly, setStockOnly] = useState(() => {
    if (!savedProductsViewState?.search) return false;
    const params = new URLSearchParams(savedProductsViewState.search);
    return params.get("stock") === "1" || params.get("stock") === "true";
  });
  const [currentPage, setCurrentPage] = useState(() => savedProductsViewState?.page || 1);
  const [categorySelected, setCategorySelected] = useState<CategoryProps | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  const requestAbortRef = useRef<AbortController | null>(null);
  const previousIdRef = useRef<string | undefined>(id);
  const restorationHandledRef = useRef(false);

  const [isRestoringState, setIsRestoringState] = useState(() => !!savedProductsViewState && !id);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousScrollRestoration = window.history.scrollRestoration;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  useEffect(() => {
    const wasDetailPage = !!previousIdRef.current;
    const isReturningToList = wasDetailPage && !id;

    if (isReturningToList) {
      restorationHandledRef.current = false;
      const restoredState = readSavedProductsViewState();
      setSavedProductsViewState(restoredState);
      setIsRestoringState(!!restoredState);

      if (restoredState?.search) {
        const params = new URLSearchParams(restoredState.search);
        setSelectedCategory(params.get("categoria") || "");
        setSearchQuery(params.get("busqueda") || "");
        setPriceRange([
          params.get("precioMin") ? Number(params.get("precioMin")) : DEFAULT_PRICE_RANGE[0],
          params.get("precioMax") ? Number(params.get("precioMax")) : DEFAULT_PRICE_RANGE[1]
        ]);
        setOfferOnly(params.get("oferta") === "1" || params.get("oferta") === "true");
        setStockOnly(params.get("stock") === "1" || params.get("stock") === "true");
        setCurrentPage(restoredState.page || 1);
      }
    }

    previousIdRef.current = id;
  }, [id]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));

  const getUrlParams = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    return {
      categoria: urlParams.get('categoria') || '',
      busqueda: urlParams.get('busqueda') || '',
      precioMin: urlParams.get('precioMin') ? Number(urlParams.get('precioMin')) : 0,
      precioMax: urlParams.get('precioMax') ? Number(urlParams.get('precioMax')) : MAX_PRICE,
      oferta: urlParams.get('oferta') === '1' || urlParams.get('oferta') === 'true',
      stock: urlParams.get('stock') === '1' || urlParams.get('stock') === 'true'
    };
  }, [location.search]);

  const getCategoriaApiValue = useCallback((slug: string): string | null => {
    if (!slug || categories.length === 0) return null;

    const parent = categories.find((cat) => cat.slug === slug);
    if (parent) return parent.nombre;

    for (const cat of categories) {
      const child = cat.subcategorias?.find((sub) => sub.slug === slug);
      if (child) return `${cat.nombre} → ${child.nombre}`;
    }

    return null;
  }, [categories]);

  const applySort = useCallback((products: Product[]) => {
    const sorted = [...products];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.nombreproducto.localeCompare(b.nombreproducto);
        case "name_desc":
          return b.nombreproducto.localeCompare(a.nombreproducto);
        case "price_asc":
          return (a.lista1 || 0) - (b.lista1 || 0);
        case "price_desc":
          return (b.lista1 || 0) - (a.lista1 || 0);
        case "rating_desc":
          return (b.puntuacionPromedio || 0) - (a.puntuacionPromedio || 0);
        default:
          return 0;
      }
    });
    return sorted;
  }, [sortBy]);

  const fetchProducts = useCallback(async (pageToLoad: number) => {
    if (id) return;

    if (requestAbortRef.current) {
      requestAbortRef.current.abort();
    }

    const controller = new AbortController();
    requestAbortRef.current = controller;

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", pageToLoad.toString());
      params.set("limit", ITEMS_PER_PAGE.toString());
      params.set("visibilidad", "visibles");
      params.set("cantidadMin", "1");

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const categoriaApi = getCategoriaApiValue(selectedCategory);
      if (selectedCategory && categoriaApi) {
        params.set("categoria", categoriaApi);
      }

      if (priceRange[0] > DEFAULT_PRICE_RANGE[0]) {
        params.set("precioMin", priceRange[0].toString());
      }

      if (priceRange[1] < DEFAULT_PRICE_RANGE[1]) {
        params.set("precioMax", priceRange[1].toString());
      }

      if (offerOnly) {
        params.set("oferta", "1");
      }

      if (stockOnly) {
        params.set("stock", "1");
      }

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

      const data: ProductsApiResponse = await response.json();

      if (requestAbortRef.current !== controller) return;

      setFilteredProducts(applySort(data.productos || []));
      setTotalProducts(data.total || 0);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("❌ Error al cargar productos:", error);
      toast.error("Error al cargar los productos");
      setFilteredProducts([]);
      setTotalProducts(0);
    } finally {
      if (requestAbortRef.current === controller) {
        setLoading(false);
      }
    }
  }, [id, searchQuery, selectedCategory, priceRange, getCategoriaApiValue, applySort]);

  useEffect(() => {
    return () => {
      if (requestAbortRef.current) {
        requestAbortRef.current.abort();
        requestAbortRef.current = null;
      }
    };
  }, []);

  // ─── Carga de detalle de producto ─────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      setProductData(null);
      setReviews([]);
      return;
    }

    const fetchProductData = async () => {
      try {
        setLoading(true);
        setImgUrl("");
        setSelectedColor(null);

        const data = await getData(`${config?.baseUrl}${config?.apiPrefix}/products/${id}`);

        if (data && (!data.activo || (data.cantidad || 0) <= 0)) {
          navigate('/productos');
          toast.error('Este producto no está disponible o está agotado');
          return;
        }

        setProductData(data);

        const reviewsResponse = await getData(`${config?.baseUrl}${config?.apiPrefix}/reviews?productId=${id}`);
        if (Array.isArray(reviewsResponse)) {
          const filteredReviews = reviewsResponse.filter(review => review.id_producto === Number(id));
          setReviews(filteredReviews);
        }
      } catch (error) {
        console.error("❌ Error al cargar detalle del producto:", error);
        toast.error('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate]);

  // ─── Carga árbol de categorías activas para filtros ──────────────────────
  useEffect(() => {
    if (id) return;

    const fetchCategories = async () => {
      try {
        const categoriesData = await getData(`${config?.baseUrl}${config?.apiPrefix}/categories`);
        const categoriasActivas = categoriesData.filter((cat: CategoryProps) => cat.activo === true);
        const parentCategories = categoriasActivas.filter((cat: CategoryProps) => cat.padre_id === null);
        const childCategories = categoriasActivas.filter((cat: CategoryProps) => cat.padre_id !== null);

        const categoriesWithSubcategories: CategoryWithSubcategories[] = parentCategories.map((parent: CategoryProps) => ({
          ...parent,
          subcategorias: childCategories.filter((child: CategoryProps) => child.padre_id === parent.id),
        }));

        setCategories(categoriesWithSubcategories);
      } catch (error) {
        console.error("❌ Error cargando categorías:", error);
      }
    };

    fetchCategories();
  }, [id]);

  // ─── Detecta cambios en URL ───────────────────────────────────────────────
  useEffect(() => {
    if (id) return;

    const { categoria, busqueda, precioMin, precioMax, oferta, stock } = getUrlParams();
    setSelectedCategory(categoria);
    setSearchQuery(busqueda);
    setPriceRange([precioMin, precioMax]);
    setOfferOnly(!!oferta);
    setStockOnly(!!stock);
  }, [location.search, getUrlParams, id]);

  // ─── Carga de productos paginados con filtros en servidor ────────────────
  useEffect(() => {
    if (id) return;
    fetchProducts(currentPage);
  }, [id, currentPage, fetchProducts]);

  useLayoutEffect(() => {
    if (id || !isRestoringState || restorationHandledRef.current || loading || filteredProducts.length === 0) return;

    const savedProductId = savedProductsViewState?.productId;
    const productAnchor = savedProductId
      ? document.querySelector(`[data-product-id="${savedProductId}"]`)
      : null;

    if (productAnchor instanceof HTMLElement) {
      const elementTop = productAnchor.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: Math.max(elementTop - 72, 0), behavior: "auto" });
    } else {
      const scrollY = savedProductsViewState?.scrollY || 0;
      window.scrollTo({ top: scrollY, behavior: "auto" });
    }

    setIsRestoringState(false);
    restorationHandledRef.current = true;
    sessionStorage.removeItem("productsViewState");
  }, [id, isRestoringState, loading, filteredProducts.length, savedProductsViewState]);

  // ─── Reordenar resultados actuales sin recargar API ──────────────────────
  useEffect(() => {
    if (id || filteredProducts.length === 0) return;
    setFilteredProducts((prev) => applySort(prev));
  }, [sortBy, id, applySort]);

  // ─── Scroll al top al ver producto individual ─────────────────────────────
  useLayoutEffect(() => {
    if (id) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  // ─── Resuelve la categoría seleccionada en el árbol ───────────────────────
  useEffect(() => {
    if (categories.length === 0 || !selectedCategory) {
      setCategorySelected(null);
      return;
    }

    let foundCategory: CategoryProps | undefined;

    foundCategory = categories.find(cat => cat.slug === selectedCategory);

    if (!foundCategory) {
      for (const parent of categories) {
        if (parent.subcategorias && Array.isArray(parent.subcategorias)) {
          foundCategory = parent.subcategorias.find(
            sub => sub.slug === selectedCategory && sub.activo === true
          );
          if (foundCategory) break;
        }
      }
    }

    console.log('📂 Categoría seleccionada:', foundCategory?.nombre || 'Ninguna');
    setCategorySelected(foundCategory || null);
  }, [selectedCategory, categories]);

  // ─── Cambio de categoría ──────────────────────────────────────────────────
  const handleCategoryChange = useCallback((category: string) => {
    const params = new URLSearchParams(location.search);
    if (category) {
      params.set("categoria", category);
    } else {
      params.delete("categoria");
    }
    navigate(`/productos${params.toString() ? `?${params.toString()}` : ""}`);
    setCurrentPage(1);
  }, [location.search, navigate]);
  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    const params = new URLSearchParams(location.search);
    if (range[0] > 0) {
      params.set("precioMin", range[0].toString());
    } else {
      params.delete("precioMin");
    }

    if (range[1] < MAX_PRICE) {
      params.set("precioMax", range[1].toString());
    } else {
      params.delete("precioMax");
    }

    navigate(`/productos${params.toString() ? `?${params.toString()}` : ""}`);
    setCurrentPage(1);
  }, [location.search, navigate]);

  // ─── Imagen y color inicial del producto individual ───────────────────────
  useEffect(() => {
    if (productData?.imagenes) setImgUrl(getProductImage(productData.imagenes));
    if (productData?.colores) setSelectedColor(productData.colores[0] || null);
  }, [productData]);

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
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
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

  const getCategoriesDisplay = (categorias: any[]) => {
    if (!Array.isArray(categorias) || categorias.length === 0) return "Sin categoría";

    const subcategorias = categorias.filter(cat => {
      const categoria = cat.categoria || cat;
      return categoria.padre_id !== null && categoria.padre_id !== undefined;
    });

    if (subcategorias.length > 0) {
      return subcategorias.map(item => {
        const categoria = item.categoria || item;
        return categoria.nombre || "Sin nombre";
      }).join(", ");
    }

    const categoriasPadre = categorias.filter(cat => {
      const categoria = cat.categoria || cat;
      return categoria.padre_id === null || categoria.padre_id === undefined;
    });

    if (categoriasPadre.length > 0) {
      return categoriasPadre.map(item => {
        const categoria = item.categoria || item;
        return categoria.nombre || "Sin nombre";
      }).join(", ");
    }

    return "Sin categoría";
  };

  const isLista2Active = productData?.lista2_activa === true;
  const hasLista2Price = productData?.lista2 && productData.lista2 > 0;
  const showLista2 = isLista2Active && hasLista2Price;

  if (loading && !id && filteredProducts.length === 0 && !isRestoringState) return <Loading />;

  // ─── VISTA INDIVIDUAL DEL PRODUCTO ───────────────────────────────────────
  if (id && productData) {
    return (
      <Container>
        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex md:flex-col gap-2 order-2 md:order-1">
                {productData.imagenes.map((item, index) => (
                  <img
                    src={getProductImage([item])}
                    alt={item.alt_text || "Imagen del producto"}
                    key={item.id ?? index}
                    className={`w-24 h-24 object-cover cursor-pointer rounded-lg ${imgUrl === getProductImage([item])
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

            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold">{productData.nombreproducto}</h2>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  {showLista2 && productData.lista2 > productData.lista1 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-green-600">
                        <FormatoPrecio amount={productData.lista1} />
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        <FormatoPrecio amount={productData.lista2} />
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        ¡Oferta!
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      <FormatoPrecio amount={productData.lista1} />
                    </span>
                  )}
                </div>

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

              {showLista2 && productData.lista2 > productData.lista1 && (
                <p className="text-lg">
                  Estás ahorrando
                  <span className="text-base font-semibold text-green-500 ml-2">
                    <FormatoPrecio amount={productData.lista2 - productData.lista1} />
                  </span>{" "}
                  al comprar
                </p>
              )}

              <div className="flex items-center gap-2">
                {(productData.cantidad || 0) > 0 ? (
                  <span className="text-green-600 font-semibold">
                    ✓ En stock ({productData.cantidad} disponibles)
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">✗ Agotado</span>
                )}
              </div>

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
                      className={`${item.codigoHex === selectedColor?.codigoHex
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
                  {getCategoriesDisplay(productData?.categorias || [])}
                </span>
              </p>
              <br />

              {(productData.cantidad || 0) > 0 ? (
                <AddToCartBtn
                  product={productData}
                  title="Comprar ahora"
                  className="bg-black/80 py-3 text-base text-gray-200 hover:text-white duration-200"
                  showPrice={false}
                />
              ) : (
                <button
                  disabled
                  className="bg-gray-400 py-3 text-base text-gray-200 cursor-not-allowed rounded-md"
                >
                  Producto agotado
                </button>
              )}

              <div className="bg-[#f7f7f7] p-5 rounded-md flex flex-col items-center justify-center gap-2">
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

  // ─── VISTA DE LISTADO DE PRODUCTOS ───────────────────────────────────────
  const busqueda = searchQuery;

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 sticky top-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <HiAdjustments className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              </div>
              <Filters
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                onCategoryChange={handleCategoryChange}
                onPriceRangeChange={handlePriceRangeChange}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-700">
                  <span className="font-bold">{totalProducts}</span> productos encontrados
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCategory && categorySelected && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm border border-red-200">
                      <span>Categoría: {categorySelected.nombre}</span>
                      <button onClick={() => handleCategoryChange("")} className="hover:text-red-800">
                        <IoClose className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {busqueda && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-200">
                      <span>Búsqueda: "{busqueda}"</span>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(location.search);
                          params.delete("busqueda");
                          navigate(`/productos${params.toString() ? `?${params.toString()}` : ""}`);
                        }}
                        className="hover:text-blue-800"
                      >
                        <IoClose className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-700 text-sm hidden sm:block">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rating_desc">Mejor valorados</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                  <option value="name_asc">A-Z</option>
                  <option value="name_desc">Z-A</option>
                </select>
              </div>
            </div>

            {loading && filteredProducts.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="group">
                    {/* @ts-ignore */}
                    <SkeletonProductCard />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-6">
                  {busqueda
                    ? `No hay productos que coincidan con "${busqueda}"`
                    : selectedCategory && categorySelected
                      ? `No hay productos disponibles en la categoría "${categorySelected.nombre}"`
                      : "Intenta ajustar los filtros o busca productos diferentes"}
                </p>
                <button
                  onClick={() => {
                    handleCategoryChange("");
                    setPriceRange(DEFAULT_PRICE_RANGE);
                    const params = new URLSearchParams(location.search);
                    params.delete("busqueda");
                    params.delete("categoria");
                    navigate(`/productos${params.toString() ? `?${params.toString()}` : ""}`);
                    setCurrentPage(1);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4">
                  {filteredProducts.map((item: Product) => (
                    <div key={item.idproducto} className="group">
                      <ProductCard item={item} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col items-center">
                    <div className="flex items-center gap-1">
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
                          aria-label={typeof pageNum === 'number' ? `Ir a la página ${pageNum}` : undefined}
                          className={`px-4 py-2 text-sm rounded-md transition-colors ${pageNum === currentPage
                              ? "bg-orange-500 text-white"
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

                    {categorySelected?.enlaceDestacado && (
                      <a
                        href={categorySelected.enlaceDestacado}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:shadow-xl transform hover:scale-105"
                      >
                        <span>Ver más productos de {categorySelected.nombre}</span>
                        <IoChevronForward className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Producto;