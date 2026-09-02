import React from 'react';
import { Menu, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';

export const Navbar = ({ setIsMobileOpen }) => {
  const { user, quickDemoLogin, loading } = useAuth();

  const handleRoleChange = async (e) => {
    const roleEmail = e.target.value;
    if (roleEmail && roleEmail !== user?.email) {
      await quickDemoLogin(roleEmail);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400">
          <span className="flex h-2 w-2 rounded-full bg-[#e84b2c] animate-pulse" />
          <span className="text-gray-500">System Online</span>
          <span className="text-gray-200">|</span>
          <span className="flex items-center gap-1 text-[#e84b2c]">
            <Zap className="h-3.5 w-3.5" /> Fastify + Redis Cache
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Role Switcher */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-[#e84b2c]" />
          <span className="hidden sm:inline text-xs font-medium text-gray-400">Switch Role:</span>
          <select
            value={user?.email || 'admin@erp.com'}
            onChange={handleRoleChange}
            disabled={loading}
            className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="admin@erp.com">Admin (Full Access)</option>
            <option value="sales@erp.com">Sales (CRM & Challans)</option>
            <option value="warehouse@erp.com">Warehouse (Stock & IN/OUT)</option>
            <option value="accounts@erp.com">Accounts (Invoices & Billing)</option>
          </select>
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-gray-800">{user.name}</p>
              <p className="text-[10px] text-gray-400">{user.email}</p>
            </div>
            <RoleBadge role={user.role} />
          </div>
        )}
      </div>
    </header>
  );
};
