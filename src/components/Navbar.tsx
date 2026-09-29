'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  ListFilter, 
  PlusCircle, 
  Database, 
  Award, 
  Home, 
  Volume2, 
  VolumeX,
  Zap,
  Clock,
  Play,
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playPointWonSound, unlockAudioContext } from '@/lib/sound-effects';

export type TabType = 
  | 'home' 
  | 'bench_input' 
  | 'detailed_input' 
  | 'bench_analysis' 
  | 'comprehensive_analysis' 
  | 'matches' 
  | 'settings';

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
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6">
        <div className="flex items-center justify-between h-15">
          {/* Logo & Active Match */}
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className="flex items-center space-x-2 text-left group focus:outline-none shrink-0"
          >
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2 rounded-xl text-white font-black shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  TT Analytics
                </span>
              </div>
              {activeMatchName && (
                <div className="text-[11px] text-slate-500 truncate max-w-[120px] sm:max-w-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {activeMatchName}
                </div>
              )}
            </div>
          </button>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-none py-1">
            {/* メニュー */}
            <button
              onClick={() => onTabChange('home')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>ホーム</span>
            </button>

            {/* ベンチ入力 */}
            <button
              onClick={() => onTabChange('bench_input')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'bench_input'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                  : 'text-amber-800 hover:bg-amber-50 hover:text-amber-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              <span>ベンチ入力</span>
            </button>

            {/* 詳細入力 */}
            <button
              onClick={() => onTabChange('detailed_input')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'detailed_input'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              <span>詳細入力</span>
            </button>

            {/* ベンチ分析 */}
            <button
              onClick={() => onTabChange('bench_analysis')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'bench_analysis'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                  : 'text-amber-800 hover:bg-amber-50 hover:text-amber-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>ベンチ分析</span>
            </button>

            {/* 総合分析 */}
            <button
              onClick={() => onTabChange('comprehensive_analysis')}
              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'comprehensive_analysis'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>総合分析</span>
            </button>

            {/* 試合一覧 */}
            <button
              onClick={() => onTabChange('matches')}
              className={`hidden md:flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>試合</span>
            </button>

            {/* データ管理 */}
            <button
              onClick={() => onTabChange('settings')}
              className={`hidden lg:flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>データ</span>
            </button>

            {/* サウンドON/OFF切替ボタン */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                soundOn
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
              title={soundOn ? '効果音: ON（タップでミュート）' : '効果音: OFF（タップでON）'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* 新規試合作成ボタン */}
            <button
              onClick={onNewMatchClick}
              className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 shadow-sm transition-all active:scale-95 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">新規試合</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
