import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { challanApi } from '../api/client';
import { StatusBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';
import { useAuth } from '../context/AuthContext';

export const Challans = () => {
  const { user } = useAuth();
  const isSalesOrAdmin = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchChallans = async (page = 1) => {
    setLoading(true);
    try {
      const res = await challanApi.list({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      if (res.data?.success) {
        setChallans(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChallans(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleConfirm = async (id, challanNumber) => {
    if (!window.confirm(`Confirm Challan ${challanNumber}? This will deduct inventory stock.`)) {
      return;
    }

    try {
      await challanApi.confirm(id);
      fetchChallans(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm challan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Sales Challans</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Create multi-product dispatch challans, manage draft/confirmed states & track inventory deductions
          </p>
        </div>

        {isSalesOrAdmin && (
          <Link
            to="/challans/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r bg-[#e84b2c] px-4 py-2.5 text-xs font-bold text-white shadow-lg  transition-all hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Create Sales Challan
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 surface p-4  sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by challan #, customer, notes..."
          className="flex-1 max-w-md"
        />

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-[#e84b2c] focus:outline-none"
          >
            <option value="">All Statuses (Draft, Confirmed, Cancelled)</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Challans Table */}
      <div className="overflow-hidden surface shadow-xl ">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="border-b border-gray-200 bg-white/60 text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Challan #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total Qty / Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-[#e84b2c] mx-auto mb-2" />
                    Loading sales challans...
                  </td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No sales challans found.
                  </td>
                </tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/challans/${ch.id}`}
                        className="font-mono font-bold text-[#e84b2c] hover:text-[#cc3317] flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {ch.challanNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{ch.customer?.businessName}</p>
                      <p className="text-[11px] text-gray-400">{ch.customer?.name}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800">{ch.totalQuantity} Units</span>
                      <p className="text-[10px] text-gray-400">
                        {ch.items?.length || 0} Line item(s)
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      ₹{Number(ch.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={ch.status} />
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {new Date(ch.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ch.status === 'DRAFT' && isSalesOrAdmin && (
                          <button
                            onClick={() => handleConfirm(ch.id, ch.challanNumber)}
                            title="Confirm Challan (Deduct Stock)"
                            className="flex items-center gap-1 rounded-lg bg-[#fff0ed] border border-[#e84b2c]/20 px-2.5 py-1 text-[11px] font-bold text-[#e84b2c] hover:bg-emerald-500/25"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Confirm
                          </button>
                        )}

                        <Link
                          to={`/challans/${ch.id}`}
                          title="View Details & Export PDF"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#e84b2c] transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
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
          onPageChange={(page) => fetchChallans(page)}
        />
      </div>
    </div>
  );
};
