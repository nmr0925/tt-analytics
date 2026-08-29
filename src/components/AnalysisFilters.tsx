'use client';

import React from 'react';
import {
  Match,
  MATCH_TYPE_LABELS,
  OPPONENT_HAND_LABELS,
  OPPONENT_STYLE_LABELS,
  RECEIVE_TECHNIQUE_LABELS,
  SERVE_SPIN_LABELS,
  SERVE_COURSE_LABELS,
  SERVE_LENGTH_LABELS,
  THIRD_BALL_HAND_LABELS,
  THIRD_BALL_TYPE_LABELS,
  RALLY_TYPE_LABELS,
  MISS_TYPE_LABELS,
  COURSE_3WAY_LABELS,
} from '@/types/table-tennis';
import { AnalyticsFilter } from '@/lib/analytics';
import { Filter, RotateCcw } from 'lucide-react';

interface AnalysisFiltersProps {
  filter: AnalyticsFilter;
  onChangeFilter: (newFilter: AnalyticsFilter) => void;
  matches: Match[];
}

export const AnalysisFilters: React.FC<AnalysisFiltersProps> = ({
  filter,
  onChangeFilter,
  matches,
}) => {
  const update = (patch: Partial<AnalyticsFilter>) => {
    onChangeFilter({ ...filter, ...patch });
  };

  const handleReset = () => {
    onChangeFilter({
      dateFrom: '',
      dateTo: '',
      matchType: 'all',
      opponentStyle: 'all',
      opponentHand: 'all',
      matchId: 'all',
      server: 'all',
      result: 'all',
      actionCategory: 'all',
      serveLength: 'all',
      serveCourse: 'all',
      serveSpin: 'all',
      receiveTechnique: 'all',
      receiveCourse: 'all',
      thirdBallHand: 'all',
      thirdBallReceiveCourse: 'all',
      thirdBallTargetCourse: 'all',
      thirdBallType: 'all',
      rallyType: 'all',
      missType: 'all',
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800 space-y-4">
      {/* ヘッダー & リセット */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>分析条件の絞り込み (Filters)</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          条件リセット
        </button>
      </div>

      {/* 1. 基本・相手条件 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 試合選択 */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            対象の試合
          </label>
          <select
            value={filter.matchId || 'all'}
            onChange={(e) => update({ matchId: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">すべての試合 ({matches.length}件)</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.date} {m.opponentName ? `vs ${m.opponentName}` : ''} ({OPPONENT_STYLE_LABELS[m.opponentStyle]})
              </option>
            ))}
          </select>
        </div>

        {/* 相手の戦型 */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            相手の戦型
          </label>
          <select
            value={filter.opponentStyle || 'all'}
            onChange={(e) => update({ opponentStyle: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">すべての戦型</option>
            {Object.entries(OPPONENT_STYLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* 相手の利き腕 */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            相手の利き腕
          </label>
          <select
            value={filter.opponentHand || 'all'}
            onChange={(e) => update({ opponentHand: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">利き腕：指定なし</option>
            {Object.entries(OPPONENT_HAND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* ゲーム種類 */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            ゲーム種類
          </label>
          <select
            value={filter.matchType || 'all'}
            onChange={(e) => update({ matchType: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">すべてのゲーム種類</option>
            {Object.entries(MATCH_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. 技術大分類 ＆ 状況 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        {/* 技術カテゴリー */}
        <div>
          <label className="block text-[11px] font-bold text-emerald-700 mb-1">
            技術・プレー大分類
          </label>
          <select
            value={filter.actionCategory || 'all'}
            onChange={(e) => update({ actionCategory: e.target.value })}
            className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-2.5 py-2 text-xs text-emerald-900 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="all">すべてのプレー</option>
            <option value="serve">サーブ</option>
            <option value="receive">レシーブ</option>
            <option value="third_ball">３球目攻撃</option>
            <option value="rally">ラリー</option>
          </select>
        </div>

        {/* サーバー */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            サーバー
          </label>
          <select
            value={filter.server || 'all'}
            onChange={(e) => update({ server: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">自分・相手サーブ両方</option>
            <option value="self">自分サーブ時のみ</option>
            <option value="opponent">相手サーブ時のみ</option>
          </select>
        </div>

        {/* 勝敗 */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            結果 (得点 / 失点)
          </label>
          <select
            value={filter.result || 'all'}
            onChange={(e) => update({ result: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">得点・失点両方</option>
            <option value="won">得点のみ</option>
            <option value="lost">失点のみ</option>
          </select>
        </div>
      </div>

      {/* 3. 詳細技術フィルター (選択された大分類または全体から絞り込み) */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
        <span className="text-[11px] font-bold text-teal-700 block">
          詳細技術・コース・ミス種別の深掘り指定
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {/* レシーブ技術 */}
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 font-medium">レシーブ技術</label>
            <select
              value={filter.receiveTechnique || 'all'}
              onChange={(e) => update({ receiveTechnique: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
            >
              <option value="all">全レシーブ</option>
              {Object.entries(RECEIVE_TECHNIQUE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* サーブ回転 */}
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 font-medium">サーブ回転</label>
            <select
              value={filter.serveSpin || 'all'}
              onChange={(e) => update({ serveSpin: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
            >
              <option value="all">全回転</option>
              {Object.entries(SERVE_SPIN_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* サーブ長さ */}
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 font-medium">サーブ長さ</label>
            <select
              value={filter.serveLength || 'all'}
              onChange={(e) => update({ serveLength: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
            >
              <option value="all">全長さ</option>
              {Object.entries(SERVE_LENGTH_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* 3球目攻撃種類 */}
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 font-medium">3球目攻撃種類</label>
            <select
              value={filter.thirdBallType || 'all'}
              onChange={(e) => update({ thirdBallType: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
            >
              <option value="all">全種類</option>
              {Object.entries(THIRD_BALL_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* ラリー展開 */}
          <div>
            <label className="block text-[10px] text-slate-600 mb-1 font-medium">ラリー展開</label>
            <select
              value={filter.rallyType || 'all'}
              onChange={(e) => update({ rallyType: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
            >
              <option value="all">全ラリー</option>
              {Object.entries(RALLY_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* ミス要因 */}
          <div>
            <label className="block text-[10px] text-rose-700 mb-1 font-medium">ミス種別</label>
            <select
              value={filter.missType || 'all'}
              onChange={(e) => update({ missType: e.target.value })}
              className="w-full bg-white border border-rose-300 rounded-lg px-2 py-1.5 text-xs text-rose-800"
            >
              <option value="all">全ミス・指定なし</option>
              {Object.entries(MISS_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
