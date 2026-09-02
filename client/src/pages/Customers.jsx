import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Building,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { customerApi } from '../api/client';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { useAuth } from '../context/AuthContext';

export const Customers = () => {
  const { user } = useAuth();
  const isSalesOrAdmin = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    mobile: '',
    email: '',
    gstNumber: '',
    customerType: 'WHOLESALE',
    status: 'LEAD',
    address: '',
    followUpDate: '',
    notes: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await customerApi.list({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        customerType: typeFilter || undefined,
      });
      if (res.data?.success) {
        setCustomers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      businessName: '',
      mobile: '',
      email: '',
      gstNumber: '',
      customerType: 'WHOLESALE',
      status: 'LEAD',
      address: '',
      followUpDate: '',
      notes: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      businessName: customer.businessName || '',
      mobile: customer.mobile || '',
      email: customer.email || '',
      gstNumber: customer.gstNumber || '',
      customerType: customer.customerType || 'WHOLESALE',
      status: customer.status || 'LEAD',
      address: customer.address || '',
      followUpDate: customer.followUpDate ? customer.followUpDate.split('T')[0] : '',
      notes: customer.notes || '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, formData);
      } else {
        await customerApi.create(formData);
      }
      setIsAddModalOpen(false);
      fetchCustomers(pagination.page);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save customer.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer '${name}'?`)) return;
    try {
      await customerApi.delete(id);
      fetchCustomers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Customer CRM</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage wholesale clients, leads, contact profiles & follow-up pipelines
          </p>
        </div>

        {isSalesOrAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r bg-[#e84b2c] px-4 py-2.5 text-xs font-bold text-white shadow-lg  transition-all hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Add New Customer
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 surface p-4  sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, company, mobile, GST..."
          className="flex-1 max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-[#e84b2c] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-[#e84b2c] focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="RETAIL">Retail</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden surface shadow-xl ">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="border-b border-gray-200 bg-white/60 text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Business / Customer</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">GST / Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Next Follow-Up</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-[#e84b2c] mx-auto mb-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{c.businessName}</p>
                      <p className="text-[11px] text-gray-400">{c.name}</p>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{c.mobile}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                        {c.customerType}
                      </span>
                      {c.gstNumber && (
                        <p className="font-mono text-[10px] text-gray-400">{c.gstNumber}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-4">
                      {c.followUpDate ? (
                        <span className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          {new Date(c.followUpDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/customers/${c.id}`}
                          title="View Details & Notes Timeline"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#e84b2c] transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {isSalesOrAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(c)}
                              title="Edit Customer"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-400 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(c.id, c.businessName)}
                              title="Delete Customer"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
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
          onPageChange={(page) => fetchCustomers(page)}
        />
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
      >
        {formError && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Business / Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Apex Industrial Supplies"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Primary Contact Person *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vikram Mehta"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98200 12345"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@company.com"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                GST Number (Optional)
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="27AABCM1234F1Z8"
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Customer Type
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
              >
                <option value="DISTRIBUTOR">Distributor</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="RETAIL">Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                CRM Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Billing & Shipping Address *
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full warehouse or office address..."
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Initial Notes / Preferences
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Commercial terms, special requirements..."
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="rounded-xl bg-gradient-to-r bg-[#e84b2c] px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
