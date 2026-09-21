'use client';

import React, { useState, useEffect } from 'react';
import {
  Match,
  MatchType,
  OpponentHand,
  OpponentStyle,
  PlayerHand,
  RubberType,
  ServerType,
  MATCH_TYPE_LABELS,
  OPPONENT_HAND_LABELS,
  OPPONENT_STYLE_LABELS,
  RUBBER_LABELS,
} from '@/types/table-tennis';
import { X, Trophy, Swords, Sparkles } from 'lucide-react';

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMatch: (match: Match) => void;
  editingMatch?: Match | null;
}

export const MatchSetupModal: React.FC<MatchSetupModalProps> = ({
  isOpen,
  onClose,
  onSaveMatch,
  editingMatch,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(editingMatch?.date || today);
  const [matchType, setMatchType] = useState<MatchType>(editingMatch?.matchType || 'official');
  const [tournamentName, setTournamentName] = useState<string>(editingMatch?.tournamentName || '');
  const [opponentName, setOpponentName] = useState<string>(editingMatch?.opponentName || '');
  const [myHand, setMyHand] = useState<PlayerHand>(editingMatch?.myHand || 'right');
  const [opponentHand, setOpponentHand] = useState<OpponentHand>(editingMatch?.opponentHand || 'right');
  const [initialServer, setInitialServer] = useState<ServerType>(editingMatch?.initialServer || 'self');
  const [opponentStyle, setOpponentStyle] = useState<OpponentStyle>(editingMatch?.opponentStyle || 'shake_attack');
  const [opponentRubberFore, setOpponentRubberFore] = useState<RubberType>(editingMatch?.opponentRubberFore || 'inverted');
  const [opponentRubberBack, setOpponentRubberBack] = useState<RubberType>(editingMatch?.opponentRubberBack || 'inverted');
  const [gameFormat, setGameFormat] = useState<number>(editingMatch?.gameFormat || 5);
  const [notes, setNotes] = useState<string>(editingMatch?.notes || '');

  useEffect(() => {
    if (isOpen) {
      setDate(editingMatch?.date || today);
      setMatchType(editingMatch?.matchType || 'official');
      setTournamentName(editingMatch?.tournamentName || '');
      setOpponentName(editingMatch?.opponentName || '');
      setMyHand(editingMatch?.myHand || 'right');
      setOpponentHand(editingMatch?.opponentHand || 'right');
      setInitialServer(editingMatch?.initialServer || 'self');
      setOpponentStyle(editingMatch?.opponentStyle || 'shake_attack');
      setOpponentRubberFore(editingMatch?.opponentRubberFore || 'inverted');
      setOpponentRubberBack(editingMatch?.opponentRubberBack || 'inverted');
      setGameFormat(editingMatch?.gameFormat || 5);
      setNotes(editingMatch?.notes || '');
    }
  }, [isOpen, editingMatch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMatch: Match = {
      id: editingMatch?.id || 'match-' + Date.now(),
      date,
      matchType,
      tournamentName: tournamentName.trim() || undefined,
      opponentName: opponentName.trim() || undefined,
      myHand,
      opponentHand,
      initialServer,
      opponentStyle,
      opponentRubberFore,
      opponentRubberBack,
      gameFormat,
      myScoreGames: editingMatch?.myScoreGames || 0,
      oppScoreGames: editingMatch?.oppScoreGames || 0,
      isCompleted: editingMatch?.isCompleted || false,
      notes: notes.trim() || undefined,
      createdAt: editingMatch?.createdAt || new Date().toISOString(),
    };
    onSaveMatch(newMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto pt-3 sm:pt-6 pb-6">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* ヘッダー（固定） */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Swords className="w-4 h-4 sm:w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-slate-900">
                {editingMatch ? '試合情報の編集' : '新規試合の開始・対戦相手登録'}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500">1試合の最初に登録する情報です</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム本体（内部スクロール） */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* 日付 ＆ ゲーム種類 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                日付 (Date) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ゲーム種類 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(MATCH_TYPE_LABELS) as MatchType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMatchType(type)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                      matchType === type
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {MATCH_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 大会名 ＆ 対戦相手名 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                大会名 / イベント名
              </label>
              <input
                type="text"
                placeholder="例: 市民オープン、秋季大会"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                対戦相手名
              </label>
              <input
                type="text"
                placeholder="例: 田中 選手"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* 自分の利き腕 ＆ 相手の利き腕 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                自分の利き腕 <span className="text-emerald-600 font-normal">（コート視点に反映）</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['right', 'left'] as PlayerHand[]).map((hand) => (
                  <button
                    key={hand}
                    type="button"
                    onClick={() => setMyHand(hand)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      myHand === hand
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {hand === 'right' ? '右利き' : '左利き'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                相手の利き腕 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(OPPONENT_HAND_LABELS) as OpponentHand[]).map((hand) => (
                  <button
                    key={hand}
                    type="button"
                    onClick={() => setOpponentHand(hand)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      opponentHand === hand
                        ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {OPPONENT_HAND_LABELS[hand]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 第1ゲームの最初のサーブ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              第1ゲームの最初のサーブ <span className="text-blue-600 font-normal">（ゲーム毎・2点毎に自動交代）</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInitialServer('self')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  initialServer === 'self'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🏓 自分サーブから開始</span>
              </button>
              <button
                type="button"
                onClick={() => setInitialServer('opponent')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  initialServer === 'opponent'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🛡️ 相手サーブから開始</span>
              </button>
            </div>
          </div>

          {/* マッチ形式 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              マッチ形式
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[3, 5, 7].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setGameFormat(fmt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    gameFormat === fmt
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {fmt}ゲーム制
                </button>
              ))}
            </div>
          </div>

          {/* 相手の戦型 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              相手の戦型 (Style) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(OPPONENT_STYLE_LABELS) as OpponentStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setOpponentStyle(style)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                    opponentStyle === style
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {OPPONENT_STYLE_LABELS[style]}
                </button>
              ))}
            </div>
          </div>

          {/* 相手のラバー情報 (フォア面 / バック面) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              相手のラバー情報
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* フォア面 */}
              <div>
                <span className="text-[11px] text-slate-600 block mb-1 font-medium">フォア面ラバー:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(RUBBER_LABELS) as RubberType[]).map((rub) => (
                    <button
                      key={rub}
                      type="button"
                      onClick={() => setOpponentRubberFore(rub)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold border ${
                        opponentRubberFore === rub
                          ? 'bg-teal-600 border-teal-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {RUBBER_LABELS[rub]}
                    </button>
                  ))}
                </div>
              </div>

              {/* バック面 */}
              <div>
                <span className="text-[11px] text-slate-600 block mb-1 font-medium">バック面ラバー:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(RUBBER_LABELS) as RubberType[]).map((rub) => (
                    <button
                      key={rub}
                      type="button"
                      onClick={() => setOpponentRubberBack(rub)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold border ${
                        opponentRubberBack === rub
                          ? 'bg-teal-600 border-teal-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {RUBBER_LABELS[rub]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              メモ・作戦など
            </label>
            <input
              type="text"
              placeholder="例: 相手はフォア前のツッツキに弱い、下回転を多めに集める"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* 送信ボタン */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5 text-emerald-200" />
              <span>{editingMatch ? '試合情報を更新する' : 'この設定で試合を開始する'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
