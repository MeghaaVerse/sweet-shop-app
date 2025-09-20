import React from 'react';
import type { Sweet } from '../../types';

import { Edit, Trash2, Package, DollarSign } from 'lucide-react';

interface SweetCardProps {
  sweet: Sweet;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (sweet: Sweet) => void;
  onStockUpdate?: (sweet: Sweet) => void;
}

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onEdit, onDelete, onStockUpdate }) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600 bg-red-100', text: 'Out of Stock', pulse: true };
    if (stock <= 5) return { color: 'text-orange-600 bg-orange-100', text: 'Low Stock', pulse: true };
    return { color: 'text-green-600 bg-green-100', text: 'In Stock', pulse: false };
  };

  const stockStatus = getStockStatus(sweet.stock);

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-pink-100">
      {/* Card Header with Image */}
      <div className="relative h-48 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">
        {sweet.imageUrl ? (
          <img
            src={sweet.imageUrl}
            alt={sweet.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍭</span>
            </div>
          </div>
        )}
        
        {/* Stock Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.color} ${stockStatus.pulse ? 'animate-pulse' : ''}`}>
          {stockStatus.text}
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="text-sm font-bold text-gray-900">{sweet.price}</span>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          {onEdit && (
            <button
              onClick={() => onEdit(sweet)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transform hover:scale-110 transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onStockUpdate && (
            <button
              onClick={() => onStockUpdate(sweet)}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transform hover:scale-110 transition-all duration-200"
            >
              <Package className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(sweet)}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:scale-110 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-200">
            {sweet.name}
          </h3>
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-600 rounded-full">
            {sweet.category}
          </span>
        </div>

        {sweet.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {sweet.description}
          </p>
        )}

        {/* Stock Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Stock: <span className="font-semibold">{sweet.stock}</span>
            </span>
          </div>
          <div className="text-xs text-gray-500">
            by {sweet.createdBy.name}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-tl from-pink-200 to-transparent rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
      <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-purple-200 to-transparent rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
    </div>
  );
};

export default SweetCard;