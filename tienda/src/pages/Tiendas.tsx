import  { useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { sede1, sede2 } from "../assets";
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';


const Tiendas = () => {
  // Lista de sucursales con imágenes
  const sucursales = [
    {
      id: 1,
      nombre: "SEDE PRINCIPAL COMPUTADORES DE LA COSTA",
      direccion: "Cr20 19-09 Ford, Sincelejo, Sucre",
      posicion: { lat: 9.3040768, lng: -75.3942819 },
      imagen: sede1,
      telefono: "+57 320 555 4321",
      horario: "Lunes a Viernes: 8am - 6pm"
    },
    {
      id: 2,
      nombre: "SEDE LOCAL 2312 DEL PARQUE COMERCIAL GUACARI",
      direccion: "Parque comercial guacari, Sincelejo, Sucre",
      posicion: { lat: 9.301801197930754, lng:  -75.3830689564357 },
      imagen: sede2,
      telefono: "+57 321 666 5432",
      horario: "Lunes a Sábado: 9am - 7pm"
    }
  ];

  useEffect(() => {
    // Cargar el mapa de manera dinámica
    const loadMap = async () => {
      try {
        // Verificar si Leaflet está disponible
        if (typeof L !== 'undefined') {
          const map = L.map('map').setView([9.3050, -75.3919], 14);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Añadir marcadores
          sucursales.forEach(sucursal => {
            L.marker([sucursal.posicion.lat, sucursal.posicion.lng], {
              icon: L.icon({
                iconUrl: markerIconPng,  // 🟢 Usa la imagen importada
                shadowUrl: markerShadowPng, // 🟢 Usa la sombra del icono
                iconSize: [20, 35],
                iconAnchor: [10, 38],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
            }).addTo(map)
              .bindPopup(`
                <b>${sucursal.nombre}</b><br>
                ${sucursal.direccion}<br>
                📞 ${sucursal.telefono}<br>
                ⏰ ${sucursal.horario}
              `);
          });
        }
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    loadMap();
  }, []);

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">Nuestras Sucursales</h1>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6">
        {/* Lista de Sucursales */}
        <div>
          <ul className="grid grid-cols-1 gap-4">
            {sucursales.map((sucursal) => (
              <li
                key={sucursal.id}
                className="border rounded-lg shadow-md overflow-hidden flex"
              >
                <img
                  src={sucursal.imagen}
                  alt={sucursal.nombre}
                  className="w-1/3 object-cover"
                />
                <div className="p-4 w-2/3">
                  <h2 className="text-xl font-semibold mb-2">{sucursal.nombre}</h2>
                  <p className="text-sm text-gray-600 mb-1">📍 {sucursal.direccion}</p>
                  <p className="text-sm text-gray-600 mb-1">📞 {sucursal.telefono}</p>
                  <p className="text-sm text-gray-600">⏰ {sucursal.horario}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Mapa */}
        <div 
          id="map" 
          className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg"
        />
      </div>
    </div>
  );
};

export default Tiendas;