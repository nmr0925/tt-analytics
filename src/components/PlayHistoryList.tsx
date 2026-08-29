'use client';

import React from 'react';
import {
  Rally,
  ACTION_CATEGORY_LABELS,
  SERVE_LENGTH_LABELS,
  SERVE_COURSE_LABELS,
  SERVE_SPIN_LABELS,
  RECEIVE_TECHNIQUE_LABELS,
  COURSE_3WAY_LABELS,
  THIRD_BALL_HAND_LABELS,
  THIRD_BALL_TYPE_LABELS,
  RALLY_TYPE_LABELS,
  MISS_TYPE_LABELS,
  getServe8WayLabel,
} from '@/types/table-tennis';
import { Trash2, History, ArrowRight } from 'lucide-react';

interface PlayHistoryListProps {
  rallies: Rally[];
  onDeleteRally: (id: string) => void;
}

export const PlayHistoryList: React.FC<PlayHistoryListProps> = ({
  rallies,
  onDeleteRally,
}) => {
  if (rallies.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-sm shadow-sm">
        まだこの試合のプレー記録はありません。上の入力フォームから登録してください。
      </div>
    );
  }

  // 新しい順に表示
  const sortedRallies = [...rallies].reverse();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
          <History className="w-4 h-4 text-emerald-600" />
          <span>本試合のプレー履歴 ({rallies.length} 件)</span>
        </div>
        <span className="text-xs text-slate-400">直近の入力が先頭</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {sortedRallies.map((r, index) => {
          const isWon = r.result === 'won';
          const rallyNumber = rallies.length - index;

          return (
            <div
              key={r.id}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
            >
              {/* 左側: 番号 & 得失点バッジ */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-5 text-right font-bold">
                  #{rallyNumber}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-black flex items-center gap-1 ${
                    isWon
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-rose-50 text-rose-700 border border-rose-300'
                  }`}
                >
                  {isWon ? '得点' : '失点'}
                </span>

                {/* スコア・サーバー */}
                <div className="text-xs font-mono text-slate-700 font-bold">
                  G{r.gameNumber} ({r.scoreMy}-{r.scoreOpp})
                </div>

                <span className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                  {r.server === 'self' ? '自サーブ' : '相手サーブ'}
                </span>
              </div>

              {/* 中央: 技術・詳細バッジ */}
              <div className="flex-1 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="bg-white text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-300">
                  {ACTION_CATEGORY_LABELS[r.actionCategory] || r.actionCategory}
                </span>

                {/* サーブ情報 (8分割コース名) */}
                {r.serveLength && r.serveCourse && (
                  <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[11px] border border-blue-200">
                    {getServe8WayLabel(r.serveLength, r.serveCourse)}
                  </span>
                )}
                {r.serveSpin && (
                  <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded text-[11px] border border-teal-200 font-medium">
                    {SERVE_SPIN_LABELS[r.serveSpin]}
                  </span>
                )}

                {/* レシーブ情報 */}
                {r.receiveTechnique && (
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[11px] border border-emerald-200 font-medium">
                    {RECEIVE_TECHNIQUE_LABELS[r.receiveTechnique]}
                    {r.receiveCourse && ` → ${COURSE_3WAY_LABELS[r.receiveCourse]}`}
                  </span>
                )}

                {/* 3球目情報 */}
                {r.thirdBallHand && (
                  <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[11px] border border-purple-200 font-medium">
                    {THIRD_BALL_HAND_LABELS[r.thirdBallHand]} / {r.thirdBallType && THIRD_BALL_TYPE_LABELS[r.thirdBallType]}
                    {r.thirdBallTargetCourse && ` (${COURSE_3WAY_LABELS[r.thirdBallTargetCourse]}狙い)`}
                  </span>
                )}

                {/* ラリー情報 */}
                {r.rallyType && (
                  <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] border border-indigo-200 font-medium">
                    {RALLY_TYPE_LABELS[r.rallyType]}
                  </span>
                )}

                {/* ミス要因 */}
                {r.missType && (
                  <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[11px] border border-rose-200 font-bold">
                    {MISS_TYPE_LABELS[r.missType] || r.missType}
                  </span>
                )}
              </div>

              {/* 右側: 削除ボタン */}
              <button
                type="button"
                onClick={() => onDeleteRally(r.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="この記録を削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
