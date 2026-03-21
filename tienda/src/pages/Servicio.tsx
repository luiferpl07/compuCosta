import React, { useState, useEffect } from 'react';
import { ArrowUp, Monitor, Wifi, Settings, Tv, Users, CheckCircle, Star, Award, Phone, MapPin, Clock, User, MessageCircle, Wrench, Computer, Network } from 'lucide-react';
import Container from "../ui/Container";
import { config } from "../../config";
import { servicio } from "../assets";

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  orden: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// Mapeo de iconos
const iconosMap = {
  Monitor: Monitor,
  Wifi: Wifi,
  Settings: Settings,
  Tv: Tv,
  Users: Users,
  CheckCircle: CheckCircle,
  Star: Star,
  Award: Award,
  Phone: Phone,
  MapPin: MapPin,
  Clock: Clock,
  User: User,
  MessageCircle: MessageCircle,
  ArrowUp: ArrowUp,
  Wrench: Wrench,
  Computer: Computer,
  Network: Network
};

function TarjetaServicio({ servicio }: { servicio: Servicio }) {
  return (
    <div className="group w-full">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
        {servicio.imagenUrl && (
          <div className="h-48 sm:h-52 md:h-56 lg:h-60 overflow-hidden relative">
            <img 
              src={
                servicio.imagenUrl.startsWith("http")
                  ? servicio.imagenUrl
                  : `${config.baseUrl}${servicio.imagenUrl}`
              }
              alt={servicio.titulo} 
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
        )}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center mb-3 md:mb-4">
            <h3 className="text-lg sm:text-xl md:text-xl font-semibold text-gray-900 leading-tight">{servicio.titulo}</h3>
          </div>
          <div className="w-8 sm:w-10 md:w-12 h-0.5 bg-red-500 mb-4 sm:mb-5 md:mb-6"></div>
          <p className="text-sm sm:text-base md:text-base text-gray-700 leading-relaxed font-light">{servicio.descripcion}</p>
        </div>
      </div>
    </div>
  );
}

const Servicio = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construir la URL base de la API
        const apiBaseUrl = `${config.baseUrl}${config.apiPrefix}`;
        const fullUrl = `${apiBaseUrl}/servicios?activo=true`;
        
        console.log('🔍 Intentando conectar a:', fullUrl);
        console.log('🔧 Config:', { baseUrl: config.baseUrl, apiPrefix: config.apiPrefix });
        
        // Configuración común para las peticiones
        const fetchOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };

        // Fetch servicios
        const serviciosResponse = await fetch(fullUrl, fetchOptions);
        console.log('📡 Response status:', serviciosResponse.status);
        console.log('📡 Response ok:', serviciosResponse.ok);
        
        if (!serviciosResponse.ok) {
          const errorText = await serviciosResponse.text();
          console.error('❌ Error response text:', errorText);
          throw new Error(`Error ${serviciosResponse.status}: ${serviciosResponse.statusText}`);
        }
        
        const serviciosData = await serviciosResponse.json();
        console.log('📦 Datos recibidos:', serviciosData);
        console.log('📦 Tipo de datos:', typeof serviciosData);
        console.log('📦 Es array:', Array.isArray(serviciosData));
        
        if (Array.isArray(serviciosData)) {
          // Ordenar por el campo 'orden' para asegurar el orden correcto
          const serviciosOrdenados = serviciosData.sort((a: Servicio, b: Servicio) => a.orden - b.orden);
          console.log('✅ Servicios ordenados:', serviciosOrdenados);
          setServicios(serviciosOrdenados);
        } else {
          console.error('❌ Formato de datos incorrecto:', serviciosData);
          setError("Formato de datos incorrecto");
        }
        
      } catch (err) {
        console.error('💥 Error completo:', err);
        setError(`Error al cargar los servicios: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Encabezado Profesional - Siempre visible */}
      <header className="relative bg-cover bg-center text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
                    style={{ backgroundImage: `url(${servicio})` }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 tracking-tight">
             <span className="font-semibold"> Servicios Técnicos</span>
            </h1>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-600 mx-auto mb-6 sm:mb-8"></div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl  leading-relaxed font-light px-4">
             <span className="font-semibold"> Más de 30 años de experiencia brindando soluciones tecnológicas de calidad </span> 
            </p>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <Container>
          
          {/* Estado de carga */}
          {loading && (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12 max-w-md mx-auto">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-sm sm:text-base text-gray-600">Cargando servicios...</p>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && !loading && (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12 max-w-md mx-auto">
                <Settings className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Servicios no disponibles</h3>
                <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
          
          {/* Mostrar todos los servicios - Solo cuando hay datos */}
          {!loading && !error && servicios.length > 0 && (
            <div className="mb-12 sm:mb-16 md:mb-20">
              <div className="text-center mb-12 sm:mb-14 md:mb-16 px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 sm:mb-4">
                  Nuestros <span className="font-semibold">Servicios</span>
                </h2>
                <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-500 mx-auto mb-4 sm:mb-6"></div>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                  Soluciones tecnológicas completas para todas sus necesidades
                </p>
              </div>
              
              {/* Grid responsive para servicios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
                {servicios.map((servicio) => (
                  <TarjetaServicio key={servicio.id} servicio={servicio} />
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay servicios - Solo cuando no está cargando y no hay error */}
          {!loading && !error && servicios.length === 0 && (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12 max-w-md mx-auto">
                <Settings className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">No hay servicios disponibles</h3>
                <p className="text-gray-600 text-base sm:text-lg">
                  Los servicios estarán disponibles próximamente.
                </p>
              </div>
            </div>
          )}

          {/* Características Destacadas - Siempre visible */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8 mb-16 sm:mb-20 md:mb-28">
              <div className="text-center bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Más de 30 años</h3>
                <p className="text-sm sm:text-base text-gray-600 font-light">de experiencia en el sector tecnológico</p>
              </div>
              
              <div className="text-center bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Garantía Total</h3>
                <p className="text-sm sm:text-base text-gray-600 font-light">en todos nuestros servicios y reparaciones</p>
              </div>
              
              <div className="text-center bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 sm:col-span-2 md:col-span-1">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Técnicos Certificados</h3>
                <p className="text-sm sm:text-base text-gray-600 font-light">profesionales especializados y capacitados</p>
              </div>
            </div>
          )}

          {/* Sección de Contacto - Siempre visible */}
          {!loading && (
            <div className="text-center mb-12 sm:mb-14 md:mb-16 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 sm:mb-4">
                <span className="font-semibold">Contáctanos</span>
              </h2>
              <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-500 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                <span className="font-semibold">Estamos listos para ayudarte con tus necesidades tecnológicas </span>
              </p>
            </div>
          )}
        </Container>
      </div>

      {/* Botón para Volver Arriba - Siempre visible */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 bg-gradient-to-br from-red-500 to-red-600 text-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 z-50"
        aria-label="Volver arriba"
      >
        <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}

export default Servicio;