import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Sparkles, 
  User, 
  Scale, 
  IndianRupee, 
  Award, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import BuyerQuoteModal from './BuyerQuoteModal';

export default function BuyerMarketCatalog({ buyer, onQuoteSent, t }) {
  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedCropForQuote, setSelectedCropForQuote] = useState(null);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crops');
      const data = await res.json();
      if (data.crops) {
        setCrops(data.crops);
      }
    } catch (err) {
      console.error("Error fetching market crops:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = 
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.category.toLowerCase().includes(search.toLowerCase()) ||
      crop.location.toLowerCase().includes(search.toLowerCase()) ||
      crop.farmerName.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = 
      selectedGrade === 'ALL' ||
      (crop.aiAnalysis && crop.aiAnalysis.grade.includes(selectedGrade));

    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Farm-Gate Direct Sourcing & AI Certified Lots</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.buyCropsTitle}
          </h2>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            {t.buyCropsSub}
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchCrops}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm transition"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'A+', 'A', 'B'].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedGrade === grade
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {grade === 'ALL' ? t.allGrades : `Grade ${grade}`}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading verified farmer listings...</p>
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-700">No matching produce found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or grade filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                
                {/* Crop Photo & AI Quality Tag */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={crop.imageUrl}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {crop.aiAnalysis?.grade && (
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shadow">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{crop.aiAnalysis.grade}</span>
                      <span className="text-emerald-400 font-mono">({crop.aiAnalysis.freshness}% Fresh)</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    {crop.quantity} {crop.unit} Left
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {crop.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {crop.category} • Farmer: <strong className="text-slate-700">{crop.farmerName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Farmer Ask Rate */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Lot Available
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {crop.quantity.toLocaleString()} {crop.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Farmer Asking Rate
                      </span>
                      <span className="text-sm font-black text-blue-700">
                        ₹{crop.expectedPrice} <span className="text-xs font-normal text-slate-500">/{crop.unit}</span>
                      </span>
                    </div>
                  </div>

                  {/* Location & AI Quality Details */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{crop.location}</span>
                    </div>

                    {crop.aiAnalysis && (
                      <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 mt-2">
                        <span className="font-semibold block">
                          AI Fair Market Price: {crop.aiAnalysis.fairMarketPriceRange}
                        </span>
                        <span className="text-slate-500 text-[10px] block truncate">
                          Defect Rate: {crop.aiAnalysis.blemishRate}% • {crop.aiAnalysis.moistureEstimate || 'Optimal'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Button: Quote Price */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedCropForQuote(crop)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-2"
                >
                  <span>{t.quoteButton}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Quote Submission Modal */}
      {selectedCropForQuote && (
        <BuyerQuoteModal
          isOpen={!!selectedCropForQuote}
          onClose={() => setSelectedCropForQuote(null)}
          crop={selectedCropForQuote}
          buyer={buyer}
          onQuoteSubmitted={(quote) => {
            if (onQuoteSent) onQuoteSent(quote);
          }}
          t={t}
        />
      )}

    </div>
  );
}
