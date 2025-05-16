import { useEffect, useState } from "react";
import Container from "./Container";
import { config } from "../../config";
import { getData } from "../lib";
import Title from "./Title";
import { useNavigate } from "react-router-dom"; 
import { CategoryProps } from "../../type";

const Categorias = () => {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${config?.baseUrl}${config?.apiPrefix}/categories`;
      try {
        const data = await getData(endpoint);
        setCategories(data);
      } catch (error) {
        console.error("Error al obtener los datos de categorías:", error);
      }
    };
    fetchData();
  }, []);

  // Función para manejar el clic en una categoría y redirigir a `/productos?categoria={categoria}`
  const handleCategoryClick = (slug: string) => {
    navigate(`/productos?categoria=${slug}`);
  };

  return (
    <Container>
      {/* Encabezado de Categorías */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <Title text="Categorías Populares" />
        </div>
        <div className="w-full h-[1px] bg-gray-200 mt-3" />
      </div>

      {/* Lista de Categorías */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-7">
        {categories.map((item: CategoryProps) => (
          <div
            key={item?.id}
            className="w-full h-auto relative group overflow-hidden cursor-pointer"
            onClick={() => handleCategoryClick(item?.slug)}
          >
            <div className="absolute bottom-3 w-full text-center">
              <p className="text-sm md:text-base font-bold">{item?.nombre}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default Categorias;