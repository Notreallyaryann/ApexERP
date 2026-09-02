import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/RoleGuard';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Challans } from './pages/Challans';
import { CreateChallan } from './pages/CreateChallan';
import { ChallanDetail } from './pages/ChallanDetail';
import { Invoices } from './pages/Invoices';
import { Unauthorized } from './pages/Unauthorized';

export const router = createBrowserRouter([
  // Public Route
  {
    path: '/login',
    element: <Login />,
  },

  // Protected App Routes with Layout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'customers/:id',
        element: <CustomerDetail />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'inventory',
        element: <Inventory />,
      },
      {
        path: 'challans',
        element: <Challans />,
      },
      {
        path: 'challans/new',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
            <CreateChallan />
          </ProtectedRoute>
        ),
      },
      {
        path: 'challans/:id',
        element: <ChallanDetail />,
      },
      {
        path: 'invoices',
        element: <Invoices />,
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />,
      },
    ],
  },

  // Catch-all route
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
