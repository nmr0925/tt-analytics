'use client';

import React, { useState } from 'react';
import { Rally, Match } from '@/types/table-tennis';
import {
  calculateBenchAnalytics,
  BenchCoachAnalysisSummary,
  SetBenchAnalysis,
} from '@/lib/bench-analytics';
import {
  Zap,
  Flame,
  AlertTriangle,
  Award,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart2,
  RefreshCw,
  Layers,
  ArrowRight,
  Target,
} from 'lucide-react';

interface BenchCoachAnalysisViewProps {
  rallies: Rally[];
  match?: Match | null;
  onGoToInput?: () => void;
}

export const BenchCoachAnalysisView: React.FC<BenchCoachAnalysisViewProps> = ({
  rallies,
  match,
  onGoToInput,
}) => {
  const [selectedSetTab, setSelectedSetTab] = useState<'latest' | 'full' | number>('latest');

  const analysis: BenchCoachAnalysisSummary = React.useMemo(() => {
    return calculateBenchAnalytics(rallies);
  }, [rallies]);

  if (!analysis.hasData) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm text-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm border border-amber-100">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          ベンチコーチ分析データがありません
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          ベンチコーチ入力または詳細試合入力でプレーを記録すると、<br />
          セット間1分間で的確なアドバイスをするためのデータが自動集計されます。
        </p>
        {onGoToInput && (
          <button
            type="button"
            onClick={onGoToInput}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            試合入力を開始する
          </button>
        )}
      </div>
    );
  }

  // 表示対象のセットデータ
  let currentSetData: SetBenchAnalysis = analysis.latestSet || analysis.fullMatch;
  if (selectedSetTab === 'full') {
    currentSetData = analysis.fullMatch;
  } else if (typeof selectedSetTab === 'number' && analysis.bySet[selectedSetTab]) {
    currentSetData = analysis.bySet[selectedSetTab];
  }

  const isLatest = selectedSetTab === 'latest';
  const isFull = selectedSetTab === 'full';

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-800 animate-in fade-in duration-200">
      {/* 1. タイトル & セット切り替えタブ */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  ベンチコーチ分析 (1分間アドバイス)
                </h2>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  セット間専用
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {match ? `${match.date} vs ${match.opponentName || '対戦相手'}` : '直前セット＆試合通算の的確なアドバイス'}
              </p>
            </div>
          </div>

          {onGoToInput && (
            <button
              type="button"
              onClick={onGoToInput}
              className="self-end sm:self-auto inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>入力画面に戻る</span>
            </button>
          )}
        </div>

        {/* セット選択タブ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedSetTab('latest')}
            className={`px-3.5 py-2 rounded-xl font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
              isLatest
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>⏱️ 直前セット (第{analysis.latestSetNumber}セット)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSetTab('full')}
            className={`px-3.5 py-2 rounded-xl font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
              isFull
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📊 試合通算 (全{analysis.totalSets}セット)</span>
          </button>

          {/* 各セット個別ボタン */}
          {Array.from({ length: analysis.totalSets }).map((_, idx) => {
            const setNum = idx + 1;
            const isSelected = selectedSetTab === setNum;
            return (
              <button
                key={setNum}
                type="button"
                onClick={() => setSelectedSetTab(setNum)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                第{setNum}セット
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 【最重要】1分間で選手に伝える3大アドバイス */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4 border border-slate-700 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="font-black text-sm sm:text-base text-white tracking-wide">
              {isFull ? '【試合通算】選手へ伝える要点' : `【第${currentSetData.setNumber}セット】1分間で選手に伝える3大要点`}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {currentSetData.wonPoints}得点 - {currentSetData.lostPoints}失点 (得点率 {currentSetData.winRate}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
          {/* 1. 継続・効いている */}
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>① 効いている・続けるべき行動</span>
            </div>
            <p className="font-black text-emerald-100 text-sm leading-snug">
              {currentSetData.quickAdvice.keep}
            </p>
          </div>

          {/* 2. 修正・失点原因 */}
          <div className="bg-rose-950/60 border border-rose-500/40 p-3.5 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>② やめる・注意すべき失点原因</span>
            </div>
            <p className="font-black text-rose-100 text-sm leading-snug">
              {currentSetData.quickAdvice.stop}
            </p>
          </div>

          {/* 3. 勝負サーブ・仕掛け */}
          <div className="bg-amber-950/60 border border-amber-500/40 p-3.5 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Zap className="w-4 h-4 shrink-0" />
              <span>③ ここぞの勝負手</span>
            </div>
            <p className="font-black text-amber-100 text-sm leading-snug">
              {analysis.clutchServe ? `${analysis.clutchServe.serveName} (通算得点率 ${analysis.clutchServe.winRate}%)` : currentSetData.quickAdvice.clutch}
            </p>
          </div>
        </div>
      </div>

      {/* 3. 序盤 vs 直前セットの変化・相手の対応アラート (複数セットある場合) */}
      {analysis.trendChanges.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-black text-sm pb-2 border-b border-amber-200">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <span>⚠️ 試合序盤と直前セットの変化（相手に対応された行動）</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.trendChanges.map((trend) => (
              <div key={trend.id} className="bg-white border border-amber-200 p-3.5 rounded-2xl space-y-1 text-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">{trend.actionName}</span>
                  <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                    得点率 {trend.rateDiff}% 激減
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] pt-1">
                  <span>序盤: <strong className="text-emerald-600">{trend.earlyWinRate}%</strong> ({trend.earlyWon}/{trend.earlyTotal})</span>
                  <span>→</span>
                  <span>直前: <strong className="text-rose-600">{trend.latestWinRate}%</strong> ({trend.latestWon}/{trend.latestTotal})</span>
                </div>
                <p className="text-[11px] text-amber-900 font-medium leading-relaxed pt-1">
                  {trend.warningMessage}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 得点率が高い行動 vs 失点率が高い行動 (2カラム) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 得点率が高い行動 (効いている) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-black text-sm pb-2 border-b border-slate-100">
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>得点率が高い行動（効いている・続けるべき）</span>
          </div>

          {currentSetData.topWinningActions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              有効な得点パターンがまだ集計されていません
            </p>
          ) : (
            <div className="space-y-2.5">
              {currentSetData.topWinningActions.map((item) => (
                <div
                  key={item.id}
                  className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-sm text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-emerald-700 font-bold">{item.adviceMessage}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-base text-emerald-600">{item.winRate}%</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.won}/{item.total}本</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 失点率が高い行動 (やめる・対処) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-black text-sm pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>失点率が高い行動（やめる・意識して待つ・対処）</span>
          </div>

          {currentSetData.topLosingActions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              顕著な失点パターンはありません（安定しています）
            </p>
          ) : (
            <div className="space-y-2.5">
              {currentSetData.topLosingActions.map((item) => (
                <div
                  key={item.id}
                  className="bg-rose-50/60 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-sm text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-rose-700 font-bold">{item.adviceMessage}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-base text-rose-600">{item.lossRate}%</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.lost}/{item.total}本</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. 先手を取りに行った際の得点率 & 先手を取られた際の得点率 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 自発先手攻撃 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>先手を取りに行った際の得点率 (攻めるべきか？)</span>
            </div>
            <span className="font-mono font-black text-base text-blue-600">
              {currentSetData.selfInitiative.winRate}%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>自発攻撃本数: {currentSetData.selfInitiative.total}本</span>
              <span>{currentSetData.selfInitiative.won}得点 / {currentSetData.selfInitiative.lost}失点</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${currentSetData.selfInitiative.winRate}%` }}
                className="bg-blue-600 h-full transition-all"
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <div className="font-black text-blue-900 text-xs">【判定】{currentSetData.selfInitiative.evaluation}</div>
              <div className="text-[11px] text-blue-700">{currentSetData.selfInitiative.advice}</div>
            </div>
          </div>
        </div>

        {/* 相手先手被攻撃 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-purple-700 font-black text-sm">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>先手を取られた際の得点率 (守備・ブロック力)</span>
            </div>
            <span className="font-mono font-black text-base text-purple-600">
              {currentSetData.oppInitiative.winRate}%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>相手攻撃本数: {currentSetData.oppInitiative.total}本</span>
              <span>{currentSetData.oppInitiative.won}防いで得点 / {currentSetData.oppInitiative.lost}失点</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${currentSetData.oppInitiative.winRate}%` }}
                className="bg-purple-600 h-full transition-all"
              />
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <div className="font-black text-purple-900 text-xs">【判定】{currentSetData.oppInitiative.evaluation}</div>
              <div className="text-[11px] text-purple-700">{currentSetData.oppInitiative.advice}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 自分のミスが多い技術の失敗率 (やめる・入れにいくべき) */}
      {currentSetData.topSkillFailures.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-black text-sm pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>ミスが多い技術の失敗率（やめる・入れにいくべき）</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentSetData.topSkillFailures.map((skill) => (
              <div key={skill.id} className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-2xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">{skill.skillName}</span>
                  <span className="font-mono font-black text-amber-700 text-sm">
                    失敗率 {skill.failureRate}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {skill.totalAttempts}本中 {skill.missCount}本ミス
                </div>
                <p className="text-[11px] text-amber-900 font-medium pt-1">
                  {skill.adviceMessage}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. 全得点の内訳 & 全失点の内訳 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 全得点の内訳 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>全得点の内訳 ({currentSetData.wonPoints}点)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">本数 / 割合</span>
          </div>

          {currentSetData.wonBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">得点データがありません</p>
          ) : (
            <div className="space-y-2 text-xs">
              {currentSetData.wonBreakdown.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800">{item.label}</span>
                    <span className="font-mono text-emerald-600 font-black">{item.count}点 ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%`, backgroundColor: item.categoryColor }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 全失点の内訳 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>全失点の内訳 ({currentSetData.lostPoints}点)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">本数 / 割合</span>
          </div>

          {currentSetData.lostBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">失点データがありません</p>
          ) : (
            <div className="space-y-2 text-xs">
              {currentSetData.lostBreakdown.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-800">{item.label}</span>
                    <span className="font-mono text-rose-600 font-black">{item.count}点 ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%`, backgroundColor: item.categoryColor }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
