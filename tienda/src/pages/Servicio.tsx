
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { reparaciondepc, reparacionTv, otrosServicios, cableado } from "../assets";
import { config } from "../../config";
import { getData } from "../lib";

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  isActive: boolean;
  bannerType: string;
}

function TarjetaServicio({ titulo, descripcion, imagen }: { titulo: string, descripcion: string, imagen: string }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="h-48 overflow-hidden">
        <img src={imagen} alt={titulo} className="w-full h-full object-cover transition-transform hover:scale-110" />
      </div>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{titulo}</h3>
        </div>
        <p className="text-gray-600 leading-relaxed">{descripcion}</p>
      </div>
    </div>
  );
}

const Servicio = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bannersEndpoint = `${config?.baseUrl}${config?.apiPrefix}/banners`;
        const bannersData = await getData(bannersEndpoint);
        const activeBanners = bannersData.filter(
          (b: Banner) => b.isActive && b.bannerType === "bannerContacto"
        );
        setBanners(activeBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Sección Principal */}
      <header className="bg-gradient-to-r from-red-700 to-red-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Servicios Técnicos Profesionales
          </h1>
          <p className="text-xl text-center max-w-2xl mx-auto text-red-100">
            Más de 10 años de experiencia brindando soluciones tecnológicas de calidad
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Mantenimiento de Computadoras */}
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <img 
              src={reparaciondepc}
              alt="Mantenimiento de Computadoras"
              className="w-full h-[400px] object-cover transition-transform hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 to-transparent"></div>
          </div>
          <div className="flex flex-col justify-center bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-red-800 mb-4">
              Mantenimiento y Reparación de Computadoras
            </h2>
            <p className="text-gray-600 mb-4">
              El mantenimiento de computadoras consiste en una limpieza completa de hardware y software. 
              La limpieza interna de hardware incluye remover todas las partículas de polvo que se 
              encuentran en todos los dispositivos y tarjetas controladoras, además de realizar una limpieza externa.
            </p>
            <p className="text-gray-600">
              Contamos con un servicio técnico profesional y calificado para la reparación de equipo de computación. 
              Nuestra experiencia de más de 10 años hace que nuestros clientes queden completamente satisfechos.
            </p>
          </div>
        </div>

        {/* Título de Servicios */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-red-800 mb-4">Nuestros Servicios Especializados</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto"></div>
        </div>

        {/* Cuadrícula de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <TarjetaServicio
            titulo="Cableado Estructurado y Redes"
            descripcion="Instalación profesional de redes Cliente-Servidor y grupos de trabajo para oficinas, tiendas y centros de internet. Diseñamos su red a través de cableado estructurado o con tecnología inalámbrica, utilizando sistemas de cableado de alta transmisión, cajas y switches adaptables a cada situación."
            imagen={cableado}
          />
          <TarjetaServicio
            titulo="Servicios Adicionales"
            descripcion="• Instalación y configuración de equipos, impresoras, fotocopiadoras y fax
                        • Mantenimiento y reparación de equipos de oficina
                        • Instalación profesional de software
                        • Configuración completa de equipos informáticos
                        • Servicios eléctricos y electrónicos especializados"
            imagen={otrosServicios}
          />
          <TarjetaServicio
            titulo="Reparación de Televisores LED"
            descripcion="Servicio técnico especializado en reparación y mantenimiento de televisores LED de todas las marcas. Contamos con técnicos certificados y herramientas de última generación para garantizar reparaciones de alta calidad con garantía en todas nuestras intervenciones."
            imagen={reparacionTv}
          />
        </div>

        {/* Banner de Contacto */}
        <div className="mt-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-red-800">Contactanos</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mt-2"></div>
          </div>
          
          <div className="w-full flex justify-center">
            {loading ? (
              <div className="w-full h-[200px] bg-gray-200 rounded-lg flex items-center justify-center">
                Cargando...
              </div>
            ) : banners.length > 0 ? (
              <div className="w-full rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={`${config?.baseUrl}${banners[0].imageUrl}`} 
                  alt={banners[0].title}
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            ) : (
              <div className="w-full h-[200px] bg-gray-200 rounded-lg flex items-center justify-center">
                No hay imagen disponible
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Botón para Volver Arriba */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
        aria-label="Volver arriba"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}

export default Servicio;
