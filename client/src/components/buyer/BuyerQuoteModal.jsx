import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Scale, 
  IndianRupee, 
  CheckCircle2, 
  Award, 
  ShieldCheck,
  Send
} from 'lucide-react';

export default function BuyerQuoteModal({ isOpen, onClose, crop, buyer, onQuoteSubmitted, t }) {
  if (!isOpen || !crop) return null;

  const [requestedQty, setRequestedQty] = useState(Math.min(100, crop.quantity));
  const [offeredPrice, setOfferedPrice] = useState(crop.expectedPrice);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalValue = Number(requestedQty) * Number(offeredPrice);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedQty || Number(requestedQty) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    if (Number(requestedQty) > crop.quantity) {
      setError(`Requested quantity cannot exceed available stock of ${crop.quantity} ${crop.unit}`);
      return;
    }
    if (!offeredPrice || Number(offeredPrice) <= 0) {
      setError('Please enter a valid offer price');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropId: crop.id,
          buyerPhone: buyer.phone,
          buyerName: buyer.name,
          storeName: buyer.storeName || `${buyer.name}'s Wholesale Mart`,
          requestedQty: Number(requestedQty),
          offeredPrice: Number(offeredPrice),
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit quote');

      onQuoteSubmitted(data.quote);
      onClose();
    } catch (err) {
      setError(err.message || 'Error submitting quote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
              💼
            </span>
            <h3 className="text-base font-bold text-slate-900">{t.quoteModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Crop Summary Card */}
        <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
          <img
            src={crop.imageUrl}
            alt={crop.name}
            className="w-20 h-20 rounded-xl object-cover shadow-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 truncate">{crop.name}</h4>
              {crop.aiAnalysis?.grade && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                  {crop.aiAnalysis.grade}
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 mt-0.5">
              Farmer: <strong className="text-slate-800">{crop.farmerName}</strong> • {crop.location}
            </p>
            
            <div className="flex items-center space-x-4 mt-2 text-xs">
              <span className="text-slate-600">
                Stock: <strong className="text-slate-900">{crop.quantity} {crop.unit}</strong>
              </span>
              <span className="text-emerald-700 font-bold">
                Farmer Rate: ₹{crop.expectedPrice}/{crop.unit}
              </span>
            </div>
          </div>
        </div>

        {/* AI Quality Certified Badge */}
        {crop.aiAnalysis && (
          <div className="mb-5 p-3.5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-emerald-400 block">AI Verified Freshness: {crop.aiAnalysis.freshness}%</span>
                <span className="text-[11px] text-slate-300">Defect Rate: {crop.aiAnalysis.blemishRate}% • Fair Mandi Price: {crop.aiAnalysis.fairMarketPriceRange}</span>
              </div>
            </div>
            <Award className="w-6 h-6 text-amber-400 flex-shrink-0" />
          </div>
        )}

        {/* Form Inputs: Quote Quantity and Offer Price */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.yourNeededQty} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={crop.quantity}
                required
                value={requestedQty}
                onChange={(e) => setRequestedQty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Max available: {crop.quantity} {crop.unit}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.yourOfferPrice} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  ₹
                </div>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Farmer asked ₹{crop.expectedPrice}/{crop.unit}</span>
            </div>
          </div>

          {/* Computed Value Box */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-900">{t.totalOfferValue}:</span>
            <span className="font-black text-base text-blue-800">
              ₹{totalValue ? totalValue.toLocaleString('en-IN') : 0}
            </span>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Note to Farmer (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Can pick up within 24 hours, immediate UPI settlement"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : t.submitQuote}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
