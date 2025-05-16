import React from "react";
import { Target, Compass, Users } from "lucide-react";
import Container from "../ui/Container";

const AcercaDeNosotros = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Encabezado en estilo igual al de Servicio.tsx */}
      <header className="bg-gradient-to-r from-red-700 to-red-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Acerca de Nosotros
          </h1>
          <p className="text-xl text-center max-w-2xl mx-auto text-red-100">
            Conoce nuestra historia, misión y visión
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="py-16 bg-textoBlanco">
        <Container>
          <div className="text-center">
            <div className="grid md:grid-cols-2 gap-16 mb-24">
              <div className="bg-white rounded-xl shadow-xl p-12 transform hover:scale-105 transition-transform duration-300 relative">
                <div className="flex justify-center mb-8">
                  <div className="p-6 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg relative">
                    <Target className="w-16 h-16 text-white" />
                    <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-md">
                      🎯
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-semibold text-textoRojo mb-6">Nuestra Misión</h2>
                <p className="text-gray-800 leading-relaxed text-lg">
                  COMPUTADORES DE LA COSTA SAS. Es una empresa colombiana de productos y servicios informáticos de alta
                  calidad que ofrece un servicio integral basado en la eficiencia y productividad, brindando un excelente
                  precio y garantía en todos nuestros productos por estar a la vanguardia tecnológica competitiva y
                  dedicada al impulso tecnológico de la región sin dejar de lado el desarrollo sostenible.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-xl p-12 transform hover:scale-105 transition-transform duration-300 relative">
                <div className="flex justify-center mb-8">
                  <div className="p-6 bg-gradient-to-r from-red-500 to-red-700 rounded-full shadow-lg relative">
                    <Compass className="w-16 h-16 text-white" />
                    <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-md">
                      🧭
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-semibold text-textoRojo mb-6">Nuestra Visión</h2>
                <p className="text-gray-800 leading-relaxed text-lg">
                  COMPUTADORES DE LA COSTA SAS. en el año 2020 seguirá siendo líder en la venta y mantenimiento de
                  productos informáticos, ofreciendo un servicio integral, basado en la eficiencia y productividad,
                  garantizando la calidad de los materiales y asegurando el buen funcionamiento de los mismos. Como
                  instituto de capacitación COMPUTADORES DE LA COSTA SAS., será líder en la enseñanza de la informática a
                  nivel de la Costa Atlántica, utilizando métodos dirigidos al aprendizaje significativo de una manera
                  integral, preparando a los estudiantes para desempeñarse adecuadamente en este campo.
                </p>
              </div>
            </div>
            <p className="text-2xl text-textoNegro mb-8">
              COMPUTADORES DE LA COSTA SAS. como instituto de enseñanza ofrece carreras que capacitan al estudiante para
              que éste pueda desempeñarse adecuadamente en los diversos campos de acción.
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AcercaDeNosotros;