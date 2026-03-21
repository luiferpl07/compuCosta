import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../../type';

interface ProductDescriptionProps {
  product: Product | null;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const [expanded, setExpanded] = useState(false);

  if (!product) return null;

  // Dividir el texto de descripción en párrafos si está disponible
  const descriptionItems = product.descripcion
    ? product.descripcion.split('\n').filter(item => item.trim() !== '')
    : [];
  
  // Mostrar los primeros 3 párrafos, o menos si hay menos elementos
  const initialItems = descriptionItems.slice(0, Math.min(3, descriptionItems.length));
  const additionalItems = descriptionItems.slice(3);
  
  // Solo mostrar el botón "Ver más" si hay elementos adicionales
  const hasAdditionalItems = additionalItems.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full border border-gray-200 mb-8 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
      
      {descriptionItems.length > 0 ? (
        <div className="space-y-3">
          {initialItems.map((item, index) => (
            <p key={index} className="text-gray-600 leading-relaxed">{item}</p>
          ))}
          
          {expanded && additionalItems.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {additionalItems.map((item, index) => (
                <p key={index} className="text-gray-600 leading-relaxed">{item}</p>
              ))}
            </div>
          )}
          
          {hasAdditionalItems && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
            >
              <span>Ver {expanded ? 'menos' : 'descripción completa'}</span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">No hay descripción disponible para este producto.</p>
      )}
    </div>
  );
};

export default ProductDescription;