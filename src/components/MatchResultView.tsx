'use client';

import React from 'react';
import { Match, Rally, OPPONENT_HAND_LABELS, OPPONENT_STYLE_LABELS, isGameFinished } from '@/types/table-tennis';
import {
  Trophy,
  Home,
  BarChart3,
  ListOrdered,
  RotateCcw,
  Swords,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';

interface MatchResultViewProps {
  match: Match;
  rallies: Rally[];
  myGameScore: number;
  oppGameScore: number;
  onGoToHome: () => void;
  onGoToAnalysis: () => void;
  onGoToMatches: () => void;
  onReopenMatch: () => void;
}

export const MatchResultView: React.FC<MatchResultViewProps> = ({
  match,
  rallies,
  myGameScore,
  oppGameScore,
  onGoToHome,
  onGoToAnalysis,
  onGoToMatches,
  onReopenMatch,
}) => {
  const isWon = myGameScore > oppGameScore;

  // 各ゲームごとの詳細スコアを計算
  const gameScores = React.useMemo(() => {
    const map = new Map<number, { my: number; opp: number }>();
    for (const r of rallies) {
      const cur = map.get(r.gameNumber) || { my: 0, opp: 0 };
      if (r.result === 'won') cur.my++;
      else cur.opp++;
      map.set(r.gameNumber, cur);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([gameNum, score]) => ({
        gameNumber: gameNum,
        scoreMy: score.my,
        scoreOpp: score.opp,
        isWon: score.my > score.opp,
      }));
  }, [rallies]);

  // 簡単な統計
  const totalPoints = rallies.length;
  const wonPoints = rallies.filter((r) => r.result === 'won').length;
  const lostPoints = rallies.filter((r) => r.result === 'lost').length;
  const winRate = totalPoints > 0 ? Math.round((wonPoints / totalPoints) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
      {/* 勝利 / 敗北 メインヘッダーカード */}
      <div
        onClick={onGoToHome}
        className={`rounded-3xl p-6 sm:p-8 text-center text-white shadow-xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden ${
          isWon
            ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 shadow-emerald-200'
            : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-slate-300'
        }`}
      >
        {/* 背景装飾 */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* アイコン */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner mx-auto mb-1">
            {isWon ? (
              <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300 animate-bounce" />
            ) : (
              <Award className="w-9 h-9 sm:w-11 sm:h-11 text-slate-300" />
            )}
          </div>

          {/* 結果タイトル (ご要望: 「3-0 勝利」「1-3 敗北」) */}
          <div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm">
              {myGameScore} - {oppGameScore} {isWon ? '勝利' : '敗北'}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white/90 mt-1">
              {isWon ? '🎉 MATCH WON！ 素晴らしい勝利です！' : '🛡️ MATCH FINISHED 試合終了・お疲れ様でした！'}
            </p>
          </div>

          {/* 対戦情報 */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs bg-black/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-white/90">
            <span>vs {match.opponentName || '対戦相手'} 選手</span>
            <span>•</span>
            <span>{match.date}</span>
            {match.tournamentName && (
              <>
                <span>•</span>
                <span>{match.tournamentName}</span>
              </>
            )}
          </div>

          {/* タップして戻るガイド */}
          <div className="pt-2 text-[11px] text-white/80 font-bold animate-pulse">
            👆 ここをタップしてメインメニューに戻る
          </div>
        </div>
      </div>

      {/* メインメニューへ戻る特大ボタン */}
      <button
        type="button"
        onClick={onGoToHome}
        className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-200 border border-emerald-400 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <Home className="w-5 h-5 sm:w-6 sm:h-6" />
        <span>メインメニューに戻る</span>
      </button>

      {/* ゲームごとのスコア内訳カード */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ゲーム別スコア詳細
        </h3>

        <div className="space-y-2">
          {gameScores.map((g) => (
            <div
              key={g.gameNumber}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                g.isWon
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    g.isWon ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  第{g.gameNumber}ゲーム
                </span>
                <span className="text-xs font-semibold">
                  {g.isWon ? '⭕ 獲得' : '❌ 落球'}
                </span>
              </div>

              <div className="text-lg sm:text-xl font-black font-mono tracking-wider">
                <span className={g.isWon ? 'text-emerald-700' : 'text-slate-700'}>
                  {g.scoreMy}
                </span>
                <span className="text-slate-300 mx-2">-</span>
                <span className={!g.isWon ? 'text-blue-700' : 'text-slate-600'}>
                  {g.scoreOpp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 簡易スタッツ */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px]">総プレー数</div>
            <div className="text-base font-black text-slate-800 mt-0.5">{totalPoints}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px]">総得点 / 総失点</div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              <span className="text-emerald-600">{wonPoints}</span> - <span className="text-rose-600">{lostPoints}</span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-slate-400 text-[10px]">得点率</div>
            <div className="text-base font-black text-emerald-600 mt-0.5">{winRate}%</div>
          </div>
        </div>
      </div>

      {/* サブアクションボタングループ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onGoToAnalysis}
          className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>この試合の詳細分析を見る</span>
        </button>

        <button
          type="button"
          onClick={onGoToMatches}
          className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <ListOrdered className="w-4 h-4 text-purple-600" />
          <span>試合一覧を見る</span>
        </button>
      </div>

      {/* 修正・再開ボタン */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onReopenMatch}
          className="text-xs text-slate-400 hover:text-slate-700 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>入力を誤ったため、この試合の記録を再開する（1手戻す）</span>
        </button>
      </div>
    </div>
  );
};
