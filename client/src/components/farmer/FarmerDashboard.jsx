import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Store, 
  Layers, 
  CheckCircle2, 
  History, 
  MessageSquare, 
  TrendingUp, 
  Sparkles, 
  Package,
  MapPin,
  Phone
} from 'lucide-react';
import AddCropModal from './AddCropModal';
import BestMarketplaceView from './BestMarketplaceView';
import AvailableCropsView from './AvailableCropsView';
import SoldOutCropsView from './SoldOutCropsView';
import FarmerQuotesPanel from './FarmerQuotesPanel';

export default function FarmerDashboard({ farmer, t, onRefreshUser }) {
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace', 'available', 'soldout', 'quotes', 'history'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [dashboardData, setDashboardData] = useState({
    availableCrops: [],
    soldOutCrops: [],
    allCropsHistory: [],
    incomingQuotes: []
  });
  const [loading, setLoading] = useState(true);

  const fetchFarmerData = async () => {
    try {
      const res = await fetch(`/api/user/farmer/${farmer.phone}`);
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Error loading farmer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, [farmer.phone]);

  const handleCropAdded = (newCrop) => {
    fetchFarmerData();
    setActiveTab('available');
  };

  const handleCropSold = (order, remainingQty) => {
    fetchFarmerData();
    setActiveTab('soldout');
  };

  const handleQuoteDecision = (updatedQuote) => {
    fetchFarmerData();
  };

  const handleUpdateTracking = (updatedOrder) => {
    fetchFarmerData();
  };

  // Compute summary stats
  const totalRevenue = dashboardData.soldOutCrops.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pendingQuotesCount = dashboardData.incomingQuotes.filter(q => q.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Verified Kisan Dashboard</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {t.welcome}, <span className="text-amber-300">{farmer.name}</span>!
            </h1>
            
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                <span>{farmer.phone}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{farmer.location || 'Local Mandi'}</span>
              </span>
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform hover:scale-[1.02] flex items-center justify-center space-x-2 self-start md:self-auto"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addCrop}</span>
          </button>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-emerald-600/40 text-left">
          <div className="bg-emerald-950/40 backdrop-blur p-3 rounded-2xl border border-emerald-600/30">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
              {t.statActiveCrops}
            </span>
            <span className="text-xl font-black text-white">
              {dashboardData.availableCrops.length}
            </span>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur p-3 rounded-2xl border border-emerald-600/30">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
              {t.statTotalSold}
            </span>
            <span className="text-xl font-black text-white">
              {dashboardData.soldOutCrops.length}
            </span>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur p-3 rounded-2xl border border-emerald-600/30">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
              {t.statRevenue}
            </span>
            <span className="text-xl font-black text-amber-300">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur p-3 rounded-2xl border border-emerald-600/30">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
              {t.statPendingQuotes}
            </span>
            <span className="text-xl font-black text-emerald-200">
              {dashboardData.incomingQuotes.length}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Navigation Action Buttons (add crop, best market place, available crops, sold out crops, history) */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'marketplace'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{t.bestMarketplace}</span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'available'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.availableCrops} ({dashboardData.availableCrops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('soldout')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'soldout'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t.soldOutCrops} ({dashboardData.soldOutCrops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 relative ${
            activeTab === 'quotes'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Buyer Quotes ({dashboardData.incomingQuotes.length})</span>
          {pendingQuotesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 ${
            activeTab === 'history'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t.cropHistory}</span>
        </button>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="ml-auto px-4 py-2.5 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center space-x-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCrop}</span>
        </button>
      </div>

      {/* 3. Tab Views */}
      <div className="transition-all">
        {activeTab === 'marketplace' && (
          <BestMarketplaceView
            farmer={farmer}
            availableCrops={dashboardData.availableCrops}
            onCropSold={handleCropSold}
            t={t}
          />
        )}

        {activeTab === 'available' && (
          <AvailableCropsView
            availableCrops={dashboardData.availableCrops}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSelectCropForMarketplace={(crop) => {
              setActiveTab('marketplace');
            }}
            t={t}
          />
        )}

        {activeTab === 'soldout' && (
          <SoldOutCropsView
            soldOutCrops={dashboardData.soldOutCrops}
            onUpdateTracking={handleUpdateTracking}
            t={t}
          />
        )}

        {activeTab === 'quotes' && (
          <FarmerQuotesPanel
            quotes={dashboardData.incomingQuotes}
            onDecision={handleQuoteDecision}
            t={t}
          />
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.cropHistory}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete historical record of all crops ever listed, sold, or active by {farmer.name}.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Crop</th>
                      <th className="p-4">Initial Stock</th>
                      <th className="p-4">Price / kg</th>
                      <th className="p-4">AI Quality Grade</th>
                      <th className="p-4">Listed Date</th>
                      <th className="p-4">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {dashboardData.allCropsHistory.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 flex items-center space-x-3">
                          <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <span className="font-bold text-slate-900 block">{c.name}</span>
                            <span className="text-[11px] text-slate-400">{c.location}</span>
                          </div>
                        </td>
                        <td className="p-4">{c.initialQuantity || c.quantity} {c.unit}</td>
                        <td className="p-4 font-bold text-emerald-700">₹{c.expectedPrice}</td>
                        <td className="p-4">
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            {c.aiAnalysis?.grade || 'Grade A'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                            c.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      <AddCropModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        farmer={farmer}
        onCropAdded={handleCropAdded}
        t={t}
      />

    </div>
  );
}
