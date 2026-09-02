import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Download,
  Search,
  Eye,
  Building2,
  Calendar,
  DollarSign,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { invoiceApi } from '../api/client';
import { Pagination } from '../components/common/Pagination';
import { SearchInput } from '../components/common/SearchInput';

export const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const res = await invoiceApi.list({
        page,
        limit: 10,
        search: search || undefined,
      });
      if (res.data?.success) {
        setInvoices(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDownloadInvoicePDF = async (id, challanNumber) => {
    try {
      const res = await invoiceApi.getInvoicePdfBlob(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tax-Invoice-${challanNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download invoice PDF.');
    }
  };

  const handleDownloadChallanPDF = async (id, challanNumber) => {
    try {
      const res = await invoiceApi.getChallanPdfBlob(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Delivery-Challan-${challanNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download delivery challan PDF.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Invoices & Accounts Billing
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Confirmed dispatch challans ready for accounting, GST tax invoices & PDF exports
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 surface p-4  sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by invoice/challan #, customer business name..."
          className="flex-1 max-w-md"
        />
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden surface shadow-xl ">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="border-b border-gray-200 bg-white/60 text-gray-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice / Challan #</th>
                <th className="py-3.5 px-4">Billed Customer</th>
                <th className="py-3.5 px-4">Subtotal</th>
                <th className="py-3.5 px-4">GST (18%)</th>
                <th className="py-3.5 px-4">Grand Total</th>
                <th className="py-3.5 px-4">Billing Date</th>
                <th className="py-3.5 px-4 text-right">PDF Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-[#e84b2c] mx-auto mb-2" />
                    Loading billing invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No confirmed invoices ready for billing. Confirm a sales challan to see it here.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const subtotal = Number(inv.totalAmount || 0);
                  const gst = subtotal * 0.18;
                  const grandTotal = subtotal + gst;

                  return (
                    <tr key={inv.id} className="hover:bg-gray-100/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/challans/${inv.id}`}
                          className="font-mono font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          {inv.challanNumber}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{inv.customer?.businessName}</p>
                        <p className="text-[10px] font-mono text-gray-400">
                          GST: {inv.customer?.gstNumber || 'Unregistered'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-gray-400">
                        ₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 font-black text-[#e84b2c]">
                        ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadInvoicePDF(inv.id, inv.challanNumber)}
                            title="Download Tax Invoice PDF"
                            className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/15 px-2.5 py-1 text-[11px] font-bold text-sky-400 hover:bg-sky-500/25"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Tax Invoice
                          </button>

                          <button
                            onClick={() => handleDownloadChallanPDF(inv.id, inv.challanNumber)}
                            title="Download Delivery Challan PDF"
                            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:bg-slate-700"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Challan
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          limit={pagination.limit}
          onPageChange={(page) => fetchInvoices(page)}
        />
      </div>
    </div>
  );
};
