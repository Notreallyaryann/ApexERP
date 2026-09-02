import React, { useState, useEffect } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
} from 'lucide-react';
import { inventoryApi, productApi } from '../api/client';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { useAuth } from '../context/AuthContext';

export const Inventory = () => {
  const { user } = useAuth();
  const isWarehouseOrAdmin = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  const [movements, setMovements] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('');

  // Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    movementType: 'IN',
    quantity: '10',
    reason: 'Standard Warehouse Restock',
  });
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchMovements = async (page = 1) => {
    setLoading(true);
    try {
      const res = await inventoryApi.listMovements({
        page,
        limit: 15,
        search: search || undefined,
        movementType: movementTypeFilter || undefined,
      });
      if (res.data?.success) {
        setMovements(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error loading stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productApi.list({ limit: 100 });
      if (res.data?.success) {
        setProductsList(res.data.data);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovements(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, movementTypeFilter]);

  const handleOpenAdjustModal = () => {
    const firstProd = productsList[0];
    setFormData({
      productId: firstProd ? firstProd.id : '',
      movementType: 'IN',
      quantity: '10',
      reason: 'Physical Inventory Audit Restock',
    });
    setSelectedProductDetails(firstProd || null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleProductSelectChange = (prodId) => {
    const prod = productsList.find((p) => p.id === prodId);
    setFormData((prev) => ({ ...prev, productId: prodId }));
    setSelectedProductDetails(prod || null);
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      await inventoryApi.adjustStock(formData);
      setIsModalOpen(false);
      fetchMovements(1);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Adjustment failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Inventory & Stock Movements
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Immutable audit log for all inbound & outbound stock changes and manual adjustments
          </p>
        </div>

        {isWarehouseOrAdmin && (
          <button
            onClick={handleOpenAdjustModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Manual Stock Adjustment (IN / OUT)
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 surface p-4  sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by reason, product name, or SKU..."
          className="flex-1 max-w-md"
        />

        <div className="flex items-center gap-2">
          <select
            value={movementTypeFilter}
            onChange={(e) => setMovementTypeFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-[#e84b2c] focus:outline-none"
          >
            <option value="">All Movements (IN & OUT)</option>
            <option value="IN">Inward (+IN)</option>
            <option value="OUT">Outward (-OUT)</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="overflow-hidden surface shadow-xl ">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="border-b border-gray-200 bg-white/60 text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Movement</th>
                <th className="py-3.5 px-4">Product / SKU</th>
                <th className="py-3.5 px-4">Quantity Changed</th>
                <th className="py-3.5 px-4">Reason / Dispatch Reference</th>
                <th className="py-3.5 px-4">Authorized By</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-[#e84b2c] mx-auto mb-2" />
                    Loading movement logs...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No stock movements found matching your filters.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {m.movementType === 'IN' ? (
                          <div className="flex items-center gap-1 rounded-md bg-[#fff0ed] px-2 py-0.5 font-bold text-[#e84b2c] border border-[#e84b2c]/20">
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                            <span>STOCK IN</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 font-bold text-amber-400 border border-amber-500/30">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span>STOCK OUT</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{m.product?.name}</p>
                      <span className="font-mono text-[11px] text-gray-400">
                        SKU: {m.product?.sku}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black text-sm ${
                          m.movementType === 'IN' ? 'text-[#e84b2c]' : 'text-amber-400'
                        }`}
                      >
                        {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} Units
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-gray-800 text-xs truncate" title={m.reason}>
                        {m.reason}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <User className="h-3 w-3 text-gray-400" />
                        <span>{m.user?.name || 'System User'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right text-gray-400 font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
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
          onPageChange={(page) => fetchMovements(page)}
        />
      </div>

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manual Stock Adjustment (IN / OUT)"
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Select Product *
            </label>
            <select
              required
              value={formData.productId}
              onChange={(e) => handleProductSelectChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
            >
              {productsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku}) — Available Stock: {p.currentStock} Units
                </option>
              ))}
            </select>
          </div>

          {selectedProductDetails && (
            <div className="rounded-xl border border-gray-200 bg-white/60 p-3 text-xs flex items-center justify-between text-gray-600">
              <span>
                Current Available Stock: <strong className="text-[#e84b2c] font-bold">{selectedProductDetails.currentStock} Units</strong>
              </span>
              <span>
                Min Alert Threshold: <strong className="text-gray-800">{selectedProductDetails.minStockAlert} Units</strong>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Adjustment Type *
              </label>
              <select
                required
                value={formData.movementType}
                onChange={(e) => setFormData({ ...formData, movementType: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none font-bold"
              >
                <option value="IN">Inward (+IN Stock Received)</option>
                <option value="OUT">Outward (-OUT Stock Reduced)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Reason for Adjustment *
            </label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Supplier Inward Batch #109, Damaged Goods, Physical Audit..."
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
            />
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
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {formSubmitting ? 'Recording Adjustment...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
