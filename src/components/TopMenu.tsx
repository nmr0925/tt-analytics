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
  ArrowRight
} from 'lucide-react';

interface TopMenuProps {
  onStartNewMatch: () => void;
  onGoToAnalysis: () => void;
  onGoToMatches: () => void;
  onGoToDataManagement: () => void;
  onSelectRecentMatch: (matchId: string) => void;
  recentMatches: Match[];
  totalRalliesCount: number;
}

export const TopMenu: React.FC<TopMenuProps> = ({
  onStartNewMatch,
  onGoToAnalysis,
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
        {/* 背景の装飾光・円 */}
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
              1球ごとのサーブ・レシーブ・コース・ミス要因を高速記録。<br className="hidden sm:inline" />
              クラウドデータベースと連動し、相手戦型別の弱点や強みを徹底分析します。
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-right">
            <span className="text-[11px] text-emerald-200 font-medium">登録済み総プレー数</span>
            <span className="text-2xl font-black text-white">{totalRalliesCount} <span className="text-xs font-normal">球</span></span>
          </div>
        </div>
      </div>

      {/* 2. メインメニュー（2大メニュー：試合入力 ＆ 分析） */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>メインメニュー</span>
          <span className="text-[11px] font-normal text-slate-400">タップして開始</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* メニュー 1: 試合入力 */}
          <button
            type="button"
            onClick={onStartNewMatch}
            className="group relative bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 sm:p-7 text-left shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-[0.98] flex flex-col justify-between min-h-[180px] sm:min-h-[220px]"
          >
            <div className="flex items-start justify-between w-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                <PlusCircle className="w-3 h-3" />
                新規試合開始
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                <span>試合入力</span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                未入力のクリーンな状態で新しい試合を開始。<br />
                得失点、コース、回転を0秒でサクサク記録します。
              </p>
            </div>
          </button>

          {/* メニュー 2: 分析 */}
          <button
            type="button"
            onClick={onGoToAnalysis}
            className="group relative bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-500 rounded-3xl p-6 sm:p-7 text-left shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-[0.98] flex flex-col justify-between min-h-[180px] sm:min-h-[220px]"
          >
            <div className="flex items-start justify-between w-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                <Award className="w-3 h-3" />
                戦術・傾向
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <span>分析</span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                相手戦型別の勝率、サーブ8分割ヒートマップ、<br />
                レシーブ技術やミスの詳細要因をグラフ集計。
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. サブ機能 / 最近の試合・データ管理 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* 直近の試合の続き・履歴 */}
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
