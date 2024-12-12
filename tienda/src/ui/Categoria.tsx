import { useEffect, useState } from "react";
import Container from "./Container";
import { config } from "../../config";
import { getData } from "../lib";
import Title from "./Title";
import { Link } from "react-router-dom";
import { CategoryProps } from "../../type";

const Categorias = () => {
  const [categories, setCategories] = useState([]); // Estado para almacenar las categorías

  useEffect(() => {
    const fetchData = async () => {
      const endpoint = `${config?.baseUrl}/categorias`; // URL del endpoint para obtener categorías
      try {
        const data = await getData(endpoint); // Llama a la función `getData` para obtener los datos
        setCategories(data); // Actualiza el estado con las categorías obtenidas
      } catch (error) {
        console.error("Error al obtener los datos de categorías:", error); // Manejo de errores
      }
    };
    fetchData();
  }, []);

  return (
    <Container>
      {/* Encabezado de Categorías */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <Title text="Categorías Populares" /> {/* Título principal */}
          <Link
            to={"/categorias/tvAndAudio"}
            className="font-medium relative group overflow-hidden"
          >
            Ver todas las categorías{" "}
            <span className="absolute bottom-0 left-0 w-full block h-[1px] bg-gray-600 -translate-x-[100%] group-hover:translate-x-0 duration-300" />
          </Link>
        </div>
        <div className="w-full h-[1px] bg-gray-200 mt-3" />
      </div>

      {/* Lista de Categorías */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-7">
        {categories.map((item: CategoryProps) => (
          <Link
            to={`/categorias/${item?._base}`} // Enlace dinámico basado en la propiedad `_base`
            key={item?._id}
            className="w-full h-auto relative group overflow-hidden"
          >
            <img
              src={item?.image} // Imagen de la categoría
              alt={`Imagen de la categoría ${item?.name}`}
              className="w-full h-auto rounded-md group-hover:scale-110 duration-300"
            />
            <div className="absolute bottom-3 w-full text-center">
              <p className="text-sm md:text-base font-bold">{item?.name}</p> {/* Nombre de la categoría */}
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
};

export default Categorias;
