import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sweetsAPI } from '../utils/api';
import type { Sweet } from '../types';
import { ShoppingCart, User, Settings, Star } from 'lucide-react';

const Landing: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSweets();
  }, []);

  const loadSweets = async () => {
    try {
      const response = await sweetsAPI.getAll({ limit: 12, isActive: true });
      setSweets(response.sweets);
    } catch (error) {
      console.error('Failed to load sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-3xl">🍭</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Sweet Shop
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Delicious sweets and treats made with love
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Customer Card */}
            <Link
              to="/customer-register"
              className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-100 overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">I'm a Customer</h3>
                <p className="text-gray-600 mb-6">
                  Browse and purchase delicious sweets, view your order history, and enjoy our treats!
                </p>
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium group-hover:from-green-600 group-hover:to-blue-600 transition-colors">
                  Shop Now
                </div>
              </div>
            </Link>

            {/* Admin Card */}
            <Link
              to="/admin-login"
              className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-pink-100 overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">I'm an Admin</h3>
                <p className="text-gray-600 mb-6">
                  Manage inventory, analyze sales, track orders, and oversee your sweet shop business.
                </p>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium group-hover:from-purple-600 group-hover:to-pink-600 transition-colors">
                  Admin Portal
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Sweets Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Delicious Sweets</h2>
            <p className="text-gray-600">Discover our amazing collection of treats</p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sweets.slice(0, 8).map((sweet) => (
                <div key={sweet.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-pink-100 transform hover:-translate-y-1 transition-all duration-300">
                  <div className="h-48 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 relative">
                    {sweet.imageUrl ? (
                      <img
                        src={sweet.imageUrl}
                        alt={sweet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🍭</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-sm font-bold text-green-600">${sweet.price}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{sweet.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{sweet.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Stock: {sweet.stock}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/customer-register"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-colors inline-flex items-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;