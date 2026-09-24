import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Sparkles, 
  Award, 
  Clock, 
  Layers, 
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function AvailableCropsView({ 
  availableCrops = [], 
  onOpenAddModal, 
  onSelectCropForMarketplace,
  t 
}) {
  const [selectedCropModal, setSelectedCropModal] = useState(null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t.availableTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.availableSub}</p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCrop}</span>
        </button>
      </div>

      {availableCrops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            🌾
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">{t.noCropsListed}</h3>
          <p className="text-xs text-slate-500 mb-6">
            List your harvest with AI visual quality grading to immediately reach verified buyers.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition"
          >
            {t.addCrop}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCrops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Crop Image & Grade Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={crop.imageUrl}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  
                  {/* AI Quality Grade Badge */}
                  {crop.aiAnalysis?.grade && (
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shadow">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{crop.aiAnalysis.grade}</span>
                      <span className="text-emerald-400 font-mono">({crop.aiAnalysis.qualityScore}%)</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    {t.inStock}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {crop.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {crop.category} • Listed {new Date(crop.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Price Highlight */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Available Stock
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {crop.quantity.toLocaleString()} {crop.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Your Price
                      </span>
                      <span className="text-sm font-black text-emerald-600">
                        ₹{crop.expectedPrice} <span className="text-xs font-normal text-slate-500">/{crop.unit}</span>
                      </span>
                    </div>
                  </div>

                  {/* Location & AI Specs */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{crop.location}</span>
                    </div>
                    {crop.aiAnalysis && (
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
                        <span className="text-emerald-700 font-semibold">
                          Freshness: {crop.aiAnalysis.freshness}%
                        </span>
                        <span>•</span>
                        <span>Blemishes: {crop.aiAnalysis.blemishRate}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCropModal(crop)}
                  className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold text-center transition"
                >
                  AI Certificate
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCropForMarketplace(crop)}
                  className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center border border-emerald-200 transition flex items-center justify-center space-x-1"
                >
                  <span>Find Buyers</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* AI Certificate Inspection Modal */}
      {selectedCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">AI Quality Inspection Certificate</h4>
              </div>
              <button
                onClick={() => setSelectedCropModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-4">
              <img
                src={selectedCropModal.imageUrl}
                alt={selectedCropModal.name}
                className="w-24 h-24 object-cover rounded-2xl mx-auto shadow-md mb-2"
              />
              <h3 className="text-base font-black text-slate-900">{selectedCropModal.name}</h3>
              <p className="text-xs text-slate-500 font-mono">
                {selectedCropModal.aiAnalysis?.certificateId || 'AGRI-QC-CERT'}
              </p>
            </div>

            {selectedCropModal.aiAnalysis && (
              <div className="space-y-2.5 bg-slate-50 rounded-2xl p-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Official Grade:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedCropModal.aiAnalysis.grade}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Freshness Rating:</span>
                  <span className="font-bold text-slate-800">{selectedCropModal.aiAnalysis.freshness}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Defect / Blemish:</span>
                  <span className="font-bold text-slate-800">{selectedCropModal.aiAnalysis.blemishRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mandi Fair Price Range:</span>
                  <span className="font-bold text-emerald-600">{selectedCropModal.aiAnalysis.fairMarketPriceRange}</span>
                </div>
                <p className="text-[11px] text-slate-600 italic pt-2 border-t border-slate-200">
                  "{selectedCropModal.aiAnalysis.summary}"
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedCropModal(null)}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
