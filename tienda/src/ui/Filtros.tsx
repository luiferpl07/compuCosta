import { useEffect, useState } from "react";
import { config } from "../../config";
import { getData } from "../lib";
import { RotatingLines } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { CategoryProps, Product } from "../../type";
import { Sliders } from "lucide-react";

interface FiltersProps {
  selectedCategory: string;
  priceRange: [number, number];
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onFilterProducts: (filteredProducts: Product[]) => void;
}

const Filters = ({
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
  onFilterProducts,
}: FiltersProps) => {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(false);
  const MAX_PRICE = 20000000;
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [categorySelected, setCategorySelected] = useState<CategoryProps | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getData(`${config.baseUrl}${config.apiPrefix}/categories`);
        setCategories(data);
      } catch (error) {
        console.error("Error obteniendo categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Actualiza categorySelected cuando cambia selectedCategory
  useEffect(() => {
    const selected = categories.find((cat) => cat.slug === selectedCategory) || null;
    setCategorySelected(selected);
  }, [selectedCategory, categories]);

  // Obtener productos según la categoría seleccionada
  useEffect(() => {
    const fetchProducts = async () => {
      let endpoint = `${config.baseUrl}${config.apiPrefix}/products`;
      const queryParams = [];

      if (selectedCategory !== "") {
        queryParams.push(`categories=${selectedCategory}`);
      }

      if (queryParams.length > 0) {
        endpoint += `?${queryParams.join("&")}`;
      }

      try {
        setLoading(true);
        const data = await getData(endpoint);
        onFilterProducts(data);
      } catch (error) {
        console.error("Error obteniendo productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]); // Se ejecuta cada vez que cambia la categoría seleccionada

  // Aplicar filtro de precio
  const handleApplyPriceFilter = async () => {
    let endpoint = `${config.baseUrl}${config.apiPrefix}/products`;
    const queryParams = [`minPrice=${tempPriceRange[0]}`, `maxPrice=${tempPriceRange[1]}`];

    if (selectedCategory !== "") {
      queryParams.push(`categories=${selectedCategory}`);
    }

    endpoint += `?${queryParams.join("&")}`;

    try {
      setLoading(true);
      const data = await getData(endpoint);
      onFilterProducts(data);
      onPriceRangeChange(tempPriceRange);
    } catch (error) {
      console.error("Error aplicando filtro de precio:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full h-auto relative">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-6 h-6 text-gray-700" />
        <h2 className="text-xl font-semibold">Filtros</h2>
      </div>

      {/* Categorías */}
      <div className="mb-8">
        <h4 className="font-medium mb-3 text-lg">Categorías</h4>
        <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex flex-col w-full">
          <button
            onClick={() => onCategoryChange("")}
            className={`text-left w-full px-3 py-2 rounded text-sm transition-colors mb-1 ${
              selectedCategory === "" ? "bg-textoRojo text-white font-medium" : "hover:bg-gray-100"
            }`}
          >
            Todas las categorías
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`text-left w-full px-3 py-2 rounded text-sm transition-colors mb-1 ${
                selectedCategory === category.slug ? "bg-textoRojo text-white font-medium" : "hover:bg-gray-100"
              }`}
            >
              {category.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Rango de Precio</h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-500 mb-1 block">Mínimo</label>
              <input
                type="number"
                min="0"
                step="10000"
                value={tempPriceRange[0]}
                onChange={(e) => setTempPriceRange([Number(e.target.value), tempPriceRange[1]])}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-textoRojo"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-500 mb-1 block">Máximo</label>
              <input
                type="number"
                min="0"
                step="10000"
                value={tempPriceRange[1]}
                onChange={(e) => setTempPriceRange([tempPriceRange[0], Number(e.target.value)])}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-textoRojo"
              />
            </div>
          </div>
          <button
            onClick={handleApplyPriceFilter}
            className="w-full bg-textoRojo text-white py-2 rounded-md text-sm font-semibold shadow-md hover:bg-red-700"
          >
            Aplicar filtro
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;