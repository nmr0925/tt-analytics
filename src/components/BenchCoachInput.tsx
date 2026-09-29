'use client';

import React, { useState } from 'react';
import {
  Rally,
  PointResult,
  ServerType,
  ServeCourse,
  ServeLength,
  ReceiveTechnique,
  ThirdBallType,
  RallyType,
  MissType,
  InitiativeType,
} from '@/types/table-tennis';
import {
  Zap,
  Shield,
  Flame,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FastForward,
  Clock,
  ArrowRight,
  Play,
} from 'lucide-react';

interface BenchCoachInputProps {
  matchId: string;
  gameNumber: number;
  scoreMy: number;
  scoreOpp: number;
  defaultServer: ServerType;
  onSaveRally: (rally: Rally) => void;
  onUndo: () => void;
  canUndo: boolean;
  onGoToBenchAnalysis?: () => void;
}

export const BenchCoachInput: React.FC<BenchCoachInputProps> = ({
  matchId,
  gameNumber,
  scoreMy,
  scoreOpp,
  defaultServer,
  onSaveRally,
  onUndo,
  canUndo,
  onGoToBenchAnalysis,
}) => {
  const [selectedResult, setSelectedResult] = useState<PointResult>('won');
  const [showOptionalDetail, setShowOptionalDetail] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('unknown');
  const [selectedInitiative, setSelectedInitiative] = useState<InitiativeType>('unknown');

  // クイック保存処理
  const handleQuickSave = (
    actionDetail: string,
    actionCategory: Rally['actionCategory'],
    initiative: InitiativeType = 'unknown',
    extra: Partial<Rally> = {}
  ) => {
    const isWon = selectedResult === 'won';

    // コース指定が選択されていれば適用
    let sCourse: ServeCourse | undefined = extra.serveCourse;
    let sLen: ServeLength | undefined = extra.serveLength;

    if (selectedCourse !== 'unknown') {
      if (selectedCourse === 'fore_short') { sCourse = 'fore'; sLen = 'short'; }
      else if (selectedCourse === 'back_short') { sCourse = 'back'; sLen = 'short'; }
      else if (selectedCourse === 'middle_short') { sCourse = 'fore_middle'; sLen = 'short'; }
      else if (selectedCourse === 'fore_long') { sCourse = 'fore'; sLen = 'long'; }
      else if (selectedCourse === 'back_long') { sCourse = 'back'; sLen = 'long'; }
      else if (selectedCourse === 'middle_long') { sCourse = 'back_middle'; sLen = 'long'; }
    }

    const rally: Rally = {
      id: `rally-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      matchId,
      gameNumber,
      scoreMy,
      scoreOpp,
      result: selectedResult,
      server: defaultServer,
      actionCategory,
      serveCourse: sCourse,
      serveLength: sLen,
      initiative: selectedInitiative !== 'unknown' ? selectedInitiative : initiative,
      benchActionDetail: actionDetail,
      createdAt: new Date().toISOString(),
      ...extra,
    };

    onSaveRally(rally);

    // リセット
    setSelectedCourse('unknown');
    setSelectedInitiative('unknown');
    setShowOptionalDetail(false);
  };

  // 不明・スキップで即時保存
  const handleSaveUnknown = () => {
    handleQuickSave(
      selectedResult === 'won' ? '相手の凡ミス・得点' : '失点・不明',
      selectedResult === 'won' ? 'rally' : 'rally',
      'unknown'
    );
  };

  return (
    <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-md space-y-4 sm:space-y-5 text-slate-800 animate-in fade-in duration-150">
      {/* 1. モードバッジ ＆ スコア表示 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-slate-900">ベンチコーチ入力</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                高速1タップ
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              サーバー: <strong className="text-slate-700">{defaultServer === 'self' ? '自分サーブ' : '相手サーブ'}</strong>（自動判定）
            </div>
          </div>
        </div>

        {/* 1手戻す & 1分間アドバイスボタン */}
        <div className="flex items-center gap-2">
          {onGoToBenchAnalysis && (
            <button
              type="button"
              onClick={onGoToBenchAnalysis}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition-all active:scale-95"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>⏱️ アドバイス</span>
            </button>
          )}

          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 font-bold px-2.5 py-1.5 rounded-xl text-xs transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>1手戻す</span>
          </button>
        </div>
      </div>

      {/* 2. 結果選択（得点 vs 失点） */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedResult('won')}
          className={`py-3.5 px-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
            selectedResult === 'won'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-4 ring-emerald-200 shadow-emerald-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>得点 (自分 Point)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedResult('lost')}
          className={`py-3.5 px-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
            selectedResult === 'lost'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white ring-4 ring-rose-200 shadow-rose-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
          }`}
        >
          <XCircle className="w-5 h-5" />
          <span>失点 (相手 Point)</span>
        </button>
      </div>

      {/* 3. ワンタップ行動選択ボタン群 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>{selectedResult === 'won' ? '何で得点したか？（タップで即記録）' : '何で失点したか？（タップで即記録）'}</span>
          <button
            type="button"
            onClick={handleSaveUnknown}
            className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>見逃した・不明で次へ</span>
          </button>
        </div>

        {/* 得点時のアクションリスト */}
        {selectedResult === 'won' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* 1. サービスエース */}
            <button
              type="button"
              onClick={() => handleQuickSave('自分のサービスエース', 'serve', 'self_attack')}
              className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">⚡</span>
                <span className="text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded">自サーブ</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-emerald-900 group-hover:text-emerald-700">サービスエース</div>
                <div className="text-[10px] text-emerald-600 font-medium">レシーブミス誘発</div>
              </div>
            </button>

            {/* 2. ３球目攻撃 */}
            <button
              type="button"
              onClick={() => handleQuickSave('３球目攻撃での得点', 'third_ball', 'self_attack', { thirdBallType: 'drive' })}
              className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">💥</span>
                <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">先手攻撃</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-blue-900 group-hover:text-blue-700">３球目攻撃</div>
                <div className="text-[10px] text-blue-600 font-medium">フォア/バック強打</div>
              </div>
            </button>

            {/* 3. ツッツキ・ストップ後相手ミス */}
            <button
              type="button"
              onClick={() => handleQuickSave('ツッツキ・ストップ後に相手ミス', 'receive', 'neutral', { receiveTechnique: 'push' })}
              className="p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">🛡️</span>
                <span className="text-[10px] font-black bg-teal-600 text-white px-1.5 py-0.5 rounded">台上・崩し</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-teal-900 group-hover:text-teal-700">ツッツキ・ストップ</div>
                <div className="text-[10px] text-teal-600 font-medium">相手の返球ミス</div>
              </div>
            </button>

            {/* 4. レシーブ攻撃 (チキータ/フリック) */}
            <button
              type="button"
              onClick={() => handleQuickSave('レシーブ攻撃 (チキータ/フリック) での得点', 'receive', 'self_attack', { receiveTechnique: 'chiquita' })}
              className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">🚀</span>
                <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded">先手レシーブ</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-indigo-900 group-hover:text-indigo-700">チキータ・フリック</div>
                <div className="text-[10px] text-indigo-600 font-medium">レシーブから先手</div>
              </div>
            </button>

            {/* 5. ラリー戦 */}
            <button
              type="button"
              onClick={() => handleQuickSave('ラリー戦での得点', 'rally', 'neutral', { rallyType: 'attack' })}
              className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">🔄</span>
                <span className="text-[10px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded">ラリー</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-purple-900 group-hover:text-purple-700">ラリーで打ち勝ち</div>
                <div className="text-[10px] text-purple-600 font-medium">引き合い・ブロック</div>
              </div>
            </button>

            {/* 6. 相手の凡ミス */}
            <button
              type="button"
              onClick={() => handleQuickSave('相手の凡ミス', 'rally', 'neutral')}
              className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">🎁</span>
                <span className="text-[10px] font-black bg-amber-600 text-white px-1.5 py-0.5 rounded">イージー</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-amber-900 group-hover:text-amber-700">相手の凡ミス</div>
                <div className="text-[10px] text-amber-600 font-medium">自滅・打ちミス</div>
              </div>
            </button>
          </div>
        )}

        {/* 失点時のアクションリスト */}
        {selectedResult === 'lost' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* 1. 相手のサービスエース */}
            <button
              type="button"
              onClick={() => handleQuickSave('相手のサービスエース', 'receive', 'opp_attack', { missType: 'no_touch' })}
              className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">⚡</span>
                <span className="text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded">相手サーブ</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-rose-900 group-hover:text-rose-700">相手サービスエース</div>
                <div className="text-[10px] text-rose-600 font-medium">ノータッチ・回転見極め</div>
              </div>
            </button>

            {/* 2. フォア前レシーブミス */}
            <button
              type="button"
              onClick={() => handleQuickSave('フォア前サーブへのレシーブミス', 'receive', 'opp_attack', { serveCourse: 'fore', serveLength: 'short', missType: 'net' })}
              className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">⚠️</span>
                <span className="text-[10px] font-black bg-orange-600 text-white px-1.5 py-0.5 rounded">レシーブ</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-orange-900 group-hover:text-orange-700">フォア前レシーブミス</div>
                <div className="text-[10px] text-orange-600 font-medium">ネット/浮き球</div>
              </div>
            </button>

            {/* 3. バックロングレシーブミス */}
            <button
              type="button"
              onClick={() => handleQuickSave('バックロングサーブへのレシーブミス', 'receive', 'opp_attack', { serveCourse: 'back', serveLength: 'long', missType: 'over' })}
              className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">⚠️</span>
                <span className="text-[10px] font-black bg-orange-600 text-white px-1.5 py-0.5 rounded">レシーブ</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-orange-900 group-hover:text-orange-700">バックロングミス</div>
                <div className="text-[10px] text-orange-600 font-medium">詰まり・オーバー</div>
              </div>
            </button>

            {/* 4. 相手の３球目攻撃で失点 */}
            <button
              type="button"
              onClick={() => handleQuickSave('相手の３球目攻撃', 'receive', 'opp_attack', { missType: 'no_touch' })}
              className="p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 border-2 border-red-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">💥</span>
                <span className="text-[10px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded">相手先手</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-red-900 group-hover:text-red-700">相手の３球目強打</div>
                <div className="text-[10px] text-red-600 font-medium">甘い返球を叩かれた</div>
              </div>
            </button>

            {/* 5. 3球目・先手攻撃ミス (無理攻め) */}
            <button
              type="button"
              onClick={() => handleQuickSave('無理攻め (先手強打ミス)', 'third_ball', 'self_attack', { missType: 'net' })}
              className="p-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100 border-2 border-pink-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">💥</span>
                <span className="text-[10px] font-black bg-pink-600 text-white px-1.5 py-0.5 rounded">自滅注意</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-pink-900 group-hover:text-pink-700">無理攻め (自爆)</div>
                <div className="text-[10px] text-pink-600 font-medium">3球目・強打ミス</div>
              </div>
            </button>

            {/* 6. 自分のサーブミス */}
            <button
              type="button"
              onClick={() => handleQuickSave('自分のサーブミス', 'serve_miss', 'neutral', { missType: 'net' })}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">❌</span>
                <span className="text-[10px] font-black bg-slate-600 text-white px-1.5 py-0.5 rounded">サーブ</span>
              </div>
              <div className="mt-2">
                <div className="font-black text-sm text-slate-900 group-hover:text-slate-700">サーブミス</div>
                <div className="text-[10px] text-slate-500 font-medium">ネット/オーバー</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 4. オプション: コースや先手詳細を追加したい場合 (折りたたみ) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowOptionalDetail(!showOptionalDetail)}
          className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 transition-colors"
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showOptionalDetail ? 'rotate-90' : ''}`} />
          <span>{showOptionalDetail ? '詳細オプションを閉じる' : '+ コース・先手を指定して記録する (任意)'}</span>
        </button>

        {showOptionalDetail && (
          <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in">
            {/* コース選択 */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">サーブ / レシーブコース</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
                {[
                  { id: 'fore_short', label: 'フォア前' },
                  { id: 'middle_short', label: 'ミドル前' },
                  { id: 'back_short', label: 'バック前' },
                  { id: 'fore_long', label: 'フォアロング' },
                  { id: 'middle_long', label: 'ミドルロング' },
                  { id: 'back_long', label: 'バックロング' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCourse(selectedCourse === c.id ? 'unknown' : c.id)}
                    className={`py-1.5 px-2 rounded-xl font-bold transition-all text-center ${
                      selectedCourse === c.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 先手主導権 */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">先手・主導権</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedInitiative('self_attack')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition-all text-center ${
                    selectedInitiative === 'self_attack'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  自発先手攻撃
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInitiative('opp_attack')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition-all text-center ${
                    selectedInitiative === 'opp_attack'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  相手先手被弾
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInitiative('neutral')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition-all text-center ${
                    selectedInitiative === 'neutral'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  互角ラリー
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
