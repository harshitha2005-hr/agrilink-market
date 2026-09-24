import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Hourglass, 
  ShoppingBag, 
  ArrowRight, 
  IndianRupee, 
  Scale, 
  Store,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BuyerQuotesView({ quotes = [], onBuySuccess, buyer, t }) {
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState('');

  const handleBuy = async (quote) => {
    setBuyingId(quote.id);
    setError('');

    try {
      const res = await fetch(`/api/quotes/${quote.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerPhone: buyer.phone,
          paymentMethod: 'UPI / Direct Mandi Settlement'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete purchase');

      // Celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      if (onBuySuccess) {
        onBuySuccess(data.order);
      }
    } catch (err) {
      setError(err.message || 'Error processing purchase');
    } finally {
      setBuyingId(null);
    }
  };

  if (!quotes || quotes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">No Active Quotes Yet</h3>
        <p className="text-xs text-slate-500">
          Browse the 'Buy Crops' marketplace and submit price bids to farmers to initiate negotiations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t.myQuotesTitle}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.myQuotesSub}</p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

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
              className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-sm flex flex-col justify-between ${
                isAccepted
                  ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-300'
                  : isBought
                  ? 'border-slate-200 bg-slate-50/50'
                  : isWait
                  ? 'border-amber-300 bg-amber-50/20'
                  : isRejected
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Farmer:</span>
                    <strong className="text-xs font-bold text-slate-900">{q.farmerName}</strong>
                  </div>

                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 ${
                    isAccepted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isBought
                      ? 'bg-slate-700 text-white'
                      : isWait
                      ? 'bg-amber-100 text-amber-900'
                      : isRejected
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isAccepted && <CheckCircle2 className="w-3 h-3" />}
                    {isWait && <Hourglass className="w-3 h-3" />}
                    {isRejected && <XCircle className="w-3 h-3" />}
                    {isBought && <PackageCheck className="w-3 h-3" />}
                    <span>{q.status}</span>
                  </span>
                </div>

                {/* Produce & Deal Info */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={q.cropImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                      alt={q.cropName}
                      className="w-14 h-14 rounded-xl object-cover shadow-sm"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{q.cropName}</h4>
                      <p className="text-[11px] text-slate-400">📍 {q.cropLocation}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Your Quoted Qty
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {q.requestedQty} {q.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Your Quoted Price
                      </span>
                      <span className="text-sm font-black text-blue-700">
                        ₹{q.offeredPrice}/{q.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-500">Total Valuation:</span>
                    <span className="font-bold text-slate-900">₹{q.totalQuoteValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Farmer Decision Explanatory Banner */}
                <div className="text-xs mb-3">
                  {isAccepted && (
                    <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 font-semibold">
                      🎉 <strong>Farmer Agreed to Sell!</strong> You can now confirm and execute the purchase.
                    </div>
                  )}
                  {isWait && (
                    <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-900 font-semibold">
                      ⏳ <strong>Farmer Kept on Wait:</strong> The farmer is considering other mandi offers and will decide shortly.
                    </div>
                  )}
                  {isRejected && (
                    <div className="p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-rose-900 font-semibold">
                      ❌ <strong>Offer Rejected:</strong> The farmer rejected this price. Feel free to re-quote higher from the marketplace.
                    </div>
                  )}
                  {isPending && (
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600 font-medium">
                      ⏱ Waiting for farmer review. You will be alerted instantly when they respond.
                    </div>
                  )}
                  {isBought && (
                    <div className="p-3 bg-slate-100 rounded-xl text-slate-700 font-medium">
                      📦 <strong>Order Placed:</strong> Farmer notified to begin packaging & transport.
                    </div>
                  )}
                </div>

              </div>

              {/* Action Button: BUY NOW (Unlocked when Accepted) */}
              <div className="pt-2">
                {isAccepted && (
                  <button
                    type="button"
                    onClick={() => handleBuy(q)}
                    disabled={buyingId === q.id}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 animate-bounce"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{buyingId === q.id ? 'Processing Purchase...' : t.buyNowButton}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
