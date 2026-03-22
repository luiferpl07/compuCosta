import { useEffect, useState } from "react";
import { config } from "../../config";
import { getData } from "../lib";
import { RotatingLines } from "react-loader-spinner";
import { CategoryProps } from "../../type";
import { Sliders, ChevronDown, ChevronRight } from "lucide-react";

interface FiltersProps {
  selectedCategory: string;
  priceRange: [number, number];
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
}

const Filters = ({
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
}: FiltersProps) => {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<{ [key: number]: CategoryProps[] }>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const MAX_PRICE = 20000000;
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [categorySelected, setCategorySelected] = useState<CategoryProps | null>(null);

  // Sincronizar tempPriceRange cuando priceRange cambia desde la URL o props
  useEffect(() => {
    setTempPriceRange(priceRange);
  }, [priceRange]);

  // SOLO cargar categorías (no productos)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getData(`${config.baseUrl}${config.apiPrefix}/categories`);
        
        const categoriasActivas = data.filter((cat: CategoryProps) => cat.activo === true);
        const parentCategories = categoriasActivas.filter((cat: CategoryProps) => cat.padre_id === null);
        const childCategories = categoriasActivas.filter((cat: CategoryProps) => cat.padre_id !== null);
        
        const subcategoriesGrouped: { [key: number]: CategoryProps[] } = {};
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
            setExpandedCategories(prev => new Set([...prev, selectedCat.padre_id!]));
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

  // Actualizar categoría seleccionada
  useEffect(() => {
    const allActiveCategories = [...categories];
    Object.values(subcategoriesMap).forEach(subcats => {
      allActiveCategories.push(...subcats);
    });
    
    const selected = allActiveCategories.find((cat) => cat.slug === selectedCategory) || null;
    setCategorySelected(selected);
  }, [selectedCategory, categories, subcategoriesMap]);

  // Aplicar filtro de precio - SOLO actualiza el estado
  const handleApplyPriceFilter = () => {
    console.log('🎯 Aplicando filtro de precio:', tempPriceRange);
    onPriceRangeChange(tempPriceRange);
  };


  const hasSelectedSubcategory = (parentId: number) => {
    if (!subcategoriesMap[parentId]) return false;
    return subcategoriesMap[parentId].some(sub => sub.slug === selectedCategory);
  };

  const hasActiveCategories = categories.length > 0;

  return (
    <div role="region" aria-label="Filtros de productos" className="bg-white p-6 rounded-lg shadow-md w-full h-auto relative">
      {/* Badges de filtros activos y botón 'Limpiar todo' */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCategory && selectedCategory !== "" && (
            <span className="px-3 py-1 rounded-full bg-red-50 text-textoRojo text-sm font-medium">
              {categorySelected ? categorySelected.nombre : selectedCategory}
            </span>
          )}
          {(priceRange[0] !== 0 || priceRange[1] !== MAX_PRICE) && (
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
              ${priceRange[0].toLocaleString('es-CO')} - ${priceRange[1].toLocaleString('es-CO')}
            </span>
          )}
        </div>
        <div>
          <button
            onClick={() => {
              console.log('🧹 Botón Limpiar todo clickeado');
              onCategoryChange("");
              onPriceRangeChange([0, MAX_PRICE]);
              setTempPriceRange([0, MAX_PRICE]);
            }}
            className="text-sm text-gray-500 hover:text-textoRojo underline"
            aria-label="Limpiar todos los filtros"
          >
            Limpiar todo
          </button>
        </div>
      </div>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <RotatingLines
            strokeColor="#e53e3e"
            strokeWidth="5"
            animationDuration="0.75"
            width="40"
            visible={true}
          />
        </div>
      )}

      {hasActiveCategories ? (
        <div className="mb-8">
          <h4 className="font-medium mb-3 text-lg">Categorías</h4>
          <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex flex-col w-full">
            <button
              onClick={() => onCategoryChange("")}
              aria-pressed={selectedCategory === ""}
              className={`text-left w-full px-3 py-2 rounded text-sm transition-colors mb-1 ${
                selectedCategory === "" 
                  ? "bg-textoRojo text-white font-medium" 
                  : "hover:bg-gray-100"
              }`}
            >
              Todas las categorías
            </button>

            {categories.map((category) => {
              const hasSubcategories = subcategoriesMap[category.id] && subcategoriesMap[category.id].length > 0;
              const isExpanded = expandedCategories.has(category.id);
              const isParentSelected = selectedCategory === category.slug;
              const hasSelectedChild = hasSelectedSubcategory(category.id);

              return (
                <div key={category.id} className="mb-1">
                  <div className="flex items-center">
                    <button
                      onClick={() => onCategoryChange(category.slug)}
                      aria-pressed={isParentSelected}
                      className={`flex-1 text-left px-3 py-2 rounded text-sm transition-colors ${
                        isParentSelected
                          ? "bg-textoRojo text-white font-medium"
                          : hasSelectedChild
                          ? "bg-red-50 text-textoRojo font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {category.nombre}
                    </button>
                    
                    {hasSubcategories && (
                      <button
                        onClick={() => toggleCategoryExpansion(category.id)}
                        className={`p-2 rounded text-sm transition-colors ml-1 ${
                          hasSelectedChild || isParentSelected
                            ? "text-textoRojo hover:bg-red-50"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        }`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {hasSubcategories && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {subcategoriesMap[category.id]
                        .filter(subcategory => subcategory.activo === true)
                        .map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => onCategoryChange(subcategory.slug)}
                          aria-pressed={selectedCategory === subcategory.slug}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedCategory === subcategory.slug
                              ? "bg-textoRojo text-white font-medium"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span className="text-gray-400 mr-2">└</span>
                          {subcategory.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <h4 className="font-medium mb-3 text-lg">Categorías</h4>
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <div className="text-gray-400 mb-2">
              <Sliders className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No hay categorías disponibles</p>
            <p className="text-xs text-gray-400 mt-1">
              Las categorías están siendo configuradas
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Rango de Precio</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
            <div className="text-center">
              <span className="text-xs text-gray-500 block">Mínimo</span>
              <span className="text-sm font-bold text-textoRojo">
                ${tempPriceRange[0].toLocaleString('es-CO')}
              </span>
            </div>
            <div className="w-6 h-px bg-gray-300"></div>
            <div className="text-center">
              <span className="text-xs text-gray-500 block">Máximo</span>
              <span className="text-sm font-bold text-textoRojo">
                ${tempPriceRange[1].toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Precio mínimo</label>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-textoRojo focus:border-textoRojo transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Precio máximo</label>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-textoRojo focus:border-textoRojo transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTempPriceRange([0, 1000000])}
              className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 font-medium ${
                tempPriceRange[0] === 0 && tempPriceRange[1] === 1000000
                  ? 'bg-textoRojo text-white border-textoRojo shadow-md'
                  : 'border-gray-300 hover:border-textoRojo hover:text-textoRojo hover:bg-red-50'
              }`}
            >
              Hasta $1M
            </button>
            <button
              onClick={() => setTempPriceRange([1000000, 5000000])}
              className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 font-medium ${
                tempPriceRange[0] === 1000000 && tempPriceRange[1] === 5000000
                  ? 'bg-textoRojo text-white border-textoRojo shadow-md'
                  : 'border-gray-300 hover:border-textoRojo hover:text-textoRojo hover:bg-red-50'
              }`}
            >
              $1M - $5M
            </button>
            <button
              onClick={() => setTempPriceRange([5000000, 10000000])}
              className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 font-medium ${
                tempPriceRange[0] === 5000000 && tempPriceRange[1] === 10000000
                  ? 'bg-textoRojo text-white border-textoRojo shadow-md'
                  : 'border-gray-300 hover:border-textoRojo hover:text-textoRojo hover:bg-red-50'
              }`}
            >
              $5M - $10M
            </button>
            <button
              onClick={() => setTempPriceRange([10000000, MAX_PRICE])}
              className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 font-medium ${
                tempPriceRange[0] === 10000000 && tempPriceRange[1] === MAX_PRICE
                  ? 'bg-textoRojo text-white border-textoRojo shadow-md'
                  : 'border-gray-300 hover:border-textoRojo hover:text-textoRojo hover:bg-red-50'
              }`}
            >
              Más de $10M
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTempPriceRange([0, MAX_PRICE])}
              className="flex-1 px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Restablecer
            </button>
            <button
              onClick={handleApplyPriceFilter}
              className="flex-[2] bg-textoRojo text-white py-2 px-4 rounded-lg text-sm font-semibold shadow-md hover:bg-red-700 transition-all duration-200 hover:shadow-lg"
            >
              Aplicar filtro
            </button>
          </div>
        </div>
      </div>

      {categorySelected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-textoRojo rounded-full"></div>
            <span className="text-sm font-medium text-textoRojo">
              Filtrando por: {categorySelected.nombre}
            </span>
          </div>
          {selectedCategory !== "" && (
            <button
              onClick={() => onCategoryChange("")}
              className="text-xs text-gray-500 hover:text-textoRojo mt-1 underline"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters;