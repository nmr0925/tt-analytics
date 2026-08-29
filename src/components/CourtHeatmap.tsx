'use client';

import React, { useState } from 'react';
import { TableTennisCourt } from './TableTennisCourt';
import { AnalyticsSummary } from '@/lib/analytics';
import { LayoutGrid, Flame } from 'lucide-react';

interface CourtHeatmapProps {
  summary: AnalyticsSummary;
}

export const CourtHeatmap: React.FC<CourtHeatmapProps> = ({ summary }) => {
  const [activeTab, setActiveTab] = useState<'serve' | 'third_ball'>('serve');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800">
      {/* ヘッダー & タブ */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
          <Flame className="w-4 h-4 text-amber-600" />
          <span>コース別得点率ヒートマップ (Court Heatmap)</span>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('serve')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'serve'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            サーブ配球ヒートマップ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('third_ball')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'third_ball'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ３球目攻撃コースヒートマップ
          </button>
        </div>
      </div>

      {/* 説明 */}
      <div className="text-xs text-slate-500 mb-4 text-center">
        {activeTab === 'serve' ? (
          <span>
            各エリア内の数値は <strong className="text-emerald-700">得点率 % (打球数)</strong> を示します。緑=高得点率、赤=低得点率。
          </span>
        ) : (
          <span>
            自分が打った3球目のコース別の得点率です。どのコースを攻めた時に得点できているかが分かります。
          </span>
        )}
      </div>

      {/* 卓球台マップ表示 */}
      <div className="flex justify-center">
        {activeTab === 'serve' ? (
          <TableTennisCourt
            mode="heatmap_serve"
            heatmapData={summary.serveHeatmap}
            title="サーブコース・長さ別の得点率分布"
          />
        ) : (
          <TableTennisCourt
            mode="heatmap_3way"
            heatmapData={summary.thirdBallTargetHeatmap}
            title="３球目攻撃のコース別得点率"
          />
        )}
      </div>
    </div>
  );
};
