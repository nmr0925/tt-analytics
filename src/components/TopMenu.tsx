'use client';

import React from 'react';
import { Match } from '@/types/table-tennis';
import { 
  Play, 
  BarChart3, 
  PlusCircle, 
  History, 
  Database, 
  ChevronRight, 
  Activity, 
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  Zap,
  Layers,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';

interface TopMenuProps {
  onStartBenchInput: () => void;
  onStartDetailedInput: () => void;
  onGoToBenchAnalysis: () => void;
  onGoToComprehensiveAnalysis: () => void;
  onGoToMatches: () => void;
  onGoToDataManagement: () => void;
  onSelectRecentMatch: (matchId: string) => void;
  recentMatches: Match[];
  totalRalliesCount: number;
}

export const TopMenu: React.FC<TopMenuProps> = ({
  onStartBenchInput,
  onStartDetailedInput,
  onGoToBenchAnalysis,
  onGoToComprehensiveAnalysis,
  onGoToMatches,
  onGoToDataManagement,
  onSelectRecentMatch,
  recentMatches,
  totalRalliesCount,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. ヒーロー / アプリ紹介カード */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>卓球 リアルタイム記録 ＆ 戦術分析</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              TT Analytics
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg leading-relaxed">
              ベンチコーチからの高速入力 ＆ セット間1分アドバイスに完全対応。<br className="hidden sm:inline" />
              1球ごとの詳細記録から卓球台ヒートマップまで多角的に分析します。
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-right">
            <span className="text-[11px] text-emerald-200 font-medium">登録済み総プレー数</span>
            <span className="text-2xl font-black text-white">{totalRalliesCount} <span className="text-xs font-normal">球</span></span>
          </div>
        </div>
      </div>

      {/* 2. 【入力モード】 (ベンチコーチ入力 ＆ 詳細試合入力) */}
      <div className="space-y-3">
        <div className="text-xs font-black text-slate-500 uppercase tracking-wider px-1 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>【入力モード】</span>
          <span className="text-[11px] font-normal text-slate-400">状況に合わせて選択</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* ① ベンチコーチ入力 */}
          <button
            type="button"
            onClick={onStartBenchInput}
            className="group relative bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-amber-500 rounded-3xl p-6 text-left shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all active:scale-[0.98] flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-start justify-between w-full">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full">
                ⚡ 1タップ高速
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  ベンチコーチ入力
                </h2>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                ベンチからリアルタイム高速入力。<br />
                <strong>回転入力なし</strong>・<strong>不明スキップ対応</strong>でセット間1分アドバイスに直結！
              </p>
            </div>
          </button>

          {/* ② 詳細試合入力 */}
          <button
            type="button"
            onClick={onStartDetailedInput}
            className="group relative bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 text-left shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-[0.98] flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-start justify-between w-full">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                📝 完全詳細記録
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  詳細試合入力
                </h2>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                サーブ回転・8分割コース・3球目打法・ラリー展開まで1球ずつ精密に記録します。
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. 【分析モード】 (ベンチコーチ分析 ＆ 総合分析) */}
      <div className="space-y-3">
        <div className="text-xs font-black text-slate-500 uppercase tracking-wider px-1 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>【分析モード】</span>
          <span className="text-[11px] font-normal text-slate-400">目的に合わせて選択</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* ① ベンチコーチ分析 */}
          <button
            type="button"
            onClick={onGoToBenchAnalysis}
            className="group relative bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-amber-500 rounded-3xl p-6 text-left shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all active:scale-[0.98] flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-start justify-between w-full">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full">
                ⏱️ 1分間アドバイス
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  ベンチコーチ分析
                </h2>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                直前セットの効いている行動・失点原因・先手得点率・全得失点内訳・勝負サーブを即座に提示！
              </p>
            </div>
          </button>

          {/* ② 総合分析 */}
          <button
            type="button"
            onClick={onGoToComprehensiveAnalysis}
            className="group relative bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-500 rounded-3xl p-6 text-left shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-[0.98] flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-start justify-between w-full">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                📊 総合・多角集計
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  総合分析
                </h2>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                卓球台9分割ヒートマップ、相手戦型別勝率、技術別得失点一覧、ミス要因円グラフを徹底分析。
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. サブ機能 / 最近の試合・データ管理 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* 直近の試合 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800">
              <History className="w-4 h-4 text-emerald-600" />
              <span>最近の試合</span>
            </div>
            <button
              type="button"
              onClick={onGoToMatches}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
            >
              <span>すべて見る</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentMatches.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              登録された試合はまだありません
            </p>
          ) : (
            <div className="space-y-2">
              {recentMatches.slice(0, 3).map((match) => (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => onSelectRecentMatch(match.id)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 truncate">
                        {match.opponentName ? `vs ${match.opponentName}` : '対戦相手未設定'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {match.date}・{match.gameFormat}ゲームマッチ
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-emerald-600 font-bold flex items-center gap-0.5">
                    開く
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* データ管理 & バックアップ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 pb-2 border-b border-slate-100">
              <Database className="w-4 h-4 text-blue-600" />
              <span>クラウド同期 ＆ データ管理</span>
            </div>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              端末ローカルの試合データをクラウドDBと手動同期したり、全データのインポート・エクスポートが行えます。
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToDataManagement}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <span>データ管理・同期画面を開く</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
