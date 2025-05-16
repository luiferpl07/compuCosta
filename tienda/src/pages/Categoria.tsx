import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { config } from "../../config";
import { getData } from "../lib";
import Loading from "../ui/Loading";
import Container from "../ui/Container";
import Filters from "../ui/Filtros";
import ProductCard from "../ui/ProductCard";
import { Product } from "../../type";

const Categoria = () => {
  const { id } = useParams(); // Categoría actual
  const navigate = useNavigate();

  // Estados para los productos y filtros
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(id || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("rating_desc");

  // Obtener todos los productos al cargar la página
  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${config?.baseUrl}${config?.apiPrefix}/products`;
      try {
        setLoading(true);
        setError(null);
        const data = await getData(endpoint);
        setAllProducts(data);
      } catch (error) {
        console.error("Error al cargar los productos", error);
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos de la misma categoría
  useEffect(() => {
    if (!id || allProducts.length === 0) return;
  
    const relatedProducts = allProducts.filter((product: Product) => 
      Array.isArray(product.categorias) && 
      product.categorias.some(categoria => categoria?.slug === id)
    );
  
    setFilteredProducts(relatedProducts);
    setSelectedCategory(id);
  }, [id, allProducts]);
  
  // Aplicar filtros de precio y ordenamiento a los productos relacionados
  useEffect(() => {
    if (!filteredProducts.length) return;
    
    const sortedAndFiltered = [...filteredProducts]
      .filter(product =>
        product.lista2 >= priceRange[0] && product.lista2 <= priceRange[1]
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "name_asc":
            return a.nombreproducto.localeCompare(b.nombreproducto);
          case "name_desc":
            return b.nombreproducto.localeCompare(a.nombreproducto);
          case "price_asc":
            return a.lista2 - b.lista2;
          case "price_desc":
            return b.lista2 - a.lista2;
          case "rating_desc":
            return b.puntuacionPromedio - a.puntuacionPromedio;
          default:
            return 0;
        }
      });

    setFilteredProducts(sortedAndFiltered);
  }, [priceRange, sortBy]);

  // Función para cambiar de categoría - Modificada para usar la URL deseada
  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    navigate(`/productos?categoria=${newCategory}`);
  };

  return (
    <div className="min-h-screen py-8">
      {loading ? (
        <Loading />
      ) : (
        <Container>
          <h2 className="text-4xl text-center font-semibold mb-8">
            {selectedCategory.replace("-", " ").toUpperCase()}
          </h2>
          
          <div className="flex items-start gap-10">
            {/* Filtros */}
            <Filters 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
            />

            <div className="flex-1">
              <div className="flex justify-between mb-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer"
                >
                  <option value="rating_desc">Mejor valorados</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                  <option value="name_asc">A-Z</option>
                  <option value="name_desc">Z-A</option>
                </select>
              </div>
              
              {error ? (
                <div className="text-center text-gray-600 py-10">
                  <p>{error}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center text-gray-600 py-10">
                  <p>No hay productos relacionados en esta categoría</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((item: Product) => (
                    <ProductCard key={item.idproducto} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      )}
    </div>
  );
};

export default Categoria;