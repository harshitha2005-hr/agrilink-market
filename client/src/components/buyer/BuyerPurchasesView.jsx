import React from 'react';
import { 
  Package, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Truck, 
  CheckCircle2, 
  FileText,
  User,
  ShieldCheck
} from 'lucide-react';

export default function BuyerPurchasesView({ purchases = [], t }) {
  if (!purchases || purchases.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">No Purchases Yet</h3>
        <p className="text-xs text-slate-500">
          Once your quotes are accepted by farmers and you click 'Buy Now', your purchase records and shipment tracking will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t.myPurchasesTitle}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.myPurchasesSub}</p>
      </div>

      <div className="space-y-4">
        {purchases.map((order) => {
          const isDelivered = order.trackingStatus === 'Delivered';

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <img
                    src={order.cropImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}
                    alt={order.cropName}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-slate-900">{order.cropName}</h3>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded-full font-bold">
                        #{order.id.slice(-6)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>
                        Farmer: <strong className="text-slate-900">{order.farmerName}</strong> ({order.farmerPhone})
                      </span>
                    </p>

                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Purchased: {new Date(order.saleDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                {/* Amount Paid */}
                <div className="flex items-center space-x-6 md:text-right bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Quantity Brought
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {order.quantity} {order.unit || 'kg'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">@ ₹{order.pricePerKg}/kg</span>
                  </div>

                  <div className="border-l border-blue-200 pl-4">
                    <span className="text-[10px] text-blue-800 uppercase font-bold tracking-wider block">
                      Total Paid
                    </span>
                    <span className="text-lg font-black text-blue-700">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold block flex items-center justify-end">
                      <ShieldCheck className="w-3 h-3 mr-0.5" /> Mandi Secured
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Dispatch Tracking */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Live Transport Status</span>
                  </span>

                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    isDelivered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 animate-pulse'
                  }`}>
                    {order.trackingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                    <div className="flex items-center space-x-1 text-blue-700 font-bold mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Order Paid</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Confirmed</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    order.trackingStatus === 'Packaging' 
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center space-x-1 text-slate-800 font-bold mb-0.5">
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                      <span>Farmer Packaging</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Grading & Bagging</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    order.trackingStatus.includes('Dispatched') || order.trackingStatus === 'In Transport'
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
                      : isDelivered
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center space-x-1 font-bold mb-0.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Vehicle En-Route</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Transit to Mandi</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    isDelivered ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <div className="flex items-center space-x-1 font-bold mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivered</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Goods Received</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
