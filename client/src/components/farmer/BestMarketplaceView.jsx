import React, { useState, useEffect } from 'react';
import { 
  Store, 
  MapPin, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  IndianRupee, 
  Truck, 
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BestMarketplaceView({ 
  farmer, 
  availableCrops = [], 
  onCropSold, 
  t 
}) {
  const [selectedCrop, setSelectedCrop] = useState(availableCrops[0] || null);
  const [buyers, setBuyers] = useState([]);
  const [bestReco, setBestReco] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sellingStoreId, setSellingStoreId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // When selected crop changes, fetch AI nearby buyer recommendations
  useEffect(() => {
    if (availableCrops.length > 0 && !selectedCrop) {
      setSelectedCrop(availableCrops[0]);
    }
  }, [availableCrops]);

  useEffect(() => {
    if (!selectedCrop) {
      setBuyers([]);
      setBestReco(null);
      return;
    }

    const fetchMatchmaking = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/crops/${selectedCrop.id}/best-marketplace`);
        const data = await res.json();
        if (data.buyers) {
          setBuyers(data.buyers);
          setBestReco(data.bestRecommendation);
        }
      } catch (err) {
        console.error("Error fetching marketplace recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchmaking();
  }, [selectedCrop]);

  const handleInstantSell = async (buyer) => {
    if (!selectedCrop) return;
    
    setSellingStoreId(buyer.id);
    try {
      const res = await fetch('/api/marketplace/instant-sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropId: selectedCrop.id,
          buyerStoreId: buyer.id,
          farmerPhone: farmer.phone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sell crop');

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setSuccessMsg(data.message || t.soldSuccess);
      onCropSold(data.order, data.cropRemainingQty);

      // Auto clear message after 4s
      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);

    } catch (err) {
      alert(err.message || 'Error selling to store');
    } finally {
      setSellingStoreId(null);
    }
  };

  if (!availableCrops || availableCrops.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-sm max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Crops in Market</h3>
        <p className="text-xs text-slate-500 mb-6">
          You need to list at least one crop to explore AI best marketplace buyer recommendations and instant deals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Price Discovery & Buyer Matchmaking</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.bestMarketTitle}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2">
            {t.bestMarketSub}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800 font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Automatically list the farmer's available crops */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {t.selectCropPrompt}:
          </label>
          <span className="text-xs text-slate-400 font-medium">
            {availableCrops.length} Active Produce
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableCrops.map((crop) => {
            const isSelected = selectedCrop?.id === crop.id;
            return (
              <div
                key={crop.id}
                onClick={() => setSelectedCrop(crop)}
                className={`relative bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center space-x-4 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400'
                    : 'border-slate-200 hover:border-emerald-200'
                }`}
              >
                <img
                  src={crop.imageUrl}
                  alt={crop.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {crop.name}
                    </h4>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stock: <strong className="text-slate-800 font-semibold">{crop.quantity} {crop.unit}</strong>
                  </p>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="font-bold text-emerald-700">
                      ₹{crop.expectedPrice}/{crop.unit}
                    </span>
                    {crop.aiAnalysis?.grade && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        {crop.aiAnalysis.grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Discovered Nearby Buyers for Selected Crop */}
      {selectedCrop && (
        <div className="pt-4 border-t border-slate-200 space-y-5">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>
                  {t.nearbyBuyersFound} <span className="text-emerald-700 underline">{selectedCrop.name}</span>
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Selling Price: <strong>₹{selectedCrop.expectedPrice}/kg</strong> • Crop Location: <strong>{selectedCrop.location}</strong>
              </p>
            </div>

            {bestReco && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Top Match Found</span>
              </span>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500 font-medium">Scanning nearby APMC yards & wholesale stores...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Highlighted Best Recommendation on Top */}
              {bestReco && (
                <div className="relative rounded-3xl p-6 bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-xl border-4 border-amber-300 transform hover:scale-[1.01] transition duration-200 highlight-recommendation">
                  
                  {/* Glowing Top Badge */}
                  <div className="inline-flex items-center space-x-1.5 bg-slate-950 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{t.bestRecommendationBadge}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    
                    <div className="md:col-span-2 space-y-1">
                      <h4 className="text-xl font-black text-slate-950 flex items-center space-x-2">
                        <span>{bestReco.storeName}</span>
                        <ShieldCheck className="w-5 h-5 text-emerald-900" />
                      </h4>
                      <p className="text-xs font-semibold text-slate-800">
                        Contact: {bestReco.buyerName} • 📍 {bestReco.location} ({bestReco.distanceKm} km {t.distanceAway})
                      </p>
                      <p className="text-xs font-bold text-slate-900 mt-2 bg-amber-200/60 p-2 rounded-xl border border-amber-600/30">
                        {bestReco.recommendationReason || "Highest profit payout and closest proximity store with instant verified settlement."}
                      </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur rounded-2xl p-4 flex flex-col justify-between border border-amber-200 shadow-sm">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t.demandQuantity}:</span>
                          <span className="font-bold text-slate-900">{bestReco.demandQuantity} {selectedCrop.unit}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t.offeredPrice}:</span>
                          <span className="font-black text-base text-emerald-700">₹{bestReco.expectedPrice}/{selectedCrop.unit}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>Payment:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[120px]">{bestReco.paymentTerms}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInstantSell(bestReco)}
                        disabled={sellingStoreId === bestReco.id}
                        className="mt-3 w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{sellingStoreId === bestReco.id ? 'Processing...' : t.sellToStore}</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* Other Nearby Buyers List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Other Registered Buyers in Radius:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buyers
                    .filter(b => !b.isBestRecommendation)
                    .map((buyer) => (
                      <div
                        key={buyer.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-slate-900">
                                {buyer.storeName}
                              </h5>
                              <p className="text-xs text-slate-500">
                                Contact: {buyer.buyerName}
                              </p>
                            </div>
                            <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{buyer.distanceKm} km</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-slate-50 rounded-xl text-xs">
                            <div>
                              <span className="text-[11px] text-slate-400 block">{t.demandQuantity}</span>
                              <span className="font-bold text-slate-800">{buyer.demandQuantity} {selectedCrop.unit}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-slate-400 block">{t.offeredPrice}</span>
                              <span className="font-black text-emerald-700">₹{buyer.expectedPrice}/{selectedCrop.unit}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-2">
                            Terms: <span className="font-medium text-slate-700">{buyer.paymentTerms}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleInstantSell(buyer)}
                          disabled={sellingStoreId === buyer.id}
                          className="mt-4 w-full py-2 px-3 border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                        >
                          <span>{sellingStoreId === buyer.id ? 'Processing...' : t.sellToStore}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
