import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Truck, 
  Package, 
  Store, 
  Calendar, 
  IndianRupee, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function SoldOutCropsView({ soldOutCrops = [], onUpdateTracking, t }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleNextStep = async (order) => {
    let nextStatus = 'In Transport';
    let stepIdx = 2;

    if (order.trackingStatus === 'Packaging') {
      nextStatus = 'Dispatched to Transport';
      stepIdx = 2;
    } else if (order.trackingStatus.includes('Dispatched') || order.trackingStatus === 'In Transport') {
      nextStatus = 'Delivered';
      stepIdx = 3;
    } else {
      return;
    }

    setUpdatingId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingStatus: nextStatus,
          stepIndex: stepIdx
        })
      });
      const data = await res.json();
      if (data.success && onUpdateTracking) {
        onUpdateTracking(data.order);
      }
    } catch (err) {
      console.error("Tracking update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t.soldOutTitle}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.soldOutSub}</p>
      </div>

      {soldOutCrops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">{t.noSoldOutYet}</h3>
          <p className="text-xs text-slate-500">
            When you accept a buyer's offer or sell via the 'Best Marketplace', your sales and packaging tasks appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {soldOutCrops.map((order) => {
            const isCompleted = order.trackingStatus === 'Delivered';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Top Row: Crop Info, Store Sold to, Total Amount */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-4">
                    <img
                      src={order.cropImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                      alt={order.cropName}
                      className="w-16 h-16 rounded-2xl object-cover shadow-sm flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-black text-slate-900">
                          {order.cropName}
                        </h3>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full">
                          #{order.id.slice(-6)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 flex items-center space-x-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>
                          {t.buyerStore}: <strong className="text-slate-900">{order.storeName || order.buyerName}</strong> ({order.buyerName})
                        </span>
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{t.saleDate}: {new Date(order.saleDate).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="flex items-center space-x-6 md:text-right bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        Sold Quantity
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {order.quantity} {order.unit || 'kg'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">@ ₹{order.pricePerKg}/kg</span>
                    </div>

                    <div className="border-l border-emerald-200 pl-4">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                        {t.soldAmount}
                      </span>
                      <span className="text-lg font-black text-emerald-700">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium block">Paid / Secured</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Packaging & Transport Progress Tracker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>{t.packagingTransport}</span>
                    </span>

                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      isCompleted 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-900 animate-pulse'
                    }`}>
                      Current Status: {order.trackingStatus}
                    </span>
                  </div>

                  {/* 4-Step Visual Tracker */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center space-x-1 text-emerald-700 font-bold mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>1. Confirmed</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 block">Order Placed</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border text-xs ${
                      order.trackingStatus === 'Packaging' 
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' 
                        : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <div className="flex items-center space-x-1 text-slate-800 font-bold mb-1">
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span>2. Packaging</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Bagging & Grading</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border text-xs ${
                      order.trackingStatus.includes('Dispatched') || order.trackingStatus === 'In Transport'
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
                        : isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <div className="flex items-center space-x-1 font-bold mb-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>3. Dispatched</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Vehicle in Transit</span>
                    </div>

                    <div className={`p-2.5 rounded-xl border text-xs ${
                      isCompleted 
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <div className="flex items-center space-x-1 font-bold mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>4. Delivered</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">At Buyer Mandi</span>
                    </div>
                  </div>

                  {/* Proceed to Next Step Button */}
                  {!isCompleted && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleNextStep(order)}
                        disabled={updatingId === order.id}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <span>
                          {order.trackingStatus === 'Packaging' 
                            ? 'Mark Packaged & Ready for Dispatch →' 
                            : 'Mark Vehicle Dispatched & En-Route →'}
                        </span>
                      </button>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
