import { useEffect, useMemo, useState } from "react";
import { config } from "../../config";
import { getData } from "../lib";
import { RotatingLines } from "react-loader-spinner";
import { CategoryProps } from "../../type";
import { ChevronDown, ChevronRight, Search, Sliders, X } from "lucide-react";

interface FiltersProps {
  selectedCategory: string;
  priceRange: [number, number];
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
}

const MAX_PRICE = 20000000;

const Filters = ({
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
}: FiltersProps) => {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, CategoryProps[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [categorySelected, setCategorySelected] = useState<CategoryProps | null>(null);

  useEffect(() => {
    setTempPriceRange(priceRange);
  }, [priceRange]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getData(`${config.baseUrl}${config.apiPrefix}/categories`);

        const categoriasActivas = data.filter((cat: CategoryProps) => cat.activo === true);
        const parentCategories = categoriasActivas.filter((cat: CategoryProps) => cat.padre_id === null);
        const childCategories = categoriasActivas.filter((cat: CategoryProps) => cat.padre_id !== null);

        const subcategoriesGrouped: Record<number, CategoryProps[]> = {};
        childCategories.forEach((sub: CategoryProps) => {
          const padreActivo = parentCategories.find((padre: CategoryProps) => padre.id === sub.padre_id);
          if (padreActivo && sub.padre_id) {
            if (!subcategoriesGrouped[sub.padre_id]) {
              subcategoriesGrouped[sub.padre_id] = [];
            }
            subcategoriesGrouped[sub.padre_id].push(sub);
          }
        });

        setCategories(parentCategories);
        setSubcategoriesMap(subcategoriesGrouped);

        if (selectedCategory) {
          const selectedCat = categoriasActivas.find((cat: CategoryProps) => cat.slug === selectedCategory);
          if (selectedCat?.padre_id) {
            setExpandedCategories((prev) => new Set([...prev, selectedCat.padre_id!]));
          }
        }
      } catch (error) {
        console.error("Error obteniendo categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedCategory]);

  useEffect(() => {
    const allActiveCategories = [...categories];
    Object.values(subcategoriesMap).forEach((subcats) => {
      allActiveCategories.push(...subcats);
    });

    const selected = allActiveCategories.find((cat) => cat.slug === selectedCategory) || null;
    setCategorySelected(selected);
  }, [selectedCategory, categories, subcategoriesMap]);

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleApplyPriceFilter = () => {
    onPriceRangeChange(tempPriceRange);
  };

  const handleSelectCategory = (slug: string) => {
    setCategoryQuery("");
    setIsCategoriesOpen(false);
    onCategoryChange(slug);
  };

  const handleClearAll = () => {
    onCategoryChange("");
    onPriceRangeChange([0, MAX_PRICE]);
    setTempPriceRange([0, MAX_PRICE]);
    setCategoryQuery("");
    setExpandedCategories(new Set());
  };

  const hasSelectedSubcategory = (parentId: number) => {
    if (!subcategoriesMap[parentId]) return false;
    return subcategoriesMap[parentId].some((sub) => sub.slug === selectedCategory);
  };

  const normalizedQuery = categoryQuery.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    if (!normalizedQuery) return categories;

    return categories.filter((category) => {
      const parentMatches = category.nombre.toLowerCase().includes(normalizedQuery);
      const childMatches = (subcategoriesMap[category.id] || []).some((subcategory) =>
        subcategory.nombre.toLowerCase().includes(normalizedQuery)
      );

      return parentMatches || childMatches;
    });
  }, [categories, subcategoriesMap, normalizedQuery]);

  const hasActiveCategories = visibleCategories.length > 0;

  return (
    <div 
      role="region" 
      aria-label="Filtros de productos" 
      className="relative w-full flex-col rounded-2xl border border-gray-100 bg-white shadow-lg lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] overflow-hidden flex"
    >
      {/* Fixed Sticky Header Actions */}
      <div className="bg-white/95 px-4 py-4 backdrop-blur border-b border-gray-100 flex-none z-20">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">Refina tu búsqueda</p>
            <h3 className="text-base font-bold text-gray-900 truncate">Filtros</h3>
          </div>
          <button
            onClick={handleClearAll}
            className="flex-none inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition-colors hover:text-textoRojo"
            aria-label="Limpiar todos los filtros"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Limpiar</span>
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {selectedCategory && (
            <span title={categorySelected ? categorySelected.nombre : selectedCategory} className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-textoRojo truncate max-w-full">
              {categorySelected ? categorySelected.nombre : selectedCategory}
            </span>
          )}
          {(priceRange[0] !== 0 || priceRange[1] !== MAX_PRICE) && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-700 truncate max-w-full">
              ${priceRange[0].toLocaleString("es-CO")} - ${priceRange[1].toLocaleString("es-CO")}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setIsCategoriesOpen(true);
              const element = document.getElementById("categories-section");
              element?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 bg-white shadow-sm"
          >
            <Search className="h-3.5 w-3.5 text-textoRojo" />
            <span className="truncate">Categorías</span>
          </button>
          <button
            onClick={() => {
              setIsPriceOpen(true);
              setTimeout(() => {
                const element = document.getElementById("price-section");
                element?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-textoRojo px-3 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-red-700"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="truncate">Ajustar Precios</span>
          </button>
        </div>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-hide relative min-h-0">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75">
            <RotatingLines strokeColor="#e53e3e" strokeWidth="5" animationDuration="0.75" width="40" visible={true} />
          </div>
        )}
        {hasActiveCategories ? (
          <section id="categories-section" className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <button
              type="button"
              onClick={() => setIsCategoriesOpen((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Árbol</p>
                <h4 className="text-lg font-semibold text-gray-900">Categorías</h4>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
                {isCategoriesOpen ? "Contraer" : "Expandir"}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCategoriesOpen ? "rotate-180" : ""}`} />
              </span>
            </button>

            {isCategoriesOpen && (
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    placeholder="Buscar categoría o subcategoría"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 pl-10 pr-10 text-sm transition-all duration-200 focus:border-textoRojo focus:outline-none focus:ring-2 focus:ring-textoRojo"
                  />
                  {categoryQuery && (
                    <button
                      type="button"
                      onClick={() => setCategoryQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Limpiar búsqueda de categorías"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex max-h-[42vh] w-full flex-col overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <button
                    onClick={() => handleSelectCategory("")}
                    aria-pressed={selectedCategory === ""}
                    className={`mb-1 w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${selectedCategory === "" ? "bg-textoRojo font-medium text-white" : "hover:bg-gray-100"}`}
                  >
                    Todas las categorías
                  </button>

                  {visibleCategories.map((category) => {
                    const hasSubcategories = !!subcategoriesMap[category.id]?.length;
                    const isExpanded = normalizedQuery ? true : expandedCategories.has(category.id);
                    const isParentSelected = selectedCategory === category.slug;
                    const hasSelectedChild = hasSelectedSubcategory(category.id);

                    return (
                      <div key={category.id} className="mb-1">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleSelectCategory(category.slug)}
                            aria-pressed={isParentSelected}
                            className={`flex-1 rounded-xl px-3 py-2 text-left text-sm transition-colors truncate ${isParentSelected ? "bg-textoRojo font-medium text-white" : hasSelectedChild ? "bg-red-50 font-medium text-textoRojo" : "hover:bg-gray-100"}`}
                            title={category.nombre}
                          >
                            {category.nombre}
                          </button>

                          {hasSubcategories && (
                            <button
                              onClick={() => toggleCategoryExpansion(category.id)}
                              className={`ml-1 rounded-lg p-2 text-sm transition-colors ${hasSelectedChild || isParentSelected ? "text-textoRojo hover:bg-red-50" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                              aria-label={isExpanded ? `Contraer ${category.nombre}` : `Expandir ${category.nombre}`}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          )}
                        </div>

                        {hasSubcategories && isExpanded && (
                          <div className="ml-4 mt-1 space-y-1">
                            {(subcategoriesMap[category.id] || [])
                              .filter((subcategory) => subcategory.activo === true)
                              .filter(
                                (subcategory) =>
                                  !normalizedQuery ||
                                  subcategory.nombre.toLowerCase().includes(normalizedQuery) ||
                                  category.nombre.toLowerCase().includes(normalizedQuery)
                              )
                              .map((subcategory) => (
                                <button
                                  key={subcategory.id}
                                  onClick={() => handleSelectCategory(subcategory.slug)}
                                  aria-pressed={selectedCategory === subcategory.slug}
                                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors truncate ${selectedCategory === subcategory.slug ? "bg-textoRojo font-medium text-white" : "text-gray-600 hover:bg-gray-100"}`}
                                  title={subcategory.nombre}
                                >
                                  <span className="mr-2 text-gray-400">└</span>
                                  {subcategory.nombre}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {normalizedQuery && visibleCategories.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                      No hay categorías que coincidan con “{categoryQuery}”.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        ) : (
          <div className="mb-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <div className="mb-2 text-gray-400">
              <Sliders className="mx-auto h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-gray-500">No hay categorías disponibles</p>
            <p className="mt-1 text-xs text-gray-400">Las categorías están siendo configuradas</p>
          </div>
        )}

        <section id="price-section" className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm sm:p-5">
          <button
            type="button"
            onClick={() => setIsPriceOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Rango</p>
              <h4 className="text-lg font-semibold text-gray-900">Precio</h4>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
              {isPriceOpen ? "Contraer" : "Expandir"}
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isPriceOpen ? "rotate-180" : ""}`} />
            </span>
          </button>

          {isPriceOpen && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 sm:p-3 gap-1 sm:gap-2">
                <div className="flex-1 text-center min-w-0">
                  <span className="block text-xs text-gray-500 truncate">Mínimo</span>
                  <span className="block text-sm font-bold text-textoRojo truncate" title={`$${tempPriceRange[0].toLocaleString("es-CO")}`}>
                    ${tempPriceRange[0].toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="h-px w-2 sm:w-4 bg-gray-300 flex-none" />
                <div className="flex-1 text-center min-w-0">
                  <span className="block text-xs text-gray-500 truncate">Máximo</span>
                  <span className="block text-sm font-bold text-textoRojo truncate" title={`$${tempPriceRange[1].toLocaleString("es-CO")}`}>
                    ${tempPriceRange[1].toLocaleString("es-CO")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <label className="mb-1 block text-xs font-medium text-gray-700 truncate">Precio mínimo</label>
                  <input
                    type="number"
                    min="0"
                    max={MAX_PRICE}
                    step="100000"
                    value={tempPriceRange[0]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value <= tempPriceRange[1] && value >= 0) {
                        setTempPriceRange([value, tempPriceRange[1]]);
                      }
                    }}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:border-textoRojo focus:outline-none focus:ring-2 focus:ring-textoRojo"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="mb-1 block text-xs font-medium text-gray-700 truncate">Precio máximo</label>
                  <input
                    type="number"
                    min="0"
                    max={MAX_PRICE}
                    step="100000"
                    value={tempPriceRange[1]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= tempPriceRange[0] && value <= MAX_PRICE) {
                        setTempPriceRange([tempPriceRange[0], value]);
                      }
                    }}
                    placeholder={MAX_PRICE.toString()}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:border-textoRojo focus:outline-none focus:ring-2 focus:ring-textoRojo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTempPriceRange([0, 1000000])}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    tempPriceRange[0] === 0 && tempPriceRange[1] === 1000000
                      ? "border-textoRojo bg-textoRojo text-white shadow-md"
                      : "border-gray-300 hover:border-textoRojo hover:bg-red-50 hover:text-textoRojo"
                  }`}
                >
                  Hasta $1M
                </button>
                <button
                  onClick={() => setTempPriceRange([1000000, 5000000])}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    tempPriceRange[0] === 1000000 && tempPriceRange[1] === 5000000
                      ? "border-textoRojo bg-textoRojo text-white shadow-md"
                      : "border-gray-300 hover:border-textoRojo hover:bg-red-50 hover:text-textoRojo"
                  }`}
                >
                  $1M - $5M
                </button>
                <button
                  onClick={() => setTempPriceRange([5000000, 10000000])}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    tempPriceRange[0] === 5000000 && tempPriceRange[1] === 10000000
                      ? "border-textoRojo bg-textoRojo text-white shadow-md"
                      : "border-gray-300 hover:border-textoRojo hover:bg-red-50 hover:text-textoRojo"
                  }`}
                >
                  $5M - $10M
                </button>
                <button
                  onClick={() => setTempPriceRange([10000000, MAX_PRICE])}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    tempPriceRange[0] === 10000000 && tempPriceRange[1] === MAX_PRICE
                      ? "border-textoRojo bg-textoRojo text-white shadow-md"
                      : "border-gray-300 hover:border-textoRojo hover:bg-red-50 hover:text-textoRojo"
                  }`}
                >
                  Más de $10M
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTempPriceRange([0, MAX_PRICE])}
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-600 transition-colors duration-200 hover:bg-gray-50"
                >
                  Restablecer
                </button>
                <button
                  onClick={handleApplyPriceFilter}
                  className="flex-[2] rounded-xl bg-textoRojo px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-700 hover:shadow-lg"
                >
                  Aplicar filtro
                </button>
              </div>
            </div>
          )}
        </section>

        {categorySelected && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-textoRojo"></div>
              <span className="text-sm font-medium text-textoRojo">Filtrando por: {categorySelected.nombre}</span>
            </div>
            {selectedCategory !== "" && (
              <button onClick={() => onCategoryChange("")} className="mt-1 text-xs underline hover:text-textoRojo">
                Limpiar filtro
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
