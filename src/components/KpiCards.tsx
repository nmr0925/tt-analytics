'use client';

import React from 'react';
import { AnalyticsSummary } from '@/lib/analytics';
import { Target, TrendingUp, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface KpiCardsProps {
  summary: AnalyticsSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. 総プレー数 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-800">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider">対象プレー数</span>
          <Target className="w-4 h-4 text-teal-600" />
        </div>
        <div className="text-3xl sm:text-4xl font-black text-slate-900">
          {summary.totalRallies} <span className="text-sm font-normal text-slate-500">本</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="text-emerald-600 font-bold">得点 {summary.wonCount}</span>
          <span className="text-rose-600 font-bold">失点 {summary.lostCount}</span>
        </div>
      </div>

      {/* 2. 総合得点率 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider">得点率 (Win Rate)</span>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <div
            className={`text-3xl sm:text-4xl font-black ${
              summary.winRate >= 50 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {summary.winRate}
          </div>
          <span className="text-lg font-bold text-slate-400">%</span>
        </div>
        {/* プログレスバー */}
        <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              summary.winRate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${summary.winRate}%` }}
          ></div>
        </div>
      </div>

      {/* 3. 自サーブ時得点率 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-800">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider">自サーブ得点率</span>
          <Zap className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-3xl sm:text-4xl font-black text-amber-600">
            {summary.selfServeWinRate}
          </div>
          <span className="text-lg font-bold text-slate-400">%</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          全 {summary.selfServeCount} 本中
        </div>
      </div>

      {/* 4. 相手サーブ時（レシーブ）得点率 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-800">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider">レシーブ得点率</span>
          <ShieldCheck className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-3xl sm:text-4xl font-black text-blue-600">
            {summary.oppServeWinRate}
          </div>
          <span className="text-lg font-bold text-slate-400">%</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          全 {summary.oppServeCount} 本中
        </div>
      </div>

      {/* 5. ミス・失点要因率 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-800 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider">ミス発生率</span>
          <AlertTriangle className="w-4 h-4 text-rose-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-3xl sm:text-4xl font-black text-rose-600">
            {summary.missRate}
          </div>
          <span className="text-lg font-bold text-slate-400">%</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          失点 {summary.lostCount} 本中
        </div>
      </div>
    </div>
  );
};
