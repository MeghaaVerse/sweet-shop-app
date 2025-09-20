import React from 'react';
import type { LucideIcon } from 'lucide-react';


interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'pink' | 'purple' | 'indigo' | 'green' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'pink',
  trend 
}) => {
  const colorClasses = {
    pink: 'from-pink-500 to-pink-600 bg-pink-100 text-pink-600',
    purple: 'from-purple-500 to-purple-600 bg-purple-100 text-purple-600',
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-100 text-indigo-600',
    green: 'from-green-500 to-green-600 bg-green-100 text-green-600',
    orange: 'from-orange-500 to-orange-600 bg-orange-100 text-orange-600',
    red: 'from-red-500 to-red-600 bg-red-100 text-red-600',
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 transform rotate-45 translate-x-16 -translate-y-16 bg-gradient-to-br from-gray-900 to-transparent"></div>
      </div>

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[2]} ${colorClasses[color].split(' ')[3]}`}>
            <Icon className="h-6 w-6" />
          </div>
          
          {trend && (
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Decorative gradient */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}></div>
    </div>
  );
};

export default StatsCard;