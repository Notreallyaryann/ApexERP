import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  PlusCircle,
  FileText,
  ArrowLeft,
  RefreshCw,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { customerApi } from '../api/client';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

export const CustomerDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isSalesOrAdmin = user?.role === 'ADMIN' || user?.role === 'SALES';

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getById(id);
      if (res.data?.success) {
        setCustomer(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      await customerApi.addNote(id, {
        note: noteContent,
        followUpDate: nextFollowUpDate || undefined,
        updateCustomerStatus: updateStatus || undefined,
      });

      setIsNoteModalOpen(false);
      setNoteContent('');
      setNextFollowUpDate('');
      setUpdateStatus('');
      fetchCustomer();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add follow-up note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#e84b2c]" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="surface p-8 text-center text-gray-600">
        <p className="text-sm font-semibold">Customer not found.</p>
        <Link to="/customers" className="mt-4 inline-block text-xs font-bold text-[#e84b2c]">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/customers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#e84b2c] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers List
      </Link>

      {/* Profile Header */}
      <div className="surface p-6 ">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {customer.businessName}
              </h1>
              <StatusBadge status={customer.status} />
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                {customer.customerType}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              Primary Contact: <span className="text-gray-900 font-semibold">{customer.name}</span>
            </p>
          </div>

          {isSalesOrAdmin && (
            <button
              onClick={() => {
                setUpdateStatus(customer.status);
                setIsNoteModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r bg-[#e84b2c] px-4 py-2 text-xs font-bold text-white shadow-md  transition-all hover:opacity-90"
            >
              <PlusCircle className="h-4 w-4" />
              Add Follow-up Note
            </button>
          )}
        </div>

        {/* Contact Details Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-400 text-[11px]">Mobile Phone</p>
              <p className="font-semibold text-gray-900">{customer.mobile}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-400 text-[11px]">Email Address</p>
              <p className="font-semibold text-gray-900">{customer.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-400 text-[11px]">GSTIN</p>
              <p className="font-mono font-semibold text-gray-900">
                {customer.gstNumber || 'Not Registered'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-400 text-[11px]">Next Follow-Up</p>
              <p className="font-semibold text-purple-400">
                {customer.followUpDate
                  ? new Date(customer.followUpDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'None scheduled'}
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/40 p-3 text-xs text-gray-400">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-gray-800">Address: </strong>
            {customer.address}
          </p>
        </div>
      </div>

      {/* Main Grid: Notes Timeline + Recent Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Follow-up Notes Timeline (2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#e84b2c]" />
              Follow-Up Activity Timeline ({customer.followUpNotes?.length || 0})
            </h3>
          </div>

          <div className="surface p-5 ">
            {customer.followUpNotes?.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {customer.followUpNotes.map((n) => (
                  <div key={n.id} className="relative">
                    {/* Bullet */}
                    <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />

                    <div className="rounded-xl border border-gray-100 bg-white/60 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">
                          {n.user?.name || 'Sales Representative'}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(n.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">{n.note}</p>

                      {n.followUpDate && (
                        <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-medium pt-1 border-t border-gray-100">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Next follow-up set for:{' '}
                            {new Date(n.followUpDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">
                No follow-up notes recorded yet. Click "Add Follow-up Note" to record customer interaction.
              </p>
            )}
          </div>
        </div>

        {/* Challans / Orders for this Customer */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#e84b2c]" />
            Order / Challan History
          </h3>

          <div className="surface p-4  space-y-3">
            {customer.challans?.length > 0 ? (
              customer.challans.map((ch) => (
                <Link
                  key={ch.id}
                  to={`/challans/${ch.id}`}
                  className="block rounded-xl border border-gray-100 bg-white/40 p-3 transition-colors hover:border-gray-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-800">
                      {ch.challanNumber}
                    </span>
                    <StatusBadge status={ch.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{ch.totalQuantity} Units</span>
                    <span className="font-bold text-gray-800">
                      ₹{Number(ch.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">
                No sales challans recorded for this customer yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Add Follow-Up Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Add Follow-Up Note & Update Pipeline"
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Discussion Notes / Feedback *
            </label>
            <textarea
              required
              rows={3}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="e.g. Spoke with client regarding next shipment, price quotes, feedback..."
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Update Customer Status
              </label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
              >
                <option value="">Keep current status ({customer.status})</option>
                <option value="LEAD">LEAD</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingNote}
              className="rounded-xl bg-gradient-to-r bg-[#e84b2c] px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {submittingNote ? 'Saving Note...' : 'Save Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
