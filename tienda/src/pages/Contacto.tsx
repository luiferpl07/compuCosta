import React, { useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import { Phone, MapPin, Clock, User, MessageCircle } from "lucide-react";
import Container from "../ui/Container";
import { config } from "../../config";
import { contacto } from "../assets";

interface ContactoInfo {
  id: string;
  tipo: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  horario?: string;
  latitud?: number;
  longitud?: number;
  imagenUrl?: string;
  rol?: string;
  sedeId?: string;
  orden: number;
  activo: boolean;
}

const Contactos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sedes, setSedes] = useState<ContactoInfo[]>([]);
  const [personal, setPersonal] = useState<ContactoInfo[]>([]);

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

        // Fetch sedes
        const sedesResponse = await fetch(`${apiBaseUrl}/contactos?tipo=sede&activo=true`, fetchOptions);
        if (!sedesResponse.ok) {
          throw new Error(`Error ${sedesResponse.status}: ${sedesResponse.statusText}`);
        }
        const sedesData = await sedesResponse.json();
        setSedes(sedesData);

        // Fetch personal
        const personalResponse = await fetch(`${apiBaseUrl}/contactos?tipo=personal&activo=true`, fetchOptions);
        if (!personalResponse.ok) {
          throw new Error(`Error ${personalResponse.status}: ${personalResponse.statusText}`);
        }
        const personalData = await personalResponse.json();
        setPersonal(personalData);

      } catch (err) {
        setError('Error al cargar la información de contacto');
        console.error('Error fetching contact data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Agrupar personal por sede
  const personalPorSede = sedes.map(sede => ({
    sede: sede,
    personal: personal.filter(p => p.sedeId === sede.id)
  })).filter(grupo => grupo.personal.length > 0);

  useEffect(() => {
    if (!loading && sedes.length > 0) {
      // Cargar el mapa de manera dinámica
      const loadMap = async () => {
        try {
          // Verificar si Leaflet está disponible
          if (typeof L !== 'undefined') {
            // Agregar estilos CSS para evitar superposición
            const style = document.createElement('style');
            style.textContent = `
              #map {
                z-index: 1 !important;
                position: relative !important;
              }
              .leaflet-container {
                z-index: 1 !important;
              }
              .leaflet-control-container {
                z-index: 2 !important;
              }
              .leaflet-popup {
                z-index: 3 !important;
              }
            `;
            document.head.appendChild(style);

            // Usar coordenadas de la primera sede o coordenadas por defecto
            const defaultLat = sedes[0]?.latitud || 9.3050;
            const defaultLng = sedes[0]?.longitud || -75.3919;

            const map = L.map('map', {
              zoomControl: true,
              scrollWheelZoom: true,
              dragging: true,
              touchZoom: true
            }).setView([defaultLat, defaultLng], 14);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Añadir marcadores para cada sede
            sedes.forEach(sede => {
              if (sede.latitud && sede.longitud) {
                L.marker([sede.latitud, sede.longitud], {
                  icon: L.icon({
                    iconUrl: markerIconPng,
                    shadowUrl: markerShadowPng,
                    iconSize: [20, 35],
                    iconAnchor: [10, 38],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })
                }).addTo(map)
                  .bindPopup(`
                    <b>${sede.nombre}</b><br>
                    ${sede.direccion || ''}<br>
                    ${sede.telefono ? `📞 ${sede.telefono}<br>` : ''}
                    ${sede.horario ? `⏰ ${sede.horario}` : ''}
                  `);
              }
            });

            // Invalidar el tamaño del mapa después de que se cargue
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          }
        } catch (error) {
          console.error("Error loading map:", error);
        }
      };

      loadMap();
    }
  }, [loading, sedes]);

  return (
    <div className="min-h-screen bg-white">
      {/* Encabezado Profesional - Siempre visible */}
      <header className="relative bg-cover bg-center text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden"
              style={{ backgroundImage: `url(${contacto})` }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className=" text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 tracking-tight">
             <span className="font-semibold">Contacto y Atención</span>
            </h1>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-600 mx-auto mb-6 sm:mb-8"></div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-light px-4">
              <span className="font-semibold">Estamos aquí para brindarte la mejor atención personalizada </span>
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
                <p className="text-sm sm:text-base text-gray-600">Cargando información de contacto...</p>
              </div>
            </div>
          )}

          {/* Estado de error */}
          {error && !loading && (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12 max-w-md mx-auto">
                <User className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
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

          {/* Cards de Personal por Sede - Solo cuando hay datos */}
          {!loading && !error && personalPorSede.length > 0 && (
            <div className="mb-16 sm:mb-20 md:mb-28">
              <div className="text-center mb-12 sm:mb-14 md:mb-16 px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 sm:mb-4">
                  Nuestro Equipo de <span className="font-semibold">Atención</span>
                </h2>
                <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-500 mx-auto mb-4 sm:mb-6"></div>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                  Personal especializado listo para atenderte en cada una de nuestras sedes
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
                {personalPorSede.map((grupo) => (
                  <div key={grupo.sede.id} className="group">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10 h-full transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8">
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-0 sm:mr-4 md:mr-6">
                          <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2 leading-tight">{grupo.sede.nombre}</h3>
                          <div className="w-8 sm:w-10 md:w-12 h-0.5 bg-red-500 mx-auto sm:mx-0"></div>
                        </div>
                      </div>
                      
                      {grupo.sede.horario && (
                        <div className="mb-4 sm:mb-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center text-gray-600 mb-2">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-0 sm:mr-3 mb-2 sm:mb-0 text-red-500" />
                            <span className="font-light text-base sm:text-lg">{grupo.sede.horario}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-4 sm:space-y-6">
                        {grupo.personal.map((persona) => (
                          <div key={persona.id} className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-red-400">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
                              <div className="flex-1 mb-3 sm:mb-0">
                                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 leading-tight">{persona.nombre}</h4>
                                {persona.rol && (
                                  <p className="text-sm sm:text-base text-gray-600 font-light">{persona.rol}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              {persona.telefono && (
                                <div className="flex items-start">
                                  <Phone className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Teléfono</p>
                                    <a 
                                      href={`tel:${persona.telefono}`}
                                      className="text-sm sm:text-base text-red-600 hover:text-red-800 font-medium break-all"
                                    >
                                      {persona.telefono}
                                    </a>
                                  </div>
                                </div>
                              )}
                              
                              {persona.whatsapp && (
                                <div className="flex items-start">
                                  <MessageCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs sm:text-sm text-gray-500">WhatsApp</p>
                                    <a 
                                      href={`https://wa.me/${persona.whatsapp.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm sm:text-base text-green-600 hover:text-green-800 font-medium break-all"
                                    >
                                      {persona.whatsapp}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de Sucursales - Solo cuando hay datos */}
          {!loading && !error && sedes.length > 0 && (
            <div className="mb-12 sm:mb-16 md:mb-20">
              <div className="text-center mb-12 sm:mb-14 md:mb-16 px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-3 sm:mb-4">
                  Nuestras <span className="font-semibold">Sucursales</span>
                </h2>
                <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-red-500 mx-auto mb-4 sm:mb-6"></div>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                  Visítanos en cualquiera de nuestras ubicaciones estratégicas
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
                {/* Lista de Sucursales */}
                <div className="space-y-6 sm:space-y-8">
                  {sedes.map((sucursal) => (
                    <div key={sucursal.id} className="group">
                      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
                        <div className="flex flex-col md:flex-row">
                          {sucursal.imagenUrl && (
                            <div className="w-full md:w-2/5">
                              <img
                                src={
                                  sucursal.imagenUrl.startsWith("http")
                                    ? sucursal.imagenUrl
                                    : `${config.baseUrl}${sucursal.imagenUrl}`
                                }
                                alt={sucursal.nombre}
                                className="w-full h-48 sm:h-56 md:h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className={`p-6 sm:p-8 ${sucursal.imagenUrl ? 'md:w-3/5' : 'w-full'}`}>
                            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-tight">
                              {sucursal.nombre}
                            </h3>
                            
                            <div className="space-y-2 sm:space-y-3">
                              {sucursal.direccion && (
                                <div className="flex items-start">
                                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                                  <span className="text-sm sm:text-base text-gray-700 font-light leading-relaxed">{sucursal.direccion}</span>
                                </div>
                              )}
                              
                              {sucursal.telefono && (
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
                                  <a 
                                    href={`tel:${sucursal.telefono}`}
                                    className="text-sm sm:text-base text-gray-700 font-light hover:text-red-600 transition-colors"
                                  >
                                    {sucursal.telefono}
                                  </a>
                                </div>
                              )}
                              
                              {sucursal.horario && (
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
                                  <span className="text-sm sm:text-base text-gray-700 font-light">{sucursal.horario}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mapa */}
                <div className="group order-first lg:order-last">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 transition-all duration-500 hover:shadow-lg hover:-translate-y-1">
                    <div 
                      id="map" 
                      className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg sm:rounded-xl overflow-hidden relative"
                      style={{ zIndex: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje si no hay datos - Solo cuando no está cargando y no hay error */}
          {!loading && !error && sedes.length === 0 && personal.length === 0 && (
            <div className="text-center py-12 sm:py-16 md:py-20 px-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12 max-w-md mx-auto">
                <User className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-gray-400 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">No hay información disponible</h3>
                <p className="text-gray-600 text-base sm:text-lg">No hay información de contacto disponible en este momento</p>
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Contactos;