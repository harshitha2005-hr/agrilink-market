import React, { useState } from 'react';
import { languages } from '../translations';
import { Sprout, Globe, User, LogOut, ArrowLeftRight, Bell, Volume2, VolumeX } from 'lucide-react';

export default function Navbar({
  lang,
  setLang,
  t,
  currentUser,
  currentRole,
  onLogout,
  onSwitchRole,
  notifications = [],
  unreadCount = 0,
  onClearNotifications,
  voiceEnabled,
  setVoiceEnabled
}) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur border-b border-emerald-100 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                {t.appTitle}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Direct Mandi
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xs md:max-w-md">
              {t.appSubTitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Voice Assist Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "Mute Voice Assistance" : "Enable Regional Voice Readout"}
            className={`p-2 rounded-lg border transition-all ${
              voiceEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Regional Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 bg-slate-50 text-slate-700 text-xs font-medium transition"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{languages.find(l => l.code === lang)?.native || 'Language'}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Select Language / ಭಾಷೆ
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition hover:bg-emerald-50 ${
                      lang === l.code ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-[11px] text-slate-400">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg border border-slate-200 hover:border-emerald-300 bg-white text-slate-600 relative transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700">Live Mandi Alerts</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No new notifications</p>
                    ) : (
                      notifications.map((n, idx) => (
                        <div key={idx} className="py-2.5 text-xs">
                          <p className="text-slate-800 font-medium">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.time || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile & Role Switcher */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onSwitchRole}
                title="Switch role to test buyer/farmer interactions"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{t.switchRole}</span>
              </button>

              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    {currentRole === 'farmer' ? t.farmerPortal : t.buyerPortal}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}

        </div>

      </div>
    </header>
  );
}
