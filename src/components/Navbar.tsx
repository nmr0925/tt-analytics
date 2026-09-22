'use client';

import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, ListFilter, PlusCircle, Database, Award, Home, Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playPointWonSound, unlockAudioContext } from '@/lib/sound-effects';

export type TabType = 'home' | 'input' | 'analysis' | 'matches' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNewMatchClick: () => void;
  activeMatchName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onNewMatchClick,
  activeMatchName,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    unlockAudioContext();
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playPointWonSound();
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-15">
          {/* Logo & Active Match */}
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className="flex items-center space-x-2.5 text-left group focus:outline-none"
          >
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2 rounded-xl text-white font-black shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  TT Analytics
                </span>
                <span className="hidden sm:inline-block text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  卓球プレー分析
                </span>
              </div>
              {activeMatchName && (
                <div className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {activeMatchName}
                </div>
              )}
            </div>
          </button>

          {/* Navigation Tabs & Sound Toggle */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => onTabChange('home')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'home'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>メニュー</span>
            </button>

            <button
              onClick={() => onTabChange('input')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'input'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>入力</span>
            </button>

            <button
              onClick={() => onTabChange('analysis')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'analysis'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>分析</span>
            </button>

            <button
              onClick={() => onTabChange('matches')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'matches'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">試合</span>
            </button>

            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">データ</span>
            </button>

            {/* サウンドON/OFF切替ボタン */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                soundOn
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
              title={soundOn ? '効果音: ON（タップでミュート）' : '効果音: OFF（タップでON）'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden md:inline">{soundOn ? '音ON' : '音OFF'}</span>
            </button>

            {/* 新規試合作成ボタン */}
            <button
              onClick={onNewMatchClick}
              className="ml-1 sm:ml-2 bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden xs:inline">新規試合</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
