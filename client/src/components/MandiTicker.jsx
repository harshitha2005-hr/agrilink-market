import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MandiTicker({ rates = [], t }) {
  if (!rates || rates.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 overflow-hidden border-b border-slate-800 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex items-center space-x-2 mr-4 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold uppercase tracking-wider text-emerald-400 text-[11px]">
            {t.mandiTickerTitle}:
          </span>
        </div>
        
        <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
          {rates.map((item, idx) => {
            const isPositive = item.trend?.startsWith('+');
            return (
              <div key={idx} className="inline-flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
                <span className="font-semibold text-slate-200">{item.crop}</span>
                <span className="text-slate-400 text-[11px]">({item.market})</span>
                <span className="font-bold text-amber-400">₹{item.modalPrice}/kg</span>
                <span className={`inline-flex items-center text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {item.trend}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
