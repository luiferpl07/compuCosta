import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../../type';

interface ProductDescriptionProps {
  product: Product | null;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const [expanded, setExpanded] = useState(false);

  if (!product) return null;

  // Split description text into bullet points if available
  // If no description is available, use default features
  const descriptionItems = product.descripcion
    ? product.descripcion.split('\n').filter(item => item.trim() !== '')
    : [];
  
  // Show first 4 items, or less if there are fewer items
  const initialItems = descriptionItems.slice(0, Math.min(4, descriptionItems.length));
  const additionalItems = descriptionItems.slice(4);
  
  // Only show "Ver más" button if there are additional items
  const hasAdditionalItems = additionalItems.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full border border-gray-200 mb-8 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
      
      {descriptionItems.length > 0 ? (
        <div className="space-y-3">
          {initialItems.map((item, index) => (
            <div key={index} className="flex gap-2">
              <span className="font-medium text-gray-700 flex-shrink-0">{index + 1}.</span>
              <p className="text-gray-600">{item}</p>
            </div>
          ))}
          
          {expanded && additionalItems.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {additionalItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <span className="font-medium text-gray-700 flex-shrink-0">{initialItems.length + index + 1}.</span>
                  <p className="text-gray-600">{item}</p>
                </div>
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