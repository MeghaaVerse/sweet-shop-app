import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { sweetsAPI, inventoryAPI } from '../utils/api';
import StatsCard from '../components/common/StatsCard';
import SweetCard from '../components/common/SweetCard';
import { 
  Candy, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Clock
} from 'lucide-react';
import { Sweet, InventoryReport, StockAlert } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [sweetsResponse, reportResponse, alertsResponse] = await Promise.all([
        sweetsAPI.getAll({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
        inventoryAPI.getReport(),
        inventoryAPI.getAlerts({ threshold: 10 })
      ]);

      setSweets(sweetsResponse.sweets);
      setReport(reportResponse);
      setAlerts(alertsResponse.alerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredSweets = sweets.filter(sweet =>
    sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your sweet dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {getGreeting()}, {user?.name}! 👋
                </h1>
                <p className="text-white/80 text-lg">
                  Ready to manage your sweet inventory today?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-white/80 text-sm">Today</p>
                  <p className="text-2xl font-bold">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sweets"
          value={report?.totalSweets || 0}
          subtitle="Active products"
          icon={Candy}
          color="pink"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Value"
          value={`$${report?.totalValue?.toFixed(2) || '0.00'}`}
          subtitle="Inventory worth"
          icon={DollarSign}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Low Stock Items"
          value={report?.lowStockItems?.length || 0}
          subtitle="Need attention"
          icon={AlertTriangle}
          color="orange"
          trend={{ value: 3, isPositive: false }}
        />
        <StatsCard
          title="Categories"
          value={report?.categoryBreakdown?.length || 0}
          subtitle="Product types"
          icon={Package}
          color="purple"
        />
      </div>

      {/* Stock Alerts */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Stock Alerts</h2>
            <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
              {alerts.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.slice(0, 6).map((alert) => (
              <div key={alert.sweetId} className="bg-white rounded-xl p-4 border border-orange-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{alert.sweetName}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.severity === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-600' :
                    alert.severity === 'CRITICAL' ? 'bg-orange-100 text-orange-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {alert.severity.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Stock: <span className="font-semibold">{alert.currentStock}</span> units
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sweets */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent Sweets</h2>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sweets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Sweet</span>
            </button>
          </div>
        </div>

        {filteredSweets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onEdit={(sweet) => console.log('Edit:', sweet)}
                onDelete={(sweet) => console.log('Delete:', sweet)}
                onStockUpdate={(sweet) => console.log('Stock update:', sweet)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Candy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sweets found</p>
            <p className="text-gray-400">Try adjusting your search or add some new sweets!</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {report?.recentActivities && report.recentActivities.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {report.recentActivities.slice(0, 5).map((activity) => (
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

export default Dashboard;