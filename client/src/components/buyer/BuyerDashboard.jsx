import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  History, 
  Store, 
  Sparkles, 
  Phone, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import BuyerMarketCatalog from './BuyerMarketCatalog';
import BuyerQuotesView from './BuyerQuotesView';
import BuyerPurchasesView from './BuyerPurchasesView';

export default function BuyerDashboard({ buyer, t }) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'quotes', 'purchases'
  const [dashboardData, setDashboardData] = useState({
    myQuotes: [],
    purchaseHistory: []
  });
  const [loading, setLoading] = useState(true);

  const fetchBuyerData = async () => {
    try {
      const res = await fetch(`/api/user/buyer/${buyer.phone}`);
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Error loading buyer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, [buyer.phone]);

  const handleQuoteSent = (newQuote) => {
    fetchBuyerData();
    setActiveTab('quotes');
  };

  const handleBuySuccess = (order) => {
    fetchBuyerData();
    setActiveTab('purchases');
  };

  const totalSpent = dashboardData.purchaseHistory.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const acceptedQuotesCount = dashboardData.myQuotes.filter(q => q.status === 'ACCEPTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-600/50 border border-blue-500/40 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Verified Buyer & Merchant Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {t.welcome}, <span className="text-amber-300">{buyer.name}</span>!
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 flex items-center space-x-3 flex-wrap gap-y-1">
              <span className="font-semibold text-white">{buyer.storeName || 'Wholesale Buyer'}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-blue-300" />
                <span>{buyer.phone}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-300" />
                <span>{buyer.location || 'Mandi Yard'}</span>
              </span>
            </p>
          </div>

          <button
            onClick={() => setActiveTab('catalog')}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform hover:scale-[1.02] flex items-center justify-center space-x-2 self-start md:self-auto"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Buy Crops (Marketplace)</span>
          </button>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-blue-600/40 text-left">
          <div className="bg-blue-950/40 backdrop-blur p-3 rounded-2xl border border-blue-600/30">
            <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">
              Purchases Completed
            </span>
            <span className="text-xl font-black text-white">
              {dashboardData.purchaseHistory.length}
            </span>
          </div>

          <div className="bg-blue-950/40 backdrop-blur p-3 rounded-2xl border border-blue-600/30">
            <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">
              Active Negotiations / Quotes
            </span>
            <span className="text-xl font-black text-white">
              {dashboardData.myQuotes.length}
            </span>
          </div>

          <div className="bg-blue-950/40 backdrop-blur p-3 rounded-2xl border border-blue-600/30">
            <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">
              Total Farm Procurement
            </span>
            <span className="text-xl font-black text-amber-300">
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'catalog'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buy Crops (Live Marketplace)</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 relative ${
            activeTab === 'quotes'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Quotes & Offers ({dashboardData.myQuotes.length})</span>
          {acceptedQuotesCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'purchases'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Purchase History ({dashboardData.purchaseHistory.length})</span>
        </button>
      </div>

      {/* 3. Tab Views */}
      <div>
        {activeTab === 'catalog' && (
          <BuyerMarketCatalog
            buyer={buyer}
            onQuoteSent={handleQuoteSent}
            t={t}
          />
        )}

        {activeTab === 'quotes' && (
          <BuyerQuotesView
            quotes={dashboardData.myQuotes}
            buyer={buyer}
            onBuySuccess={handleBuySuccess}
            t={t}
          />
        )}

        {activeTab === 'purchases' && (
          <BuyerPurchasesView
            purchases={dashboardData.purchaseHistory}
            t={t}
          />
        )}
      </div>

    </div>
  );
}
