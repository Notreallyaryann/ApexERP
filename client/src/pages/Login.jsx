import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login, quickDemoLogin, loading } = useAuth();

  const [email, setEmail]       = useState('admin@erp.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickLogin = async (roleEmail) => {
    setError('');
    setEmail(roleEmail);
    const res = await quickDemoLogin(roleEmail);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Quick login failed');
    }
  };

  const demoRoles = [
    { email: 'admin@erp.com',     label: 'Admin',     desc: 'Full System Access',    color: '#7c3aed' },
    { email: 'sales@erp.com',     label: 'Sales',     desc: 'CRM & Challans',        color: '#e84b2c' },
    { email: 'warehouse@erp.com', label: 'Warehouse', desc: 'Stock & IN/OUT',        color: '#d97706' },
    { email: 'accounts@erp.com',  label: 'Accounts',  desc: 'Invoices & Billing',    color: '#0284c7' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f6f6f4]">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between bg-white border-r border-gray-100 p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e84b2c]">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            Apex<span className="text-[#e84b2c]">ERP</span>
          </span>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff0ed] px-4 py-1.5 text-xs font-bold text-[#e84b2c] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Wholesale Operations Portal
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            Run your business<br />
            <span className="text-[#e84b2c]">smarter.</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            A full-stack ERP + CRM for wholesale & distribution. Inventory, challans, invoices & customer management in one place.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: 'Atomic Stock Control',   desc: 'ACID transactions' },
              { label: 'PDF Invoice Engine',      desc: 'GST-ready documents' },
              { label: 'Redis KPI Caching',       desc: 'Real-time dashboards' },
              { label: 'Role-Based Access',       desc: '4 operational roles' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-gray-100 bg-[#faf9f7] p-3">
                <p className="text-xs font-bold text-gray-800">{f.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-300">© 2026 ApexERP — Built with Fastify + React</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e84b2c]">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900">
              Apex<span className="text-[#e84b2c]">ERP</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-400 mt-1">Access the operations portal</p>
          </div>

          {/* Quick Role Buttons */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#e84b2c]">
              <ShieldCheck className="h-4 w-4" />
              <span>One-Click Role Login (Demo Review)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoRoles.map((r) => (
                <button
                  key={r.email}
                  type="button"
                  onClick={() => handleQuickLogin(r.email)}
                  disabled={loading}
                  className="flex flex-col items-start rounded-xl border border-gray-100 bg-[#faf9f7] p-3 text-left transition-all hover:border-gray-200 hover:bg-gray-100 disabled:opacity-50"
                >
                  <span className="text-xs font-bold text-gray-800" style={{ color: r.color }}>{r.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or sign in manually</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="input-base !pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-base !pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-brand w-full py-3 text-sm rounded-xl"
              >
                {loading ? 'Signing in...' : 'Sign In to Portal'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
