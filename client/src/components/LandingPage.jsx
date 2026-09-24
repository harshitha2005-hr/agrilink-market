import React, { useState } from 'react';
import { 
  Tractor, 
  Store, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  User, 
  MapPin, 
  Building2,
  CheckCircle2,
  TrendingUp,
  Brain,
  History
} from 'lucide-react';

export default function LandingPage({ onLogin, t }) {
  const [selectedRole, setSelectedRole] = useState(null); // 'farmer' or 'buyer'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setError('');
    // Pre-fill reasonable defaults if empty
    if (role === 'farmer') {
      setLocation(loc => loc || 'Nashik Mandi, Maharashtra');
    } else {
      setLocation(loc => loc || 'Pune Wholesale APMC');
      setStoreName(s => s || 'Kisan Fresh Agro Wholesale');
    }
  };

  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'farmer') {
      setSelectedRole('farmer');
      setPhone('9876543210');
      setName('Ramesh Patel');
      setLocation('Nashik Mandi, Maharashtra');
    } else {
      setSelectedRole('buyer');
      setPhone('9123456780');
      setName('Priya Sharma');
      setStoreName('Kisan Fresh Agro Wholesale');
      setLocation('Pune Wholesale APMC');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!name || name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          phone: phone.trim(),
          name: name.trim(),
          location: location.trim(),
          storeName: storeName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin({
        role: selectedRole,
        user: data.user
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/60 via-white to-slate-50">
      <div className="max-w-5xl mx-auto w-full">

        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI-Powered Fair Price Discovery & Farmer-Buyer Linkages</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {t.appTitle}: <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Direct Farmer Mandi</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            {t.appSubTitle}. Eliminating middlemen, providing instant AI visual crop grading, and matching farmers with the highest-paying stores nearby.
          </p>
        </div>

        {/* Persistent Storage Guarantee Banner */}
        <div className="mb-8 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center space-x-3 text-xs text-amber-900 shadow-sm max-w-3xl mx-auto">
          <History className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p>
            <strong className="font-semibold">Persistent Identity:</strong> Log in with your phone number anytime. All your crops, prices, quotes, and sold history will remain safely stored and never reset to zero.
          </p>
        </div>

        {/* Dual Choice Cards (Continue as Farmer vs Continue as Buyer) */}
        {!selectedRole ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Continue as Farmer Card */}
            <div 
              onClick={() => handleSelectRole('farmer')}
              className="group relative bg-white rounded-3xl p-8 border-2 border-emerald-200 hover:border-emerald-500 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                Kisan Portal
              </div>
              
              <div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition duration-300 mb-6">
                  <Tractor className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition">
                  {t.continueAsFarmer}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  {t.farmerDesc}
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Upload harvest & get instant <strong>AI Quality Grading</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Best Marketplace</strong>: Discover highest paying nearby stores</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Negotiate live: <strong>Sell, Reject, or Keep on Wait</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">Enter as Farmer →</span>
                <div className="w-9 h-9 rounded-full bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Continue as Buyer Card */}
            <div 
              onClick={() => handleSelectRole('buyer')}
              className="group relative bg-white rounded-3xl p-8 border-2 border-blue-200 hover:border-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                Vyapar Portal
              </div>

              <div>
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition duration-300 mb-6">
                  <Store className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition">
                  {t.continueAsBuyer}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  {t.buyerDesc}
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Direct farm-gate procurement from certified farmers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Inspect full <strong>AI Visual Quality Test Certificates</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Submit counter quotes & buy directly upon agreement</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">Enter as Buyer →</span>
                <div className="w-9 h-9 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 flex items-center justify-center transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Login / Credentials Form for Selected Role */
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                  selectedRole === 'farmer' ? 'bg-emerald-600' : 'bg-blue-600'
                }`}>
                  {selectedRole === 'farmer' ? <Tractor className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedRole === 'farmer' ? t.loginHeadingFarmer : t.loginHeadingBuyer}
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {selectedRole === 'farmer' ? 'Kisan Auth' : 'Vyapar Auth'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs text-slate-400 hover:text-slate-700 underline font-medium"
              >
                Change Role
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              {t.loginSubtext}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Phone Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.phoneNumber} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.fullName} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Store Name Input (For Buyer Only) */}
              {selectedRole === 'buyer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.storeName}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder={t.storePlaceholder}
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Location Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.location}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.locationPlaceholder}
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 ${
                  selectedRole === 'farmer'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                }`}
              >
                <span>{loading ? 'Verifying & Loading...' : t.enterDashboard}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Demo Profiles */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400 mb-2 font-medium">Quick 1-Click Demo Accounts:</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('farmer')}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition text-left sm:text-center"
                >
                  🌾 Demo Farmer (Ramesh)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('buyer')}
                  className="flex-1 py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200 transition text-left sm:text-center"
                >
                  🏢 Demo Buyer (Priya)
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
