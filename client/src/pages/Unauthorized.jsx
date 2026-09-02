import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-[#e84b2c] mb-4 shadow-sm">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Access Restricted</h2>
      <p className="mt-2 text-sm text-gray-400 max-w-md">
        Your current role (<strong className="text-purple-600 font-bold">{user?.role}</strong>) does not have sufficient permissions to access this action or page.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          to="/dashboard"
          className="btn-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};
