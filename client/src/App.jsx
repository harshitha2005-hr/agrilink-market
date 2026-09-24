import React, { useState, useEffect, useRef } from 'react';
import { translations } from './translations';
import Navbar from './components/Navbar';
import MandiTicker from './components/MandiTicker';
import LandingPage from './components/LandingPage';
import FarmerDashboard from './components/farmer/FarmerDashboard';
import BuyerDashboard from './components/buyer/BuyerDashboard';
import { Bell, CheckCircle2, Sparkles, X, Volume2 } from 'lucide-react';

export default function App() {
  // 1. Language state (defaults to English or saved)
  const [lang, setLang] = useState(() => localStorage.getItem('agrilink_lang') || 'en');
  const t = translations[lang] || translations.en;

  useEffect(() => {
    localStorage.setItem('agrilink_lang', lang);
  }, [lang]);

  // 2. Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agrilink_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('agrilink_role') || null;
  });

  // 3. Voice Assist State
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // 4. Live Notifications & Toast
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [mandiRates, setMandiRates] = useState([]);

  // Voice speech synthesis helper
  const speakNotification = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to select appropriate language voice if available
      const voices = window.speechSynthesis.getVoices();
      const voiceMap = {
        hi: 'hi-IN',
        kn: 'kn-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        ml: 'ml-IN',
        bn: 'bn-IN',
        en: 'en-IN'
      };
      const langCode = voiceMap[lang] || 'en-US';
      const matched = voices.find(v => v.lang.includes(langCode));
      if (matched) utterance.voice = matched;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Play gentle sound effect helper using Web Audio API
  const playChime = (type = 'notify') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'cash') {
        // High pleasant ding
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        // Soft chime
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // Load Mandi benchmark rates
  useEffect(() => {
    fetch('/api/mandi-rates')
      .then(res => res.json())
      .then(data => {
        if (data.rates) setMandiRates(data.rates);
      })
      .catch(err => console.error("Error loading mandi rates:", err));
  }, []);

  // Real-time SSE Connection
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('NEW_QUOTE', (e) => {
      const payload = JSON.parse(e.data);
      if (currentRole === 'farmer' && currentUser?.phone === payload.farmerPhone) {
        const msg = payload.message || t.newQuoteAlert;
        triggerNotification(msg, 'quote');
      }
    });

    eventSource.addEventListener('QUOTE_DECISION', (e) => {
      const payload = JSON.parse(e.data);
      if (currentRole === 'buyer' && currentUser?.phone === payload.buyerPhone) {
        const msg = payload.message || t.farmerDecisionAlert;
        triggerNotification(msg, 'decision');
      }
    });

    eventSource.addEventListener('CROP_PURCHASED', (e) => {
      const payload = JSON.parse(e.data);
      if (currentRole === 'farmer' && currentUser?.phone === payload.farmerPhone) {
        const msg = payload.message || t.cropBoughtAlert;
        triggerNotification(msg, 'purchase');
      }
    });

    eventSource.addEventListener('CROP_ADDED', (e) => {
      const payload = JSON.parse(e.data);
      if (currentRole === 'buyer') {
        const msg = `New fresh produce listed: ${payload.crop.name} (${payload.crop.quantity} ${payload.crop.unit}) by ${payload.crop.farmerName}`;
        triggerNotification(msg, 'crop');
      }
    });

    return () => {
      eventSource.close();
    };
  }, [currentRole, currentUser?.phone, lang]);

  const triggerNotification = (message, type = 'notify') => {
    const notif = { message, type, time: new Date().toISOString() };
    setNotifications(prev => [notif, ...prev]);
    setActiveToast(notif);
    playChime(type === 'purchase' ? 'cash' : 'notify');
    speakNotification(message);

    setTimeout(() => {
      setActiveToast(null);
    }, 6000);
  };

  // Handlers for Login, Logout, and Switching Role
  const handleLogin = ({ role, user }) => {
    setCurrentRole(role);
    setCurrentUser(user);
    localStorage.setItem('agrilink_role', role);
    localStorage.setItem('agrilink_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setCurrentUser(null);
    localStorage.removeItem('agrilink_role');
    localStorage.removeItem('agrilink_user');
  };

  // Quick switch between farmer and buyer to test interactions seamlessly
  const handleSwitchRole = () => {
    if (currentRole === 'farmer') {
      // Switch to Demo Buyer Priya
      const demoBuyer = {
        id: 'b_demo',
        phone: '9123456780',
        name: 'Priya Sharma',
        storeName: 'Kisan Fresh Agro Wholesale',
        location: 'Pune Wholesale APMC'
      };
      setCurrentRole('buyer');
      setCurrentUser(demoBuyer);
      localStorage.setItem('agrilink_role', 'buyer');
      localStorage.setItem('agrilink_user', JSON.stringify(demoBuyer));
    } else {
      // Switch to Demo Farmer Ramesh
      const demoFarmer = {
        id: 'f_demo',
        phone: '9876543210',
        name: 'Ramesh Patel',
        location: 'Nashik Mandi, Maharashtra'
      };
      setCurrentRole('farmer');
      setCurrentUser(demoFarmer);
      localStorage.setItem('agrilink_role', 'farmer');
      localStorage.setItem('agrilink_user', JSON.stringify(demoFarmer));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* 1. APMC Live Mandi Rate Ticker */}
      <MandiTicker rates={mandiRates} t={t} />

      {/* 2. Universal Navigation Header */}
      <Navbar
        lang={lang}
        setLang={setLang}
        t={t}
        currentUser={currentUser}
        currentRole={currentRole}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        notifications={notifications}
        unreadCount={notifications.length}
        onClearNotifications={() => setNotifications([])}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
      />

      {/* 3. Real-time Toast Notification Banner */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-start space-x-3 animate-in slide-in-from-bottom-5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 pr-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">
              Live Mandi Notification
            </span>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {activeToast.message}
            </p>
          </div>
          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Main Body: Landing Page vs Farmer Dashboard vs Buyer Dashboard */}
      <main className="flex-1">
        {!currentUser || !currentRole ? (
          <LandingPage onLogin={handleLogin} t={t} />
        ) : currentRole === 'farmer' ? (
          <FarmerDashboard farmer={currentUser} t={t} />
        ) : (
          <BuyerDashboard buyer={currentUser} t={t} />
        )}
      </main>

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-emerald-700">{t.appTitle}</span>
            <span>—</span>
            <span>{t.appSubTitle}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Multi-Lingual Kisan Portal • AI Produce Grading • Direct APMC & Buyer Linkage
          </p>
        </div>
      </footer>

    </div>
  );
}
