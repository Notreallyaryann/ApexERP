import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  Receipt,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard',         path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customer CRM',      path: '/customers',  icon: Users },
    { name: 'Product Catalog',   path: '/products',   icon: Package },
    { name: 'Inventory & Stock', path: '/inventory',  icon: Boxes },
    { name: 'Sales Challans',    path: '/challans',   icon: FileText },
    { name: 'Invoices & Billing',path: '/invoices',   icon: Receipt },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e84b2c] shadow-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-gray-900">
              Apex<span className="text-[#e84b2c]">ERP</span>
            </h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Wholesale Portal
            </p>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mx-4 my-4 rounded-xl border border-gray-100 bg-[#faf9f7] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 truncate max-w-[120px]">
                {user.name}
              </span>
              <RoleBadge role={user.role} />
            </div>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#fff0ed] text-[#e84b2c] border-l-[3px] border-[#e84b2c] pl-[9px]'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-[3px] border-transparent pl-[9px]'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-red-50 hover:text-[#e84b2c]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
