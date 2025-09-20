import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationService } from '../utils/notificationService';
import { sweetsAPI } from '../utils/api';
import SweetCard from '../components/common/SweetCard';
import type { Sweet, CreateSweetRequest } from '../types';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';

const Sweets: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  
  const { addNotification } = useNotifications();
  const notificationService = useNotificationService();

  const [newSweet, setNewSweet] = useState<CreateSweetRequest>({
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    stock: 0,
  });

  useEffect(() => {
    loadSweets();
    loadCategories();
  }, []);

  const loadSweets = async () => {
    try {
      setLoading(true);
      const response = await sweetsAPI.getAll();
      setSweets(response.sweets);
    } catch (error: any) {
      addNotification({
        title: 'Error Loading Sweets',
        message: error.response?.data?.message || 'Failed to load sweets',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await sweetsAPI.getCategories();
      setCategories(response.categories.map(cat => cat.name));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSweet(null);
    setNewSweet({
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
      stock: 0,
    });
    setShowAddModal(true);
  };

  const handleEditSweet = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setNewSweet({
      name: sweet.name || '',
      description: sweet.description || '',
      price: sweet.price || 0,
      category: sweet.category || '',
      imageUrl: sweet.imageUrl || '',
      stock: sweet.stock || 0,
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSweet(null);
    setNewSweet({
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
      stock: 0,
    });
  };


  const handleAddSweet = async (e: React.FormEvent) => {
    e.preventDefault();

    
    
    try {
      const payload: any = { ...newSweet };
        if (!payload.imageUrl) {
        delete payload.imageUrl; // don’t send empty string
        }
        const sweet = await sweetsAPI.create(payload);
      setSweets(prev => [sweet, ...prev]);
      
      notificationService.onSweetAdded(newSweet.name);
      
      // Reset form and close modal
      setNewSweet({
        name: '',
        description: '',
        price: 0,
        category: '',
        imageUrl: '' ,
        stock: 0,
      });
      setShowAddModal(false);
      
    } catch (error: any) {
      addNotification({
        title: 'Failed to Add Sweet',
        message: error.response?.data?.message || 'Something went wrong',
        type: 'error',
      });
    }
  };

 
 

  const handleDeleteSweet = async (sweet: Sweet) => {
    if (window.confirm(`Are you sure you want to delete ${sweet.name}?`)) {
      try {
        await sweetsAPI.delete(sweet.id);
        setSweets(prev => prev.filter(s => s.id !== sweet.id));
        
        addNotification({
          title: 'Sweet Deleted',
          message: `${sweet.name} has been removed from your inventory`,
          type: 'success',
        });
      } catch (error: any) {
        addNotification({
          title: 'Delete Failed',
          message: error.response?.data?.message || 'Failed to delete sweet',
          type: 'error',
        });
      }
    }
  };

  const handleStockUpdate = (sweet: Sweet) => {
    addNotification({
      title: 'Stock Update',
      message: `Opening stock management for ${sweet.name}`,
      type: 'info',
      action: {
        label: 'Go to Inventory',
        onClick: () => window.location.href = '/inventory'
      }
    });
  };

  const filteredSweets = sweets.filter(sweet => {
    const matchesSearch = sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sweet.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || sweet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sweet Management</h1>
          <p className="text-gray-600 mt-1">Manage your delicious inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Sweet</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sweets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sweets Grid/List */}
      {filteredSweets.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredSweets.map((sweet) => (
            <SweetCard
              key={sweet.id}
              sweet={sweet}
              onEdit={handleEditSweet}
              onDelete={handleDeleteSweet}
              onStockUpdate={handleStockUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍭</div>
          <p className="text-xl text-gray-600 mb-2">No sweets found</p>
          <p className="text-gray-500">Try adjusting your search or add some new sweets!</p>
        </div>
      )}

      {/* Add Sweet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-90vh overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Sweet</h3>
            
            <form onSubmit={handleAddSweet} className="space-y-4">
              <input
                type="text"
                placeholder="Sweet name"
                value={newSweet.name}
                onChange={(e) => setNewSweet({...newSweet, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              
              <textarea
                placeholder="Description (optional)"
                value={newSweet.description}
                onChange={(e) => setNewSweet({...newSweet, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 h-20 resize-none"
              />
              
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newSweet.price || ''}
                onChange={(e) => setNewSweet({...newSweet, price: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              
              <input
                type="text"
                placeholder="Category"
                value={newSweet.category}
                onChange={(e) => setNewSweet({...newSweet, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              
              <input
                type="url"
                placeholder="Image URL (optional)"
                value={newSweet.imageUrl}
                onChange={(e) => setNewSweet({...newSweet, imageUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              
              <input
                type="number"
                placeholder="Initial stock"
                value={newSweet.stock || ''}
                onChange={(e) => setNewSweet({...newSweet, stock: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors"
                >
                  Add Sweet
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

export default Sweets;

function setEditingSweet(sweet: Sweet) {
    throw new Error('Function not implemented.');
}
