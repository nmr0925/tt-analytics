'use client';

import React, { useState, useMemo } from 'react';
import {
  AnalyticsSummary,
  TechniqueStatsItem,
} from '@/lib/analytics';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Layers,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';

interface TechniqueBreakdownTableProps {
  summary: AnalyticsSummary;
}

type MainCategory = 'all' | 'serve' | 'receive' | 'third_ball' | 'rally';
type SortOption = 'total_desc' | 'winrate_desc' | 'lossrate_desc';

export const TechniqueBreakdownTable: React.FC<TechniqueBreakdownTableProps> = ({ summary }) => {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('all');
  const [subView, setSubView] = useState<string>('default');
  const [sortBy, setSortBy] = useState<SortOption>('total_desc');

  const { techniqueSummary } = summary;

  // サブビューのリセット
  const handleSelectCategory = (cat: MainCategory) => {
    setSelectedCategory(cat);
    setSubView('default');
  };

  // 表示対象データの抽出
  const currentItems = useMemo<TechniqueStatsItem[]>(() => {
    if (!techniqueSummary) return [];

    let items: TechniqueStatsItem[] = [];

    switch (selectedCategory) {
      case 'all':
        // 全技術の大分類 + 各分野の主要技術を統合
        items = [
          ...techniqueSummary.byCategorySummary,
          ...techniqueSummary.serveBySpin,
          ...techniqueSummary.receiveByTech,
          ...techniqueSummary.thirdBallByType,
          ...techniqueSummary.rallyByType,
        ];
        break;

      case 'serve':
        if (subView === 'course') items = techniqueSummary.serveByCourse;
        else if (subView === 'combo') items = techniqueSummary.serveByCombo;
        else items = techniqueSummary.serveBySpin;
        break;

      case 'receive':
        if (subView === 'course') items = techniqueSummary.receiveByCourse;
        else if (subView === 'combo') items = techniqueSummary.receiveByCombo;
        else items = techniqueSummary.receiveByTech;
        break;

      case 'third_ball':
        if (subView === 'rec_course') items = techniqueSummary.thirdBallByRecCourse;
        else if (subView === 'target_course') items = techniqueSummary.thirdBallByTargetCourse;
        else items = techniqueSummary.thirdBallByType;
        break;

      case 'rally':
        items = techniqueSummary.rallyByType;
        break;
    }

    // ソート処理
    return [...items].sort((a, b) => {
      if (sortBy === 'winrate_desc') {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.total - a.total;
      }
      if (sortBy === 'lossrate_desc') {
        if (b.lossRate !== a.lossRate) return b.lossRate - a.lossRate;
        return b.total - a.total;
      }
      return b.total - a.total; // total_desc
    });
  }, [selectedCategory, subView, sortBy, techniqueSummary]);

  // 最高得点率と最高失点率の技術（インサイト用）
  const topWinningTech = useMemo(() => {
    const valid = currentItems.filter((i) => i.total >= 2);
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => b.winRate - a.winRate)[0];
  }, [currentItems]);

  const topLosingTech = useMemo(() => {
    const valid = currentItems.filter((i) => i.total >= 2 && i.lossRate >= 50);
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => b.lossRate - a.lossRate)[0];
  }, [currentItems]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-5 text-slate-800">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>技術別 得失点率 一覧分析</span>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                詳細統計
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              各サーブ・レシーブ・3球目・ラリーごとの得点率・失点率を一覧比較
            </p>
          </div>
        </div>

        {/* ソートセレクター */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            並び替え:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="total_desc">使用本数が多い順</option>
            <option value="winrate_desc">得点率が高い順 (強み)</option>
            <option value="lossrate_desc">失点率が高い順 (弱点)</option>
          </select>
        </div>
      </div>

      {/* 大分類タブ切り替え */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => handleSelectCategory('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🎯 全技術一覧</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory('serve')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'serve'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🏓 サーブ分析</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory('receive')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'receive'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🛡️ レシーブ分析</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory('third_ball')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'third_ball'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>⚡ ３球目攻撃分析</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectCategory('rally')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'rally'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🔥 ラリー分析</span>
        </button>
      </div>

      {/* サブ分類切り替え（サーブ/レシーブ/3球目選択時） */}
      {selectedCategory === 'serve' && (
        <div className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 font-medium pl-1">切り替え:</span>
          <button
            type="button"
            onClick={() => setSubView('default')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'default' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            回転別
          </button>
          <button
            type="button"
            onClick={() => setSubView('course')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'course' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            コース・長さ別
          </button>
          <button
            type="button"
            onClick={() => setSubView('combo')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'combo' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            コース×回転 詳細
          </button>
        </div>
      )}

      {selectedCategory === 'receive' && (
        <div className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 font-medium pl-1">切り替え:</span>
          <button
            type="button"
            onClick={() => setSubView('default')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'default' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            技術別
          </button>
          <button
            type="button"
            onClick={() => setSubView('course')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'course' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            狙ったコース別
          </button>
          <button
            type="button"
            onClick={() => setSubView('combo')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'combo' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            技術×コース 詳細
          </button>
        </div>
      )}

      {selectedCategory === 'third_ball' && (
        <div className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-400 font-medium pl-1">切り替え:</span>
          <button
            type="button"
            onClick={() => setSubView('default')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'default' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            打法・球種別
          </button>
          <button
            type="button"
            onClick={() => setSubView('rec_course')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'rec_course' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            相手球のコース別
          </button>
          <button
            type="button"
            onClick={() => setSubView('target_course')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              subView === 'target_course' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            自分が狙ったコース別
          </button>
        </div>
      )}

      {/* ワンポイントインサイトバッジ */}
      {(topWinningTech || topLosingTech) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {topWinningTech && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2.5 text-emerald-950">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
                <Flame className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-emerald-700 font-bold">最も得意・高得点率の技術</div>
                <div className="font-black text-sm truncate">
                  {topWinningTech.name}{' '}
                  <span className="text-emerald-700 font-extrabold font-mono">
                    {topWinningTech.winRate}%
                  </span>
                  <span className="text-[11px] font-normal text-emerald-600 ml-1">
                    ({topWinningTech.won}/{topWinningTech.total}本)
                  </span>
                </div>
              </div>
            </div>
          )}

          {topLosingTech && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center gap-2.5 text-rose-950">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-rose-700 font-bold">要改善・失点率が高い技術</div>
                <div className="font-black text-sm truncate">
                  {topLosingTech.name}{' '}
                  <span className="text-rose-700 font-extrabold font-mono">
                    失点率 {topLosingTech.lossRate}%
                  </span>
                  <span className="text-[11px] font-normal text-rose-600 ml-1">
                    ({topLosingTech.lost}/{topLosingTech.total}本)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 技術一覧リスト / テーブル */}
      {currentItems.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
          該当する技術データがありません。試合を記録するとここに自動集計されます。
        </div>
      ) : (
        <div className="space-y-3">
          {/* デスクトップ用テーブルヘッダー */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            <div className="col-span-4">技術名 / 種類</div>
            <div className="col-span-2 text-center">使用本数</div>
            <div className="col-span-2 text-center">得点 / 失点</div>
            <div className="col-span-4 text-center">得失点率 (勝率バー)</div>
          </div>

          {/* 各技術行カード */}
          <div className="space-y-2.5">
            {currentItems.map((item) => {
              const isHighWin = item.winRate >= 60 && item.total >= 2;
              const isHighLoss = item.lossRate >= 60 && item.total >= 2;

              return (
                <div
                  key={item.key}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isHighWin
                      ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                      : isHighLoss
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    {/* 1. 技術名 & サブラベル (col-span-4) */}
                    <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-2">
                      <div className="flex items-center gap-2">
                        {isHighWin && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black text-[10px] shrink-0">
                            強み
                          </span>
                        )}
                        {isHighLoss && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] shrink-0">
                            改善
                          </span>
                        )}
                        <div>
                          <div className="font-black text-sm text-slate-900">{item.name}</div>
                          {item.subLabel && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              {item.subLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* モバイル用 得点率バッジ */}
                      <div className="md:hidden font-mono font-black text-sm">
                        <span className={item.winRate >= 50 ? 'text-emerald-600' : 'text-rose-600'}>
                          {item.winRate}%
                        </span>
                      </div>
                    </div>

                    {/* 2. 使用本数 (col-span-2) */}
                    <div className="md:col-span-2 flex md:justify-center items-center gap-2 text-xs">
                      <span className="md:hidden text-slate-400">使用本数:</span>
                      <span className="font-bold font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                        {item.total} 本
                      </span>
                    </div>

                    {/* 3. 得点 / 失点 (col-span-2) */}
                    <div className="md:col-span-2 flex md:justify-center items-center gap-2 text-xs">
                      <span className="md:hidden text-slate-400">得失点:</span>
                      <div className="font-bold font-mono">
                        <span className="text-emerald-600 font-black">{item.won}得点</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="text-rose-600 font-black">{item.lost}失点</span>
                      </div>
                    </div>

                    {/* 4. 得失点率バー (col-span-4) */}
                    <div className="md:col-span-4 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-emerald-700">得点率: {item.winRate}%</span>
                        <span className="text-rose-700">失点率: {item.lossRate}%</span>
                      </div>

                      {/* 2色ゲージバー */}
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner border border-slate-200">
                        <div
                          style={{ width: `${item.winRate}%` }}
                          className="bg-emerald-500 h-full transition-all duration-500"
                          title={`得点率: ${item.winRate}%`}
                        />
                        <div
                          style={{ width: `${item.lossRate}%` }}
                          className="bg-rose-500 h-full transition-all duration-500"
                          title={`失点率: ${item.lossRate}%`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
