import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Download,
  ArrowLeft,
  RefreshCw,
  Printer,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';
import { challanApi, invoiceApi } from '../api/client';
import { StatusBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const ChallanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSalesOrAdmin = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchChallan = async () => {
    setLoading(true);
    try {
      const res = await challanApi.getById(id);
      if (res.data?.success) {
        setChallan(res.data.data);
      }
    } catch (err) {
      console.error('Error loading challan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (!window.confirm('Confirm this sales challan? Inventory stock will be atomically reduced.')) {
      return;
    }

    setActionLoading(true);
    setErrorMessage('');
    try {
      await challanApi.confirm(id);
      fetchChallan();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to confirm challan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Please enter cancellation reason:');
    if (reason === null) return;

    setActionLoading(true);
    setErrorMessage('');
    try {
      await challanApi.cancel(id, reason || 'Cancelled by user');
      fetchChallan();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to cancel challan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadChallanPDF = async () => {
    try {
      const res = await invoiceApi.getChallanPdfBlob(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Delivery-Challan-${challan.challanNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Delivery Challan PDF.');
    }
  };

  const handleDownloadInvoicePDF = async () => {
    try {
      const res = await invoiceApi.getInvoicePdfBlob(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tax-Invoice-${challan.challanNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download Tax Invoice PDF.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">
        <RefreshCw className="h-6 w-6 animate-spin text-[#e84b2c]" />
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="surface p-8 text-center text-gray-600">
        <p className="text-sm font-semibold">Sales Challan not found.</p>
        <Link to="/challans" className="mt-4 inline-block text-xs font-bold text-[#e84b2c]">
          ← Back to Challans
        </Link>
      </div>
    );
  }

  const subtotal = Number(challan.totalAmount || 0);
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/challans"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#e84b2c] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sales Challans
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {challan.status === 'DRAFT' && isSalesOrAdmin && (
            <>
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r bg-[#e84b2c] px-3.5 py-2 text-xs font-bold text-white shadow-md  hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Challan & Deduct Stock
              </button>

              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel Challan
              </button>
            </>
          )}

          {challan.status === 'CONFIRMED' && (
            <>
              <button
                onClick={handleDownloadChallanPDF}
                className="flex items-center gap-1.5 rounded-xl border border-[#e84b2c]/20 bg-[#fff0ed] px-3.5 py-2 text-xs font-bold text-[#e84b2c] hover:bg-emerald-500/25"
              >
                <Download className="h-4 w-4" />
                Download Delivery Challan PDF
              </button>

              <button
                onClick={handleDownloadInvoicePDF}
                className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/15 px-3.5 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/25"
              >
                <Printer className="h-4 w-4" />
                Download Tax Invoice PDF
              </button>

              {isSalesOrAdmin && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel & Restore Stock
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Challan Banner */}
      <div className="surface p-6 ">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-black text-[#e84b2c]">
                {challan.challanNumber}
              </span>
              <StatusBadge status={challan.status} />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Created on {new Date(challan.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} by{' '}
              <strong className="text-gray-800">{challan.user?.name || 'System'}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400">Total Invoice Value (w/ 18% GST)</span>
            <p className="text-2xl font-black text-gray-900">₹{grandTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Customer & Document Information */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 text-xs text-gray-600">
          {/* Customer Box */}
          <div className="rounded-xl border border-gray-200 bg-white/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#e84b2c] font-bold mb-1">
              <Building2 className="h-4 w-4" />
              <span>Consignee / Customer Details</span>
            </div>
            <p className="font-bold text-gray-900 text-sm">{challan.customer?.businessName}</p>
            <p className="text-gray-400">Contact: {challan.customer?.name} ({challan.customer?.mobile})</p>
            <p className="text-gray-400 font-mono">GSTIN: {challan.customer?.gstNumber || 'Unregistered'}</p>
            <p className="text-gray-400">Address: {challan.customer?.address}</p>
          </div>

          {/* Dispatch / Notes Box */}
          <div className="rounded-xl border border-gray-200 bg-white/60 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-gray-600 font-bold mb-1">
              <PackageCheck className="h-4 w-4 text-[#e84b2c]" />
              <span>Dispatch & Transport Notes</span>
            </div>
            <p className="text-gray-600">{challan.notes || 'Standard Logistics Delivery'}</p>
            <div className="pt-2 text-[11px] text-gray-400">
              Total Quantity: <strong className="text-gray-800">{challan.totalQuantity} Units</strong> across{' '}
              <strong className="text-gray-800">{challan.items?.length || 0} Line Items</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Line Items Table */}
      <div className="surface p-6 ">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Challan Product Line Items Snapshot
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">SKU Code</th>
                <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {challan.items?.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-100/20">
                  <td className="py-3 px-3 text-gray-400 font-bold">{index + 1}</td>
                  <td className="py-3 px-3 font-bold text-gray-900">{item.productName}</td>
                  <td className="py-3 px-3 font-mono text-gray-400">{item.productSku}</td>
                  <td className="py-3 px-3 text-right font-medium">
                    ₹{Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#e84b2c]">
                    {item.quantity} Units
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                    ₹{Number(item.totalPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="mt-6 flex flex-col items-end border-t border-gray-200 pt-4 space-y-1.5 text-xs">
          <div className="flex w-64 justify-between text-gray-400">
            <span>Subtotal:</span>
            <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex w-64 justify-between text-gray-400">
            <span>GST (18% Integrated):</span>
            <span className="font-semibold text-gray-800">₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex w-64 justify-between border-t border-gray-200 pt-2 text-sm font-bold text-gray-900">
            <span>Grand Total:</span>
            <span className="text-[#e84b2c] font-black">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
