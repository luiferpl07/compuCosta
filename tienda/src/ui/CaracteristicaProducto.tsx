import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Product } from "../../type";

interface CaracteristicaProductoProps {
  producto: Product | null;
}

const CaracteristicaProducto: React.FC<CaracteristicaProductoProps> = ({ producto }) => {
  const [expanded, setExpanded] = useState(false);

  if (!producto) return null;

  // Dividir características en array si están disponibles
  const caracteristicasItems = producto.caracteristica
    ? producto.caracteristica.split("\n").filter((item) => item.trim() !== "")
    : [];

  // Mostrar primeros 4 elementos o menos si hay menos elementos
  const elementosIniciales = caracteristicasItems.slice(0, Math.min(6, caracteristicasItems.length));
  const elementosAdicionales = caracteristicasItems.slice(6);

  // Solo mostrar botón "Ver más" si hay elementos adicionales
  const tieneElementosAdicionales = elementosAdicionales.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full border border-gray-200 mb-8 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Características</h2>

      {caracteristicasItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {elementosIniciales.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-gray-700">•</span>
              <p className="text-gray-600">{item}</p>
            </div>
          ))}

          {expanded &&
            elementosAdicionales.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-gray-700">•</span>
                <p className="text-gray-600">{item}</p>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No hay características disponibles para este producto.</p>
      )}

      {tieneElementosAdicionales && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
        >
          <span>Ver {expanded ? "menos" : "características completas"}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  );
};

export default CaracteristicaProducto;
