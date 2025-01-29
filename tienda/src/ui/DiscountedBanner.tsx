import React, { useEffect, useState } from "react";
import Container from "./Container";
import Title from "./Title";
import { Link } from "react-router-dom";
import { config } from "../../config";
import { getData } from "../lib";
import {
  discountImgOne,
  discountImgTwo,
} from "../assets";

interface Marcas {
  id: string;
  nombre: string;
  imagen: string;
  
}

const DiscountedBanner = () => {
  const [marcas, setMarcas] = useState<Marcas[]>([]);
  const [loading, setLoading] = useState(false);

  const popularSearchItems = [
    { title: "Smart Watches", link: "smartWatches" },
    { title: "Audifonos", link: "headphones" },
    { title: "Camaras", link: "camerasAndPhotos" },
    { title: "Audio", link: "tvAndAudio" },
    { title: "Laptop & Computadores", link: "computersAndLaptop" },
    { title: "Celulares", link: "cellPhones" },
  ];

  useEffect(() => {
    const fetchMarcas = async () => {
      const endpoint = `${config?.baseUrl}${config?.apiPrefix}/marcas`;
      try {
        setLoading(true);
        const data = await getData(endpoint);
        setMarcas(data);
      } catch (error) {
        console.error("Error fetching marcas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarcas();
  }, []);

  return (
    <Container>
      {/* Búsquedas populares section */}
      <div>
        <Title text="Busquedas populares" />
        <div className="w-full h-[1px] bg-gray-200 mt-3" />
      </div>
      <div className="my-7 flex items-center flex-wrap gap-4">
        {popularSearchItems?.map(({ title, link }) => (
          <Link
            key={title}
            to={`/categorias/${link}`}
            className="border border-[px] border-gray-300 px-8 py-3 rounded-full capitalize font-medium hover:bg-black hover:text-white duration-200"
          >
            {title}
          </Link>
        ))}
      </div>

      {/* Banner section */}
      <div className="w-full py-5 md:py-0 my-12 bg-[#f6f6f6] rounded-lg flex items-center justify-between overflow-hidden">
        <img
          src={discountImgOne}
          alt="discountedImgOne"
          className="hidden lg:inline-flex h-36"
        />
        <div className="flex flex-col flex-1 gap-1 items-center">
          <div className="flex items-center justify-center gap-x-3 text-xl md:text-4xl font-bold">
            <h2>Sony Headphone</h2>
            <Link
              to={"/productos"}
              className="border border-red-600 px-4 py-2 text-xl md:text-3xl text-red-600 rounded-full"
            >
              Descuento 20%
            </Link>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            
          </p>
        </div>
        <img
          src={discountImgTwo}
          alt="discountedImgTwo"
          className="hidden lg:inline-flex h-36"
        />
      </div>

      {/* Brands section */}
      <div className="mt-7">
        <p className="font-bold text-2xl">Marcas de distribuidores</p>
        {loading ? (
          <div className="text-center py-4">Cargando marcas...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mt-7">
            {marcas.map((marca, index) => (
              <div
                key={marca.id}
                className={`border border-gray-300 ${
                  index !== marcas.length - 1 ? 'border-r-0' : ''
                } flex items-center justify-center px-6 py-2 cursor-pointer group`}
              >
                <img
                  src={marca.imagen}
                  
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default DiscountedBanner;