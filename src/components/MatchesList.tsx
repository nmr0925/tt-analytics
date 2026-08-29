'use client';

import React from 'react';
import {
  Match,
  MATCH_TYPE_LABELS,
  OPPONENT_HAND_LABELS,
  OPPONENT_STYLE_LABELS,
  RUBBER_LABELS,
} from '@/types/table-tennis';
import { Trophy, Calendar, User, Edit3, Trash2, PlayCircle, PlusCircle, CheckCircle2 } from 'lucide-react';

interface MatchesListProps {
  matches: Match[];
  activeMatchId: string | null;
  onSelectActiveMatch: (id: string) => void;
  onEditMatch: (match: Match) => void;
  onDeleteMatch: (id: string) => void;
  onNewMatchClick: () => void;
}

export const MatchesList: React.FC<MatchesListProps> = ({
  matches,
  activeMatchId,
  onSelectActiveMatch,
  onEditMatch,
  onDeleteMatch,
  onNewMatchClick,
}) => {
  return (
    <div className="space-y-4 text-slate-800">
      {/* 上部バー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>登録済みの試合一覧 ({matches.length} 試合)</span>
          </h2>
          <p className="text-xs text-slate-500">
            プレーを入力したい試合を選択（アクティブ化）してください
          </p>
        </div>
        <button
          type="button"
          onClick={onNewMatchClick}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>新しい試合を追加</span>
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <p className="text-slate-500 text-sm">登録されている試合がありません</p>
          <button
            type="button"
            onClick={onNewMatchClick}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            最初の試合を作成する
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m) => {
            const isActive = activeMatchId === m.id;

            return (
              <div
                key={m.id}
                className={`rounded-2xl p-4 sm:p-5 border transition-all relative ${
                  isActive
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* アクティブバッジ */}
                {isActive && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    入力中 (Active)
                  </div>
                )}

                {/* 日付・大会 */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {m.date}
                  </span>
                  <span>•</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                    {MATCH_TYPE_LABELS[m.matchType]}
                  </span>
                  {m.tournamentName && (
                    <span className="text-slate-800 font-bold truncate max-w-[140px]">
                      {m.tournamentName}
                    </span>
                  )}
                </div>

                {/* 対戦相手情報 */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-base font-black text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>vs {m.opponentName || '（相手氏名未登録）'}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                      {OPPONENT_STYLE_LABELS[m.opponentStyle]}
                    </span>
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                      {OPPONENT_HAND_LABELS[m.opponentHand]}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                      F:{RUBBER_LABELS[m.opponentRubberFore]} / B:{RUBBER_LABELS[m.opponentRubberBack]}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                      {m.gameFormat}ゲーム制
                    </span>
                  </div>
                </div>

                {/* メモ */}
                {m.notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 my-2">
                    💡 {m.notes}
                  </div>
                )}

                {/* ボトム操作ボタン */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => onSelectActiveMatch(m.id)}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      この試合を入力する
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      現在選択中の試合
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditMatch(m)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="試合情報を編集"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('この試合と紐づくすべてのプレー記録を削除しますか？')) {
                          onDeleteMatch(m.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="試合を削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
