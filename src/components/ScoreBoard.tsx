'use client';

import React from 'react';
import { Match, OPPONENT_HAND_LABELS, OPPONENT_STYLE_LABELS } from '@/types/table-tennis';
import { Undo2, FastForward, CheckCircle2, ChevronRight } from 'lucide-react';

interface ScoreBoardProps {
  match: Match;
  currentGameNumber: number;
  scoreMy: number;
  scoreOpp: number;
  myGameScore: number;
  oppGameScore: number;
  onUndo: () => void;
  onNextGame: () => void;
  onCompleteMatch: () => void;
  canUndo: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  match,
  currentGameNumber,
  scoreMy,
  scoreOpp,
  myGameScore,
  oppGameScore,
  onUndo,
  onNextGame,
  onCompleteMatch,
  canUndo,
}) => {
  const totalPoints = scoreMy + scoreOpp;
  const isDeuce = scoreMy >= 10 && scoreOpp >= 10;
  const isMyServe = isDeuce
    ? totalPoints % 2 === 0
    : Math.floor(totalPoints / 2) % 2 === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3.5 shadow-sm text-slate-800">
      {/* 1行目: スコア & サーバー & Undo をコンパクトに統合 */}
      <div className="flex items-center justify-between gap-2">
        {/* 左: ゲーム番号 & 相手情報 */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-black">
            G{currentGameNumber}
          </span>
          <span className="text-slate-800 font-bold truncate max-w-[100px] sm:max-w-[160px]">
            vs {match.opponentName || '相手'}
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            {OPPONENT_STYLE_LABELS[match.opponentStyle]}
          </span>
        </div>

        {/* 中央: スコアバー (自分 vs 相手) */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 shadow-inner">
          {/* 自分 */}
          <div className="flex items-center gap-1">
            {isMyServe && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
            <span className="text-[11px] text-emerald-700 font-bold">自分</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono ml-0.5">
              {scoreMy}
            </span>
          </div>

          <span className="text-slate-300 font-bold text-sm">-</span>

          {/* 相手 */}
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mr-0.5">
              {scoreOpp}
            </span>
            <span className="text-[11px] text-slate-500 font-bold">相手</span>
            {!isMyServe && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            )}
          </div>

          {/* ゲームカウント */}
          <div className="ml-1 pl-2 border-l border-slate-200 text-[10px] text-slate-500 hidden xs:block">
            (<span className="text-emerald-700 font-bold">{myGameScore}</span> - <span className="text-blue-700 font-bold">{oppGameScore}</span>)
          </div>
        </div>

        {/* 右: 操作ボタン (Undo & 次ゲーム) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              canUndo
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 active:scale-95'
                : 'bg-slate-50 text-slate-300 border border-slate-200 cursor-not-allowed'
            }`}
            title="1手戻す (Undo)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">戻す</span>
          </button>

          <button
            type="button"
            onClick={onNextGame}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all active:scale-95 flex items-center gap-1"
            title="次のゲームへ"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">次ゲーム</span>
          </button>

          <button
            type="button"
            onClick={onCompleteMatch}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-all active:scale-95 flex items-center gap-1"
            title="試合終了"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">終了</span>
          </button>
        </div>
      </div>
    </div>
  );
};
