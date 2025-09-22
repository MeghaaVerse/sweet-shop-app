import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { inventoryAPI } from '../utils/api';
import StatsCard from '../components/common/StatsCard';
import { BarChart3, TrendingUp, Package, DollarSign, PieChart, Calendar } from 'lucide-react';
import type { InventoryReport } from '../types';

const Analytics: React.FC = () => {
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const reportData = await inventoryAPI.getReport();
      setReport(reportData);
    } catch (error: any) {
      addNotification({
        title: 'Error Loading Analytics',
        message: 'Failed to load analytics data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Insights and reports for your sweet shop</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${report?.totalValue?.toFixed(2) || '0.00'}`}
          subtitle="Inventory worth"
          icon={DollarSign}
          color="green"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Total Products"
          value={report?.totalSweets || 0}
          subtitle="Active sweets"
          icon={Package}
          color="purple"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Categories"
          value={report?.categoryBreakdown?.length || 0}
          subtitle="Product types"
          icon={PieChart}
          color="indigo"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={report?.lowStockItems?.length || 0}
          subtitle="Need attention"
          icon={TrendingUp}
          color="orange"
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* Category Breakdown */}
      {report?.categoryBreakdown && report.categoryBreakdown.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Category Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.categoryBreakdown.map((category, index) => (
              <div key={category.category} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Items: <span className="font-medium">{category.totalItems}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Value: <span className="font-medium">${category.totalValue.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg Stock: <span className="font-medium">{category.averageStock.toFixed(1)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Items */}
      {report?.lowStockItems && report.lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center space-x-3 mb-6">
            <Package className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Low Stock Alert</h2>
            <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
              {report.lowStockItems.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.lowStockItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                    {item.currentStock} left
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Category: {item.category}
                </p>
                <p className="text-sm text-gray-600">
                  Value: ${(item.price * item.currentStock).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {report?.recentActivities && report.recentActivities.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {report.recentActivities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'RESTOCK' ? 'bg-green-100 text-green-600' :
                  activity.type === 'SALE' ? 'bg-blue-100 text-blue-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {activity.type === 'RESTOCK' ? '📈' : 
                   activity.type === 'SALE' ? '💰' : '⚠️'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type.toLowerCase()} - {activity.sweet.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {activity.quantity} units • {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;