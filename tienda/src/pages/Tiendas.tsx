import React from "react";
import { sede1 , sede2 } from "../assets";

const Tiendas = () => {
  // Lista de sucursales con imágenes
  const sucursales = [
    {
      id: 1,
      nombre: "SEDE PRINCIPAL COMPUTADORES DE LA COSTA",
      direccion: "Cr20 19-09 Ford, Sincelejo, Sucre",
      posicion: { lat: 4.711, lng: -74.0721 },
      imagen: sede1,
    },
    {
      id: 2,
      nombre: "SEDE LOCAL 2312 DEL PARQUE COMERCIAL GUACARI",
      direccion: "Parque comercial guacari , Sincelejo, Sucre",
      posicion: { lat: 6.2518, lng: -75.5636 },
      imagen: sede2,
    },
  ];

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-center">Nuestras Sucursales</h1>

      {/* Lista de sucursales */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {sucursales.map((sucursal) => (
          <li
            key={sucursal.id}
            className="border rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={sucursal.imagen}
              alt={sucursal.nombre}
              className="w-full h-45 object-cover"
            />
            <div className="p-4 text-center">
              <h2 className="text-xl font-semibold">{sucursal.nombre}</h2>
              <p className="text-sm text-gray-600">{sucursal.direccion}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tiendas;
