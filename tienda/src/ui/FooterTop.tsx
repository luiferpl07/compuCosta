import React from "react";
import { Link } from "react-router-dom"; // Importa Link desde react-router-dom
import { FcShipped, FcSupport } from "react-icons/fc";
import { SiHomeassistantcommunitystore } from "react-icons/si";

import Container from "./Container";

const FooterTop = () => {
  const incentives = [
    {
      name: "Envíos a toda Colombia",
      icon: <FcShipped className="mx-auto h-12 w-12 text-textoAmarillo" />,
      description: "Tus envíos van asegurados y llegan rápidamente.",
      link: "/envios", // Ruta a la que redirige
    },
    {
      name: "Nuestras tiendas",
      icon: <SiHomeassistantcommunitystore className="mx-auto h-12 w-12 text-textoRojo" />,
      description: "Conoce nuestro punto de venta más cercano a ti.",
      link: "/tiendas", // Ruta a la que redirige
    },
    {
      name: "Soporte técnico",
      icon: <FcSupport className="mx-auto h-12 w-12 text-textoAmarillo" />,
      description: "Servicio y Atención Especializada.",
      link: "/soporte", // Ruta a la que redirige
    },
  ];

  return (
    <Container className="py-0">
      <div className="rounded-2xl bg-textoGrisClaro px-6 py-16 sm:p-16">
        <div className="mx-auto mt-12 grid max-w-sm grid-cols-1 gap-8 sm:max-w-none lg:grid-cols-3">
          {incentives.map((item) => (
            <Link to={item.link} key={item.name}>
              <div className="text-center sm:flex sm:text-left lg:block lg:text-center group cursor-pointer">
                <div className="sm:flex-shrink-0">
                  <div className="flex-root">{item.icon}</div>
                </div>
                <div className="mt-3 sm:ml-6 lg:ml-0">
                  <h3 className="text-base font-medium text-textoRojo group-hover:underline">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-textoNegro">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default FooterTop;
