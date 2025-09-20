import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import { ShoppingCart, User, LogOut, Home } from 'lucide-react';

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { customer, logout } = useCustomerAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🍭</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Sweet Shop
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 font-medium">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              
              <Link to="/admin-login" className="text-gray-700 hover:text-pink-600 font-medium">
                Admin Login
              </Link>

              {/* Customer Auth */}
              {customer ? (
                <div className="flex items-center space-x-4">
                  <Link to="/my-orders" className="flex items-center space-x-2 text-gray-700 hover:text-pink-600">
                    <ShoppingCart className="h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{customer.name}</span>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/customer-login" className="text-pink-600 hover:text-pink-700 font-medium">
                    Sign In
                  </Link>
                  <Link to="/customer-register" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🍭</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Sweet Shop</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Your one-stop destination for delicious sweets and treats. 
                Fresh, quality sweets made with love.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-600 hover:text-pink-600">Home</Link></li>
                <li><Link to="/customer-login" className="text-gray-600 hover:text-pink-600">Customer Login</Link></li>
                <li><Link to="/admin-login" className="text-gray-600 hover:text-pink-600">Admin Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-600">
                <li>📧 info@sweetshop.com</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>📍 123 Sweet Street, Candy City</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600">© 2025 Sweet Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;