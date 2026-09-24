import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  IndianRupee, 
  Scale, 
  Check,
  ShieldAlert,
  Award
} from 'lucide-react';

const SAMPLE_CROPS = [
  { name: 'Red Onion', category: 'Vegetables', defaultPrice: 32, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80' },
  { name: 'Vine Tomatoes', category: 'Vegetables', defaultPrice: 28, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
  { name: 'Golden Wheat', category: 'Grains', defaultPrice: 27, img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sona Masoori Rice', category: 'Grains', defaultPrice: 48, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fresh Potatoes', category: 'Vegetables', defaultPrice: 22, img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80' },
  { name: 'Guntur Green Chilli', category: 'Spices', defaultPrice: 75, img: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80' }
];

export default function AddCropModal({ isOpen, onClose, farmer, onCropAdded, t }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [location, setLocation] = useState(farmer.location || 'Local Mandi');
  const [imagePreview, setImagePreview] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Trigger AI visual analysis whenever a photo is uploaded or sample is picked
  const analyzeImage = async (imgData, cropTitle, price) => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/crops/analyze-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: cropTitle || name || 'Farm Crop',
          expectedPrice: price || expectedPrice || 30,
          imageData: imgData,
          location
        })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiReport(data.analysis);
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setImagePreview(result);
        analyzeImage(result, name, expectedPrice);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSample = (sample) => {
    setName(sample.name);
    setCategory(sample.category);
    setExpectedPrice(sample.defaultPrice.toString());
    setImagePreview(sample.img);
    analyzeImage(sample.img, sample.name, sample.defaultPrice);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !quantity || !expectedPrice) {
      setError('Please fill in crop name, quantity, and expected price');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerPhone: farmer.phone,
          farmerName: farmer.name,
          name,
          category,
          quantity: Number(quantity),
          unit,
          location,
          expectedPrice: Number(expectedPrice),
          imageUrl: imagePreview,
          imageData: imagePreview
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to list crop');

      onCropAdded(data.crop);
      onClose();
    } catch (err) {
      setError(err.message || 'Error submitting crop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              🌾
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t.addCropTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Quick Pick Produce Sample:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SAMPLE_CROPS.map((sample, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => selectSample(sample)}
                  className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center ${
                    name === sample.name ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={sample.img} alt={sample.name} className="w-10 h-10 object-cover rounded-lg mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 truncate w-full">{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload & AI Quality Scanner */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.uploadPic} <span className="text-rose-500">*</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Image Preview Box */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[160px] bg-slate-50 text-center overflow-hidden">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Produce Preview"
                      className="w-full h-36 object-cover rounded-xl shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setAiReport(null);
                      }}
                      className="absolute top-6 right-6 bg-slate-900/70 hover:bg-slate-900 text-white p-1 rounded-full text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Click to upload harvest photo</p>
                    <p className="text-[10px] text-slate-400">JPG, PNG up to 10MB</p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* AI Quality Report Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 flex flex-col justify-between border border-slate-700 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      AI Quality Analyzer
                    </span>
                  </div>
                  {aiReport && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      {aiReport.certificateId}
                    </span>
                  )}
                </div>

                {analyzing ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-emerald-300 font-medium animate-pulse">
                      {t.analyzingProduce}
                    </p>
                  </div>
                ) : aiReport ? (
                  <div className="space-y-3 py-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t.gradeBadge}:</span>
                      <span className="font-extrabold text-sm px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                        {aiReport.grade}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-700/60">
                      <div>
                        <span className="text-slate-400 block">{t.freshnessScore}</span>
                        <span className="font-bold text-emerald-400">{aiReport.freshness}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t.blemishRate}</span>
                        <span className="font-bold text-amber-400">{aiReport.blemishRate}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t.shelfLife}</span>
                        <span className="font-bold text-slate-200">~{aiReport.shelfLifeDays} days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t.aiPriceReco}</span>
                        <span className="font-bold text-emerald-300">{aiReport.fairMarketPriceRange}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 italic pt-1 line-clamp-2 border-t border-slate-700/60">
                      "{aiReport.summary}"
                    </p>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Upload or pick a photo to view real-time AI computer vision quality grading & price suggestions.
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Form Fields: Crop Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.cropName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (imagePreview) analyzeImage(imagePreview, e.target.value, expectedPrice);
                }}
                placeholder={t.cropNamePlaceholder}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.cropCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains / Cereals</option>
                <option value="Pulses">Pulses / Legumes</option>
                <option value="Spices">Spices</option>
                <option value="Cash Crops">Cash Crops</option>
              </select>
            </div>
          </div>

          {/* Quantity & Expected Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.quantitySelling} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.unit}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="quintal">Quintal (100 kg)</option>
                <option value="tonne">Metric Tonne (1,000 kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {t.expectedPrice} <span className="text-rose-500">*</span>
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
                  value={expectedPrice}
                  onChange={(e) => {
                    setExpectedPrice(e.target.value);
                    if (imagePreview) analyzeImage(imagePreview, name, e.target.value);
                  }}
                  placeholder="e.g. 35"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Location of Crop Grown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Location of Crop Grown / Mandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nashik Dindori Mandi, Maharashtra"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || analyzing}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? t.uploading : t.submitCrop}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
