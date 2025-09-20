import React from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';


import { useAuth } from '../../hooks/useAuth';
import { Candy, Package, BarChart3, LogOut, Plus, Bell } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-indigo-300 to-pink-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-sm bg-white/80 border-b border-pink-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Candy className="h-8 w-8 text-pink-600 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Sweet Shop
              </h1>
            </div>

            {/* Navigation */}
           <nav className="hidden md:flex items-center space-x-8">
  <NavLink to="/dashboard" icon={<Candy />} text="Dashboard" />
  <NavLink to="/sweets" icon={<Candy />} text="Sweets" />
  <NavLink to="/inventory" icon={<Package />} text="Inventory" />
  <NavLink to="/analytics" icon={<BarChart3 />} text="Analytics" />
</nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center group">
        <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  );
};

// Navigation Link Component
const NavLink: React.FC<{ to: string; icon: ReactNode; text: string }> = ({ to, icon, text }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 group ${
        isActive 
          ? 'text-pink-600 bg-pink-50' 
          : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
      }`}
    >
      <span className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      <span>{text}</span>
    </Link>
  );
};

export default Layout;