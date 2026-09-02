import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, Package, AlertTriangle, Users, FileText,
  Boxes, ArrowUpRight, RefreshCw, Calendar, Clock, Zap,
} from 'lucide-react';
import { dashboardApi } from '../api/client';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';

export const Dashboard = () => {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await dashboardApi.getStats();
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw className="h-5 w-5 animate-spin text-[#e84b2c]" />
          <span className="text-sm font-semibold">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {};

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Real-time wholesale inventory, sales challans & CRM pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          {stats?._fromCache && (
            <span className="flex items-center gap-1.5 rounded-full border border-[#e84b2c]/20 bg-[#fff0ed] px-3 py-1 text-xs font-bold text-[#e84b2c]">
              <Zap className="h-3.5 w-3.5" /> Redis Cache
            </span>
          )}
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="btn-secondary text-xs px-3.5 py-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${Number(summary.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`${summary.totalDispatchedQuantity || 0} units shipped`}
          icon={DollarSign}
          color="orange"
        />
        <StatCard
          title="Confirmed Challans"
          value={summary.confirmedChallansCount || 0}
          subtitle={`${summary.draftChallansCount || 0} drafts pending`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Low Stock Alerts"
          value={summary.lowStockCount || 0}
          subtitle="Items below minimum"
          icon={AlertTriangle}
          color={summary.lowStockCount > 0 ? 'rose' : 'green'}
        />
        <StatCard
          title="Active Customers"
          value={summary.activeCustomers || 0}
          subtitle={`${summary.leadCustomers || 0} leads in pipeline`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Low Stock Table */}
          <div className="surface p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#e84b2c]" />
                <h3 className="text-sm font-bold text-gray-900">Critical Low Stock</h3>
              </div>
              <Link to="/products?lowStockOnly=true"
                className="flex items-center gap-1 text-xs font-semibold text-[#e84b2c] hover:text-[#cc3317]">
                View Catalog <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {stats?.lowStockItems?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400">
                      <th className="py-2.5 px-3 font-semibold">Product</th>
                      <th className="py-2.5 px-3 font-semibold">SKU</th>
                      <th className="py-2.5 px-3 font-semibold">Stock</th>
                      <th className="py-2.5 px-3 font-semibold">Min Alert</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockItems.map((p) => (
                      <tr key={p.id} className="table-row">
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{p.name}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-400">{p.sku}</td>
                        <td className="py-2.5 px-3">
                          <span className="badge bg-red-50 text-red-500 border-red-200">
                            {p.currentStock} units
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-400">{p.minStockAlert} units</td>
                        <td className="py-2.5 px-3 text-right">
                          <Link to="/inventory"
                            className="rounded-lg bg-[#fff0ed] border border-[#ffd0c4] px-2.5 py-1 text-xs font-bold text-[#e84b2c] hover:bg-[#ffd0c4]">
                            Restock →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">
                ✅ All products are above minimum inventory levels.
              </p>
            )}
          </div>

          {/* Recent Stock Movements */}
          <div className="surface p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Recent Stock Movements</h3>
              </div>
              <Link to="/inventory"
                className="flex items-center gap-1 text-xs font-semibold text-[#e84b2c] hover:text-[#cc3317]">
                Full Audit Trail <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {stats?.recentMovements?.map((m) => (
                <div key={m.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#faf9f7] p-3">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={m.movementType} />
                    <div>
                      <p className="text-xs font-bold text-gray-800">{m.product?.name}</p>
                      <p className="text-[11px] text-gray-400">{m.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${m.movementType === 'IN' ? 'text-green-600' : 'text-[#e84b2c]'}`}>
                      {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} units
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* CRM Follow-ups */}
          <div className="surface p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <h3 className="text-sm font-bold text-gray-900">CRM Follow-ups</h3>
              </div>
              <Link to="/customers"
                className="flex items-center gap-1 text-xs font-semibold text-[#e84b2c] hover:text-[#cc3317]">
                All CRM <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {stats?.upcomingFollowUps?.length > 0 ? (
              <div className="space-y-2">
                {stats.upcomingFollowUps.map((lead) => (
                  <Link key={lead.id} to={`/customers/${lead.id}`}
                    className="block rounded-xl border border-gray-100 bg-[#faf9f7] p-3 transition-all hover:border-[#e84b2c]/20 hover:bg-[#fff0ed]">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-800">{lead.businessName}</p>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-500">
                        <Clock className="h-3 w-3" />
                        {new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Contact: {lead.name} · {lead.mobile}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No pending follow-ups today.</p>
            )}
          </div>

          {/* Recent Challans */}
          <div className="surface p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#e84b2c]" />
                <h3 className="text-sm font-bold text-gray-900">Recent Challans</h3>
              </div>
              <Link to="/challans"
                className="flex items-center gap-1 text-xs font-semibold text-[#e84b2c] hover:text-[#cc3317]">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {stats?.recentChallans?.map((c) => (
                <Link key={c.id} to={`/challans/${c.id}`}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#faf9f7] p-3 transition-all hover:border-[#e84b2c]/20 hover:bg-[#fff0ed]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-800">{c.challanNumber}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{c.customer?.businessName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">₹{Number(c.totalAmount || 0).toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
