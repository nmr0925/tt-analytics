'use client';

import React from 'react';
import { ServeLength, ServeCourse, Course3Way, OpponentHand, PlayerHand } from '@/types/table-tennis';

interface TableTennisCourtProps {
  mode: 'serve_select' | 'receive_serve_select' | 'course_3way_select' | 'heatmap_serve' | 'heatmap_3way';
  selectedLength?: ServeLength;
  selectedCourse?: ServeCourse;
  selectedCourse3Way?: Course3Way;
  onSelectServe?: (length: ServeLength, course: ServeCourse) => void;
  onSelect3Way?: (course: Course3Way) => void;
  heatmapData?: Record<string, { total: number; won: number; winRate: number }>;
  title?: string;
  opponentHand?: OpponentHand; // 相手の利き腕 (right / left)
  myHand?: PlayerHand;         // 自分の利き腕 (right / left)
}

export const TableTennisCourt: React.FC<TableTennisCourtProps> = ({
  mode,
  selectedLength,
  selectedCourse,
  selectedCourse3Way,
  onSelectServe,
  onSelect3Way,
  heatmapData,
  title,
  opponentHand = 'right',
  myHand = 'right',
}) => {
  const isReceiveMode = mode === 'receive_serve_select';

  // コース列の配置:
  // 1. レシーブ時 (自分コート視点、ネットが上、自分エンドラインが下):
  //    - 自分が右利き: 左側がバック、右側がフォア -> ['back', 'back_middle', 'fore_middle', 'fore']
  //    - 自分が左利き: 左側がフォア、右側がバック -> ['fore', 'fore_middle', 'back_middle', 'back']
  // 2. サーブ時 (相手コート視点、相手エンドラインが上、ネットが下):
  //    - 相手が右利き: 左側が相手フォア、右側が相手バック -> ['fore', 'fore_middle', 'back_middle', 'back']
  //    - 相手が左利き: 左側が相手バック、右側が相手フォア -> ['back', 'back_middle', 'fore_middle', 'fore']
  const courses: ServeCourse[] = isReceiveMode
    ? (myHand === 'left'
        ? ['fore', 'fore_middle', 'back_middle', 'back']
        : ['back', 'back_middle', 'fore_middle', 'fore'])
    : (opponentHand === 'left'
        ? ['back', 'back_middle', 'fore_middle', 'fore']
        : ['fore', 'fore_middle', 'back_middle', 'back']);

  const courses3Way: Course3Way[] = opponentHand === 'left'
    ? ['back', 'middle', 'fore']
    : ['fore', 'middle', 'back'];

  const course8WayLabels: Record<string, string> = {
    'long_fore': 'フォア\nロング',
    'long_fore_middle': 'フォアミドル\nロング',
    'long_back_middle': 'バックミドル\nロング',
    'long_back': 'バック\nロング',
    'short_fore': 'フォア\n前',
    'short_fore_middle': 'フォアミドル\n前',
    'short_back_middle': 'バックミドル\n前',
    'short_back': 'バック\n前',
  };

  const course3WayLabels: Record<Course3Way, string> = {
    fore: '相手フォア',
    middle: '相手ミドル',
    back: '相手バック',
  };

  // ヒートマップの背景色を計算 (勝率 0% -> 赤, 50% -> 黄, 100% -> 緑)
  const getHeatmapBg = (winRate: number, total: number) => {
    if (total === 0) return 'bg-slate-800/60 border-slate-700 text-slate-400';
    if (winRate >= 70) return 'bg-emerald-600/90 border-emerald-400 text-white';
    if (winRate >= 50) return 'bg-teal-600/80 border-teal-400 text-white';
    if (winRate >= 40) return 'bg-amber-600/80 border-amber-400 text-white';
    return 'bg-rose-600/90 border-rose-400 text-white';
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
      {title && (
        <div className="text-center font-bold text-slate-800 text-xs sm:text-sm mb-2 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {title}
          <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200 font-normal">
            {isReceiveMode 
              ? `自分: ${myHand === 'left' ? '左利き' : '右利き'}視点 (自コート)`
              : `相手: ${opponentHand === 'left' ? '左利き' : '右利き'}視点 (相手コート)`}
          </span>
        </div>
      )}

      {/* 卓球台の外観 */}
      <div className="relative bg-blue-900 border-2 sm:border-4 border-slate-300 rounded-xl p-1.5 sm:p-2.5 shadow-inner overflow-hidden">
        
        {/* ---------------------------------------------------- */}
        {/* レシーブ時: 上部に「NET 相手側」、下部に「自分コート奥」 */}
        {/* ---------------------------------------------------- */}
        {isReceiveMode ? (
          <>
            {/* 上部: ネット (相手側) */}
            <div className="relative my-1 py-1 flex items-center justify-center">
              <div className="w-full border-t-2 border-dashed border-white/90"></div>
              <span className="absolute bg-white text-rose-800 text-[9px] font-extrabold px-3 py-0.5 rounded-full border border-slate-300 shadow-sm">
                ▲ NET (相手側) ▲
              </span>
            </div>

            {/* 8分割: 上段が「前 (ショート)」、下段が「ロング」 */}
            <div className="space-y-1.5 my-2">
              {/* 上段: 前 (ショート) */}
              <div className="grid grid-cols-4 gap-1.5">
                {courses.map((crs) => {
                  const len: ServeLength = 'short';
                  const key = `${len}_${crs}`;
                  const isSelected = selectedLength === len && selectedCourse === crs;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onSelectServe && onSelectServe(len, crs)}
                      className={`h-16 sm:h-20 rounded-lg transition-all flex flex-col items-center justify-center p-1 border text-center ${
                        isSelected
                          ? 'bg-rose-500 text-white font-black border-white shadow-xl ring-2 ring-rose-300 scale-102 z-10'
                          : 'bg-blue-900/70 hover:bg-blue-800 text-blue-100 border-blue-700/60 active:scale-95'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-black leading-tight whitespace-pre-line">
                        {course8WayLabels[key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 下段: ロング */}
              <div className="grid grid-cols-4 gap-1.5">
                {courses.map((crs) => {
                  const len: ServeLength = 'long';
                  const key = `${len}_${crs}`;
                  const isSelected = selectedLength === len && selectedCourse === crs;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onSelectServe && onSelectServe(len, crs)}
                      className={`h-16 sm:h-20 rounded-lg transition-all flex flex-col items-center justify-center p-1 border text-center ${
                        isSelected
                          ? 'bg-rose-500 text-white font-black border-white shadow-xl ring-2 ring-rose-300 scale-102 z-10'
                          : 'bg-blue-900/70 hover:bg-blue-800 text-blue-100 border-blue-700/60 active:scale-95'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-black leading-tight whitespace-pre-line">
                        {course8WayLabels[key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 下部: 自分コート奥 (エンドライン) */}
            <div className="text-[9px] sm:text-[10px] text-blue-200 font-bold text-center tracking-wider pt-1 flex items-center justify-center gap-1">
              <span>▼ 自分コート奥 (エンドライン) ▼</span>
            </div>
          </>
        ) : (
          /* ---------------------------------------------------- */
          /* 通常モード (サーブ時 / ヒートマップ時: 相手コート視点) */
          /* ---------------------------------------------------- */
          <>
            {/* 相手コート奥（エンドライン） */}
            <div className="text-[9px] sm:text-[10px] text-blue-200 font-bold text-center tracking-wider pb-1 flex items-center justify-center gap-1">
              <span>▲ 相手コート奥（エンドライン） ▲</span>
            </div>

            {/* 8分割 (横4列 × 縦2行: 上段ロング、下段前) */}
            {(mode === 'serve_select' || mode === 'heatmap_serve') && (
              <div className="space-y-1.5">
                {/* 上段: ロング */}
                <div className="grid grid-cols-4 gap-1.5">
                  {courses.map((crs) => {
                    const len: ServeLength = 'long';
                    const key = `${len}_${crs}`;
                    const isSelected = selectedLength === len && selectedCourse === crs;
                    const stats = heatmapData ? heatmapData[key] : null;

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={mode === 'heatmap_serve'}
                        onClick={() => onSelectServe && onSelectServe(len, crs)}
                        className={`h-16 sm:h-20 rounded-lg transition-all flex flex-col items-center justify-center p-1 border text-center ${
                          mode === 'heatmap_serve'
                            ? stats
                              ? getHeatmapBg(stats.winRate, stats.total)
                              : 'bg-blue-900/40 border-blue-800 text-slate-400'
                            : isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black border-white shadow-xl ring-2 ring-emerald-300 scale-102 z-10'
                            : 'bg-blue-900/70 hover:bg-blue-800 text-blue-100 border-blue-700/60 active:scale-95'
                        }`}
                      >
                        <span className="text-[11px] sm:text-xs font-black leading-tight whitespace-pre-line">
                          {course8WayLabels[key]}
                        </span>

                        {/* ヒートマップ統計 */}
                        {mode === 'heatmap_serve' && stats && stats.total > 0 && (
                          <div className="mt-1 text-[10px] sm:text-[11px] font-black">
                            {stats.winRate}% <span className="opacity-75 font-normal">({stats.total})</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 下段: 前 */}
                <div className="grid grid-cols-4 gap-1.5">
                  {courses.map((crs) => {
                    const len: ServeLength = 'short';
                    const key = `${len}_${crs}`;
                    const isSelected = selectedLength === len && selectedCourse === crs;
                    const stats = heatmapData ? heatmapData[key] : null;

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={mode === 'heatmap_serve'}
                        onClick={() => onSelectServe && onSelectServe(len, crs)}
                        className={`h-16 sm:h-20 rounded-lg transition-all flex flex-col items-center justify-center p-1 border text-center ${
                          mode === 'heatmap_serve'
                            ? stats
                              ? getHeatmapBg(stats.winRate, stats.total)
                              : 'bg-blue-900/40 border-blue-800 text-slate-400'
                            : isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black border-white shadow-xl ring-2 ring-emerald-300 scale-102 z-10'
                            : 'bg-blue-900/70 hover:bg-blue-800 text-blue-100 border-blue-700/60 active:scale-95'
                        }`}
                      >
                        <span className="text-[11px] sm:text-xs font-black leading-tight whitespace-pre-line">
                          {course8WayLabels[key]}
                        </span>

                        {/* ヒートマップ統計 */}
                        {mode === 'heatmap_serve' && stats && stats.total > 0 && (
                          <div className="mt-1 text-[10px] sm:text-[11px] font-black">
                            {stats.winRate}% <span className="opacity-75 font-normal">({stats.total})</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3分割 (3球目攻撃・レシーブコース選択) */}
            {(mode === 'course_3way_select' || mode === 'heatmap_3way') && (
              <div className="grid grid-cols-3 gap-2 my-2">
                {courses3Way.map((crs) => {
                  const isSelected = selectedCourse3Way === crs;
                  const stats = heatmapData ? heatmapData[crs] : null;

                  return (
                    <button
                      key={crs}
                      type="button"
                      disabled={mode === 'heatmap_3way'}
                      onClick={() => onSelect3Way && onSelect3Way(crs)}
                      className={`h-24 sm:h-28 rounded-xl transition-all flex flex-col items-center justify-center p-2 border text-center ${
                        mode === 'heatmap_3way'
                          ? stats
                            ? getHeatmapBg(stats.winRate, stats.total)
                            : 'bg-blue-900/40 border-blue-800 text-slate-400'
                          : isSelected
                          ? 'bg-emerald-500 text-slate-950 font-black border-white shadow-xl ring-2 ring-emerald-300 scale-102 z-10'
                          : 'bg-blue-900/70 hover:bg-blue-800 text-blue-100 border-blue-700/60 active:scale-95'
                      }`}
                    >
                      <span className="font-bold text-xs sm:text-sm mb-1">{course3WayLabels[crs]}</span>
                      {mode === 'heatmap_3way' && stats && stats.total > 0 ? (
                        <div className="text-xs font-black">
                          得点率 {stats.winRate}%
                          <div className="text-[10px] font-normal opacity-80">({stats.won} / {stats.total}本)</div>
                        </div>
                      ) : (
                        <span className="text-[10px] opacity-75">タップで選択</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ネット */}
            <div className="relative my-1 py-1 flex items-center justify-center">
              <div className="w-full border-t-2 border-dashed border-white/90"></div>
              <span className="absolute bg-white text-slate-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-300 shadow-sm">
                NET (ネット)
              </span>
            </div>

            {/* 自コート側 */}
            <div className="h-7 bg-blue-950/40 rounded border border-dashed border-blue-400/50 flex items-center justify-center text-blue-200 text-[10px] font-bold">
              ▼ 手前 (自分側) ▼
            </div>
          </>
        )}
      </div>
    </div>
  );
};
