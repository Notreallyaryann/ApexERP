import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Save,
  Package,
} from 'lucide-react';
import { challanApi, customerApi, productApi } from '../api/client';

export const CreateChallan = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', productName: '', sku: '', unitPrice: 0, currentStock: 0, quantity: 1, totalPrice: 0 },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Customers & Products
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          customerApi.list({ limit: 100 }),
          productApi.list({ limit: 100 }),
        ]);

        if (custRes.data?.success) {
          setCustomers(custRes.data.data);
          if (custRes.data.data.length > 0) {
            setSelectedCustomerId(custRes.data.data[0].id);
            setSelectedCustomer(custRes.data.data[0]);
          }
        }

        if (prodRes.data?.success) {
          const prods = prodRes.data.data;
          setProducts(prods);
          if (prods.length > 0) {
            setItems([
              {
                productId: prods[0].id,
                productName: prods[0].name,
                sku: prods[0].sku,
                unitPrice: Number(prods[0].unitPrice),
                currentStock: prods[0].currentStock,
                quantity: 1,
                totalPrice: Number(prods[0].unitPrice),
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load customers or products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleCustomerChange = (customerId) => {
    setSelectedCustomerId(customerId);
    const cust = customers.find((c) => c.id === customerId);
    setSelectedCustomer(cust || null);
  };

  const handleProductChange = (index, productId) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const price = Number(prod.unitPrice);

    newItems[index] = {
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      unitPrice: price,
      currentStock: prod.currentStock,
      quantity: qty,
      totalPrice: price * qty,
    };

    setItems(newItems);
  };

  const handleQuantityChange = (index, qtyVal) => {
    const qty = parseInt(qtyVal, 10) || 0;
    const newItems = [...items];
    const currentItem = newItems[index];

    newItems[index] = {
      ...currentItem,
      quantity: qty,
      totalPrice: currentItem.unitPrice * qty,
    };

    setItems(newItems);
  };

  const handlePriceChange = (index, priceVal) => {
    const price = parseFloat(priceVal) || 0;
    const newItems = [...items];
    const currentItem = newItems[index];

    newItems[index] = {
      ...currentItem,
      unitPrice: price,
      totalPrice: price * currentItem.quantity,
    };

    setItems(newItems);
  };

  const handleAddItem = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;

    setItems([
      ...items,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        sku: defaultProd.sku,
        unitPrice: Number(defaultProd.unitPrice),
        currentStock: defaultProd.currentStock,
        quantity: 1,
        totalPrice: Number(defaultProd.unitPrice),
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      alert('A challan must have at least one product line item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const gstAmount = totalAmount * 0.18;
  const grandTotal = totalAmount + gstAmount;

  const handleSubmitChallan = async (statusToSet) => {
    setErrorMessage('');
    if (!selectedCustomerId) {
      setErrorMessage('Please select a customer.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Please add at least one line item.');
      return;
    }

    // Validate stock for confirmed status
    if (statusToSet === 'CONFIRMED') {
      for (const item of items) {
        if (item.quantity > item.currentStock) {
          setErrorMessage(
            `Insufficient stock for '${item.productName}'. Requested: ${item.quantity}, Available: ${item.currentStock}`
          );
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        status: statusToSet,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      };

      const res = await challanApi.create(payload);
      if (res.data?.success) {
        navigate(`/challans/${res.data.data.id}`);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to create challan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">
        Loading customers and products catalog...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/challans"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#e84b2c] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sales Challans
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Sales Challan</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Auto-generate sequential challan number, snapshot item rates & validate stock availability
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Customer Selection Card */}
      <div className="surface p-6 ">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#e84b2c]" />
          Customer Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Select Customer / Consignee *
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.name}) — {c.customerType}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="rounded-xl border border-gray-200 bg-white/60 p-3 text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">{selectedCustomer.businessName}</span>
                <span className="text-[11px] text-[#e84b2c] font-mono">
                  GST: {selectedCustomer.gstNumber || 'Unregistered'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Phone: {selectedCustomer.mobile}</p>
              <p className="text-[11px] text-gray-400 truncate">
                Address: {selectedCustomer.address}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Builder Card */}
      <div className="surface p-6 ">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-[#e84b2c]" />
            Product Line Items ({items.length})
          </h3>

          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 rounded-xl border border-[#e84b2c]/20 bg-[#fff0ed] px-3 py-1.5 text-xs font-bold text-[#e84b2c] hover:bg-emerald-500/25"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Another Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 w-6/12">Product Selection</th>
                <th className="py-2.5 px-3 w-2/12">Rate (₹)</th>
                <th className="py-2.5 px-3 w-2/12">Quantity</th>
                <th className="py-2.5 px-3 w-2/12">Total (₹)</th>
                <th className="py-2.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-100/20">
                  <td className="py-3 px-3">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku}) — Available: {p.currentStock} Units
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className="text-gray-400 font-mono">SKU: {item.sku}</span>
                      <span
                        className={`font-semibold ${
                          item.quantity > item.currentStock ? 'text-rose-400' : 'text-[#e84b2c]'
                        }`}
                      >
                        Available Stock: {item.currentStock} Units
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handlePriceChange(idx, e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs text-gray-900 focus:border-[#e84b2c] focus:outline-none font-bold"
                    />
                  </td>

                  <td className="py-3 px-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none ${
                        item.quantity > item.currentStock
                          ? 'border-rose-500 bg-rose-500/10'
                          : 'border-gray-200 bg-white/80 focus:border-[#e84b2c]'
                      }`}
                    />
                    {item.quantity > item.currentStock && (
                      <p className="text-[10px] text-rose-400 font-semibold mt-0.5">
                        Exceeds stock!
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-3 font-bold text-gray-900">
                    ₹{Number(item.totalPrice).toFixed(2)}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary & Submission */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dispatch Notes */}
        <div className="surface p-5 ">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Transport & Dispatch Notes (LR Number, Vehicle #, Instructions)
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Dispatched via Express Logistics, Truck #MH-04-AB-1234, Delivery contact..."
            className="w-full rounded-xl border border-gray-200 bg-white/80 p-3 text-xs text-gray-900 placeholder-gray-400 focus:border-[#e84b2c] focus:outline-none"
          />
        </div>

        {/* Pricing Summary */}
        <div className="surface p-5  space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Total Dispatch Quantity:</span>
            <span className="font-bold text-gray-900 text-sm">{totalQuantity} Units</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Subtotal Amount:</span>
            <span className="font-bold text-gray-900 text-sm">₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Estimated GST (18%):</span>
            <span className="font-semibold text-gray-600">₹{gstAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm font-bold text-gray-900">
            <span>Grand Total (with GST):</span>
            <span className="text-[#e84b2c] text-base font-black">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitChallan('DRAFT')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 py-2.5 text-xs font-bold text-gray-800 hover:bg-slate-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitChallan('CONFIRMED')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r bg-[#e84b2c] py-2.5 text-xs font-bold text-white shadow-lg  hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm & Deduct Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
