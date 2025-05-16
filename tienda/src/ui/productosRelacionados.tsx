import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  discount?: number;
  isNew?: boolean;
}

interface RelatedProductsProps {
  productId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ productId }) => {
  // Mock data - in a real app, this would come from an API based on the current product
  const relatedProducts: Product[] = [
    {
      id: '456',
      name: 'Redragon K552 Teclado Mecánico Gaming',
      price: 49.99,
      originalPrice: 59.99,
      rating: 4.7,
      reviewCount: 1245,
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      discount: 17
    },
    {
      id: '789',
      name: 'Redragon H510 Zeus Auriculares Gaming',
      price: 39.99,
      rating: 4.5,
      reviewCount: 867,
      imageUrl: 'https://images.unsplash.com/photo-1618346136472-090de27fe8b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      isNew: true
    },
    {
      id: '101',
      name: 'Redragon M711 Cobra Mouse Gaming',
      price: 29.99,
      originalPrice: 34.99,
      rating: 4.6,
      reviewCount: 1032,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
      discount: 14
    },
    {
      id: '202',
      name: 'Redragon P023 Mousepad Gaming XL',
      price: 19.99,
      rating: 4.4,
      reviewCount: 578,
      imageUrl: 'https://images.unsplash.com/photo-1616788373791-1d4794500268?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Productos relacionados</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-48 object-cover"
              />
              
              {product.discount && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{product.discount}%
                </div>
              )}
              
              {product.isNew && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  NUEVO
                </div>
              )}
              
              <button className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors">
                <ShoppingCart size={18} />
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-800 mb-1 text-sm line-clamp-2 h-10">
                {product.name}
              </h3>
              
              <div className="flex items-center mb-2">
                <div className="flex mr-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={`${
                        star <= Math.round(product.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.reviewCount})</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-500 line-through ml-1">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;