import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  MapPin,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { productApi, uploadApi } from '../api/client';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { useAuth } from '../context/AuthContext';

export const Products = () => {
  const { user } = useAuth();
  const isWarehouseOrAdmin = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialLowStock = searchParams.get('lowStockOnly') === 'true';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(initialLowStock);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: '0',
    minStockAlert: '10',
    location: 'Main Warehouse',
    imageUrl: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await productApi.list({
        page,
        limit: 10,
        search: search || undefined,
        category: categoryFilter || undefined,
        lowStockOnly: lowStockFilter ? 'true' : undefined,
      });
      if (res.data?.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productApi.getCategories();
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, lowStockFilter]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: categories[0] || 'Electrical & Motors',
      unitPrice: '',
      currentStock: '0',
      minStockAlert: '10',
      location: 'Main Warehouse',
      imageUrl: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: String(p.unitPrice),
      currentStock: String(p.currentStock),
      minStockAlert: String(p.minStockAlert),
      location: p.location,
      imageUrl: p.imageUrl || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadApi.uploadImage(file);
      if (res.data?.success) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.data.imageUrl }));
      }
    } catch (err) {
      alert('Failed to upload image: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData);
      } else {
        await productApi.create(formData);
      }
      setIsModalOpen(false);
      fetchProducts(pagination.page);
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save product.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product '${name}'?`)) return;
    try {
      await productApi.delete(id);
      fetchProducts(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage wholesale inventory, SKU codes, minimum stock alerts & S3 product media
          </p>
        </div>

        {isWarehouseOrAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r bg-[#e84b2c] px-4 py-2.5 text-xs font-bold text-white shadow-lg  transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 surface p-4  sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by product name, SKU, category, location..."
          className="flex-1 max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-[#e84b2c] focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setLowStockFilter((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              lowStockFilter
                ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                : 'border-gray-200 bg-white/80 text-gray-400 hover:text-gray-800'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Low Stock Only
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden surface shadow-xl ">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="border-b border-gray-200 bg-white/60 text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Product / SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Min Alert</th>
                <th className="py-3.5 px-4">Location</th>
                {isWarehouseOrAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-[#e84b2c] mx-auto mb-2" />
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover border border-gray-300 shrink-0"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{p.name}</p>
                          <span className="font-mono text-[11px] font-semibold text-[#e84b2c]">
                            {p.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      ₹{Number(p.unitPrice).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black ${
                            p.isLowStock ? 'text-rose-400' : 'text-[#e84b2c]'
                          }`}
                        >
                          {p.currentStock} Units
                        </span>
                        {p.isLowStock && (
                          <span
                            title="Low Stock Alert: Current stock <= Minimum alert quantity"
                            className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"
                          />
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400">{p.minStockAlert} Units</td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{p.location}</span>
                      </div>
                    </td>

                    {isWarehouseOrAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-400 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete Product"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          limit={pagination.limit}
          onPageChange={(page) => fetchProducts(page)}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. High-Torque Industrial Servo Motor 2.5kW"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                SKU / Item Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. MOT-IND-2500"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Electrical & Motors"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Unit Price (₹ INR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="12500.00"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            {!editingProduct && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Initial Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Minimum Stock Alert Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Warehouse / Bay Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Warehouse Bay A-12"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>
          </div>

          {/* S3 Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Product Image (AWS S3 / Storage)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-800 cursor-pointer hover:bg-slate-700">
                <Upload className="h-4 w-4" />
                {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Or paste public image URL..."
                className="flex-1 rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            {formData.imageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-12 w-12 rounded-lg object-cover border border-gray-300"
                />
                <span className="text-[11px] text-gray-400">Image attached successfully</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="rounded-xl bg-gradient-to-r bg-[#e84b2c] px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
