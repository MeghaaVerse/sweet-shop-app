import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { inventoryAPI, sweetsAPI } from '../utils/api';
import { Package, Plus, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react';
import type { InventoryLog, Sweet, InventoryLogRequest } from '../types';

const Inventory: React.FC = () => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const { addNotification } = useNotifications();

  const [newLog, setNewLog] = useState<InventoryLogRequest>({
    sweetId: '',
    type: 'RESTOCK',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsResponse, sweetsResponse] = await Promise.all([
        inventoryAPI.getLogs({ limit: 20 }),
        sweetsAPI.getAll()
      ]);
      setLogs(logsResponse.logs);
      setSweets(sweetsResponse.sweets);
    } catch (error: any) {
      addNotification({
        title: 'Error Loading Data',
        message: 'Failed to load inventory data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const logResponse = await inventoryAPI.logChange(newLog);
      setLogs(prev => [logResponse, ...prev]);
      
      addNotification({
        title: 'Inventory Updated',
        message: `Successfully logged ${newLog.type.toLowerCase()} for ${newLog.quantity} units`,
        type: 'success',
      });
      
      setShowLogModal(false);
      setNewLog({ sweetId: '', type: 'RESTOCK', quantity: 0, reason: '' });
      
    } catch (error: any) {
      addNotification({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to log inventory change',
        type: 'error',
      });
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'RESTOCK': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'SALE': return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case 'DAMAGE': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'EXPIRED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'RESTOCK': return 'bg-green-100 text-green-800';
      case 'SALE': return 'bg-blue-100 text-blue-800';
      case 'DAMAGE': return 'bg-orange-100 text-orange-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track stock changes and manage inventory</p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Log Inventory Change</span>
        </button>
      </div>

      {/* Inventory Logs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Inventory Changes</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getActionColor(log.type)}`}>
                      {getActionIcon(log.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{log.sweet.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.type)}`}>
                          {log.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {log.type === 'RESTOCK' ? '+' : '-'}{log.quantity} units
                      </p>
                      {log.reason && (
                        <p className="text-sm text-gray-500 mt-1">{log.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No inventory changes recorded</p>
              <p className="text-gray-400">Start by logging your first inventory change!</p>
            </div>
          )}
        </div>
      </div>

      {/* Log Inventory Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Log Inventory Change</h3>
            
            <form onSubmit={handleLogSubmit} className="space-y-4">
              <select
                value={newLog.sweetId}
                onChange={(e) => setNewLog({...newLog, sweetId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">Select Sweet</option>
                {sweets.map(sweet => (
                  <option key={sweet.id} value={sweet.id}>
                    {sweet.name} (Current: {sweet.stock})
                  </option>
                ))}
              </select>
              
              <select
                value={newLog.type}
                onChange={(e) => setNewLog({...newLog, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="RESTOCK">Restock</option>
                <option value="SALE">Sale</option>
                <option value="DAMAGE">Damage</option>
                <option value="EXPIRED">Expired</option>
              </select>
              
              <input
                type="number"
                placeholder="Quantity"
                value={newLog.quantity || ''}
                onChange={(e) => setNewLog({...newLog, quantity: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                min="1"
              />
              
              <textarea
                placeholder="Reason (optional)"
                value={newLog.reason}
                onChange={(e) => setNewLog({...newLog, reason: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 h-20 resize-none"
              />
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors"
                >
                  Log Change
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;