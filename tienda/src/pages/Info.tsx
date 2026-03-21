import React, { useState, useEffect } from "react";
import { Target, Compass, Users, Clock, Heart, Shield, Lightbulb, Star, Award, CheckCircle, Trophy, Zap, Globe, Rocket, Eye, HandHeart, Crown, Diamond } from "lucide-react";
import Container from "../ui/Container";
import { config } from "../../config";
import { acerca_de } from "../assets";

// Mapeo de iconos en español
const iconosMap = {
  Target: Target,
  Compass: Compass,
  Heart: Heart,
  Lightbulb: Lightbulb,
  Shield: Shield,
  Star: Star,
  Award: Award,
  Users: Users,
  Clock: Clock,
  CheckCircle: CheckCircle,
  Trophy: Trophy,
  Zap: Zap,
  Globe: Globe,
  Rocket: Rocket,
  Eye: Eye,
  HandHeart: HandHeart,
  Crown: Crown,
  Diamond: Diamond
};

interface InformacionEmpresa {
  id: string;
  seccion: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  icono?: string;
  orden: number;
  activo: boolean;
  metadatos?: {
    ano?: string;
    importancia?: string;
  };
}

const AcercaDeNosotros = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mision, setMision] = useState<InformacionEmpresa | null>(null);
  const [vision, setVision] = useState<InformacionEmpresa | null>(null);
  const [historia, setHistoria] = useState<InformacionEmpresa[]>([]);
  const [valores, setValores] = useState<InformacionEmpresa[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Construir la URL base de la API
        const apiBaseUrl = `${config.baseUrl}${config.apiPrefix}`;
        
        // Configuración común para las peticiones
        const fetchOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };

        // Fetch misión
        const misionResponse = await fetch(`${apiBaseUrl}/empresa?seccion=mision&activo=true`, fetchOptions);
        if (!misionResponse.ok) {
          throw new Error(`Error ${misionResponse.status}: ${misionResponse.statusText}`);
        }
        const misionData = await misionResponse.json();
        if (misionData.length > 0) {
          setMision(misionData[0]);
        }

        // Fetch visión
        const visionResponse = await fetch(`${apiBaseUrl}/empresa?seccion=vision&activo=true`, fetchOptions);
        if (!visionResponse.ok) {
          throw new Error(`Error ${visionResponse.status}: ${visionResponse.statusText}`);
        }
        const visionData = await visionResponse.json();
        if (visionData.length > 0) {
          setVision(visionData[0]);
        }

        // Fetch historia
        const historiaResponse = await fetch(`${apiBaseUrl}/empresa?seccion=historia&tipo=hito&activo=true`, fetchOptions);
        if (!historiaResponse.ok) {
          throw new Error(`Error ${historiaResponse.status}: ${historiaResponse.statusText}`);
        }
        const historiaData = await historiaResponse.json();
        setHistoria(historiaData);

        // Fetch valores
        const valoresResponse = await fetch(`${apiBaseUrl}/empresa?seccion=valores&tipo=valor&activo=true`, fetchOptions);
        if (!valoresResponse.ok) {
          throw new Error(`Error ${valoresResponse.status}: ${valoresResponse.statusText}`);
        }
        const valoresData = await valoresResponse.json();
        setValores(valoresData);

      } catch (err) {
        setError('Error al cargar la información de la empresa');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return Target;
    return iconosMap[iconName as keyof typeof iconosMap] || Target;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Encabezado Profesional - Siempre visible */}
      <header className="relative bg-cover bg-center text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
              style={{ backgroundImage: `url(${acerca_de})` }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 tracking-tight">
             <span className="font-semibold">Acerca de Nosotros</span>
            </h1>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-600 mx-auto"></div>
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
                <p className="text-sm sm:text-base text-gray-600">Cargando información...</p>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && !loading && (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12 max-w-md mx-auto">
                <Target className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Información no disponible</h3>
                <p className="text-red-600 text-sm sm:text-base mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Misión y Visión - Solo cuando hay datos o mostrar placeholders */}
          {!loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 mb-16 sm:mb-20 md:mb-28">
              {/* Misión */}
              <div className="group">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10 h-full transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-0 sm:mr-4 md:mr-6 flex-shrink-0">
                      <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2 leading-tight">
                        {mision?.titulo || 'Misión'}
                      </h2>
                      <div className="w-8 sm:w-10 md:w-12 h-0.5 bg-red-500 mx-auto sm:mx-0"></div>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-light text-center sm:text-left">
                    {mision?.descripcion || (error 
                      ? 'Información de misión no disponible temporalmente'
                      : 'Nos dedicamos a brindar soluciones tecnológicas de calidad con el más alto nivel de servicio al cliente.'
                    )}
                  </p>
                </div>
              </div>

              {/* Visión */}
              <div className="group">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10 h-full transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-0 sm:mr-4 md:mr-6 flex-shrink-0">
                      <Compass className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2 leading-tight">
                        {vision?.titulo || 'Visión'}
                      </h2>
                      <div className="w-8 sm:w-10 md:w-12 h-0.5 bg-red-500 mx-auto sm:mx-0"></div>
                    </div>
                  </div>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-light text-center sm:text-left">
                    {vision?.descripcion || (error 
                      ? 'Información de visión no disponible temporalmente'
                      : 'Ser reconocidos como la empresa líder en soluciones tecnológicas, innovación y excelencia en el servicio.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Historia - Timeline Responsive - Solo cuando hay datos */}
          {!loading && !error && historia.length > 0 && (
            <div className="mb-16 sm:mb-20 md:mb-28">
              <div className="text-center mb-12 sm:mb-14 md:mb-16 px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 sm:mb-4">
                  Nuestra <span className="font-semibold">Historia</span>
                </h2>
                <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-500 mx-auto mb-4 sm:mb-6"></div>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                  Un recorrido de crecimiento, innovación y compromiso con la excelencia
                </p>
              </div>
              
              <div className="max-w-5xl mx-auto">
                <div className="relative">
                  {/* Línea central - Solo en desktop */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-red-500 to-red-300"></div>
                  
                  <div className="space-y-8 sm:space-y-10 md:space-y-12">
                    {historia.map((hito, index) => (
                      <div key={hito.id} className="relative">
                        {/* Layout móvil/tablet */}
                        <div className="md:hidden">
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 relative">
                            <div className="absolute -left-2 top-6 w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
                            <div className="pl-6">
                              <div className="flex flex-col sm:flex-row sm:items-center mb-3">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">{hito.titulo}</h3>
                                {hito.metadatos?.ano && (
                                  <span className="inline-block sm:ml-3 px-2 py-1 bg-red-100 text-red-800 text-sm rounded w-fit">
                                    {hito.metadatos.ano}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-light">
                                {hito.descripcion}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Layout desktop */}
                        <div className="hidden md:flex items-center">
                          {/* Alternar posición izquierda/derecha */}
                          {index % 2 === 0 ? (
                            <>
                              <div className="flex-1 pr-8 text-right">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                  <div className="flex items-center justify-end mb-3">
                                    <h3 className="text-xl font-semibold text-gray-900">{hito.titulo}</h3>
                                    {hito.metadatos?.ano && (
                                      <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                                        {hito.metadatos.ano}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-700 leading-relaxed font-light">
                                    {hito.descripcion}
                                  </p>
                                </div>
                              </div>
                              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
                              <div className="flex-1 pl-8"></div>
                            </>
                          ) : (
                            <>
                              <div className="flex-1 pr-8"></div>
                              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
                              <div className="flex-1 pl-8">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                  <div className="flex items-center mb-3">
                                    <h3 className="text-xl font-semibold text-gray-900">{hito.titulo}</h3>
                                    {hito.metadatos?.ano && (
                                      <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                                        {hito.metadatos.ano}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-700 leading-relaxed font-light">
                                    {hito.descripcion}
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Valores - Grid Responsive - Solo cuando hay datos */}
          {!loading && !error && valores.length > 0 && (
            <div className="mb-12 sm:mb-16 md:mb-20">
              <div className="text-center mb-12 sm:mb-14 md:mb-16 px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 sm:mb-4">
                  Nuestros <span className="font-semibold">Valores</span>
                </h2>
                <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-500 mx-auto mb-4 sm:mb-6"></div>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                  Los principios fundamentales que guían nuestras decisiones y acciones empresariales
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
                {valores.map((valor) => {
                  const IconComponent = getIconComponent(valor.icono);
                  return (
                    <div key={valor.id} className="group">
                      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 md:p-8 h-full transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
                          <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl mb-3 sm:mb-0 sm:mr-3 md:mr-4 flex-shrink-0">
                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight text-center sm:text-left">{valor.titulo}</h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-light text-center sm:text-left">
                          {valor.descripcion}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay datos específicos pero no hay error */}
          {!loading && !error && historia.length === 0 && valores.length === 0 && (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12 max-w-2xl mx-auto">
                <Target className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Información adicional no disponible</h3>
                <p className="text-gray-600 text-base sm:text-lg">
                  La información detallada sobre nuestra historia y valores estará disponible próximamente.
                </p>
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AcercaDeNosotros;