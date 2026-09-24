import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  User, 
  Store, 
  Scale, 
  IndianRupee, 
  Sparkles,
  ArrowRight,
  Package
} from 'lucide-react';

export default function FarmerQuotesPanel({ quotes = [], onDecision, t }) {
  const [actingId, setActingId] = useState(null);

  const handleAction = async (quoteId, decision) => {
    setActingId(quoteId);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit decision');

      if (onDecision) {
        onDecision(data.quote);
      }
    } catch (err) {
      alert(err.message || 'Error updating quote decision');
    } finally {
      setActingId(null);
    }
  };

  if (!quotes || quotes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">No Buyer Quotes Yet</h4>
        <p className="text-xs text-slate-400 mt-1">
          When buyers in the marketplace make an offer on your crops, their bids appear here for your immediate review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t.incomingQuotesTitle}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.incomingQuotesSub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotes.map((q) => {
          const isPending = q.status === 'PENDING';
          const isAccepted = q.status === 'ACCEPTED';
          const isWait = q.status === 'WAIT';
          const isRejected = q.status === 'REJECTED';
          const isBought = q.status === 'BOUGHT';

          return (
            <div
              key={q.id}
              className={`bg-white rounded-3xl p-5 border-2 transition-all shadow-sm flex flex-col justify-between ${
                isPending
                  ? 'border-emerald-300 ring-2 ring-emerald-200/50'
                  : isBought
                  ? 'border-emerald-500 bg-emerald-50/20'
                  : isAccepted
                  ? 'border-blue-300 bg-blue-50/20'
                  : isWait
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 opacity-70'
              }`}
            >
              <div>
                
                {/* Header: Buyer Info & Status Badge */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {q.buyerName ? q.buyerName[0].toUpperCase() : 'B'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {q.storeName || q.buyerName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Contact: {q.buyerName} ({q.buyerPhone})
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isPending
                      ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                      : isBought
                      ? 'bg-emerald-600 text-white'
                      : isAccepted
                      ? 'bg-blue-100 text-blue-800'
                      : isWait
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {q.status}
                  </span>
                </div>

                {/* Offer Details */}
                <div className="py-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Produce Target:</span>
                    <strong className="text-slate-900">{q.cropName}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        {t.requestedQty}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {q.requestedQty} {q.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        {t.offeredUnitRate}
                      </span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-sm font-black text-emerald-700">
                          ₹{q.offeredPrice}/{q.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{q.farmerExpectedPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <span className="text-slate-500">Total Offer Valuation:</span>
                    <span className="font-bold text-slate-900">
                      ₹{q.totalQuoteValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons: Sell (Accept), Reject, Keep on Wait */}
              <div className="pt-3 border-t border-slate-100">
                {isBought ? (
                  <div className="p-2.5 rounded-xl bg-emerald-100/70 text-emerald-900 text-xs font-bold flex items-center space-x-2">
                    <Package className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>Crop Bought! Go to 'Sold Out Crops' to track packaging & transport.</span>
                  </div>
                ) : isPending || isWait ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAction(q.id, 'ACCEPTED')}
                      disabled={actingId === q.id}
                      className="py-2 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.actionSell}</span>
                    </button>

                    <button
                      onClick={() => handleAction(q.id, 'WAIT')}
                      disabled={actingId === q.id}
                      className="py-2 px-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.actionWait}</span>
                    </button>

                    <button
                      onClick={() => handleAction(q.id, 'REJECTED')}
                      disabled={actingId === q.id}
                      className="py-2 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 border border-rose-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.actionReject}</span>
                    </button>
                  </div>
                ) : isAccepted ? (
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium flex items-center justify-between">
                    <span>{t.statusAccepted}</span>
                    <button
                      onClick={() => handleAction(q.id, 'REJECTED')}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Cancel / Reject
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-500 text-xs text-center font-medium">
                    {t.statusRejected}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
