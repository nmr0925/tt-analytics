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
  BenchWonReceiveTech,
  BenchWonThirdBallType,
  BenchWonRallyType,
  BenchLostReceiveTech,
  BenchLostPriorReceiveTech,
  BenchLostReceiveQuality,
  BenchLostRallyType,
  BenchCourse,
  BENCH_COURSE_LABELS,
  BENCH_WON_RECEIVE_LABELS,
  BENCH_WON_THIRDBALL_LABELS,
  BENCH_WON_RALLY_LABELS,
  BENCH_LOST_RECEIVE_LABELS,
  BENCH_LOST_RECEIVE_QUALITY_LABELS,
  BENCH_LOST_RALLY_LABELS,
} from '@/types/table-tennis';
import {
  Zap,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  Flame,
  Shield,
  Award,
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

type WonCategory = 'service_ace' | 'receive' | 'third_ball' | 'rally';
type LostCategory = 'service_ace' | 'receive_miss' | 'third_ball_lost' | 'rally';

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
  // 現在の入力ステート
  const [selectedResult, setSelectedResult] = useState<PointResult>('won');
  
  // 得点時のステップ管理
  const [wonCategory, setWonCategory] = useState<WonCategory | null>(null);
  const [wonStep, setWonStep] = useState<'main' | 'receive_tech' | 'course'>('main');
  const [selectedWonReceiveTech, setSelectedWonReceiveTech] = useState<BenchWonReceiveTech | null>(null);

  // 失点時のステップ管理
  const [lostCategory, setLostCategory] = useState<LostCategory | null>(null);
  const [lostStep, setLostStep] = useState<'main' | 'course' | 'receive_tech' | 'receive_hand' | 'prior_tech' | 'quality'>('main');
  const [selectedLostCourse, setSelectedLostCourse] = useState<BenchCourse>('unknown');
  const [selectedLostReceiveTech, setSelectedLostReceiveTech] = useState<BenchLostReceiveTech | null>(null);
  const [selectedLostPriorTech, setSelectedLostPriorTech] = useState<BenchLostPriorReceiveTech | null>(null);

  // リセット
  const resetSelection = (newResult?: PointResult) => {
    if (newResult) setSelectedResult(newResult);
    setWonCategory(null);
    setWonStep('main');
    setSelectedWonReceiveTech(null);
    setLostCategory(null);
    setLostStep('main');
    setSelectedLostCourse('unknown');
    setSelectedLostReceiveTech(null);
    setSelectedLostPriorTech(null);
  };

  // コース文字列から serveCourse, serveLength を抽出するヘルパー
  const parseCourse = (course: BenchCourse): { sCourse?: ServeCourse; sLen?: ServeLength } => {
    if (course === 'fore_short') return { sCourse: 'fore', sLen: 'short' };
    if (course === 'back_short') return { sCourse: 'back', sLen: 'short' };
    if (course === 'middle_short') return { sCourse: 'fore_middle', sLen: 'short' };
    if (course === 'fore_long') return { sCourse: 'fore', sLen: 'long' };
    if (course === 'back_long') return { sCourse: 'back', sLen: 'long' };
    if (course === 'middle_long') return { sCourse: 'back_middle', sLen: 'long' };
    return {};
  };

  // 最終確定・保存ハンドラ
  const commitRally = (
    actionDetail: string,
    actionCategory: Rally['actionCategory'],
    initiative: InitiativeType,
    extra: Partial<Rally> = {}
  ) => {
    const rally: Rally = {
      id: `rally-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      matchId,
      gameNumber,
      scoreMy,
      scoreOpp,
      result: selectedResult,
      server: defaultServer,
      actionCategory,
      initiative,
      benchActionDetail: actionDetail,
      createdAt: new Date().toISOString(),
      ...extra,
    };

    onSaveRally(rally);
    resetSelection();
  };

  // 見逃し・不明スキップ保存
  const handleSaveUnknown = () => {
    const isWon = selectedResult === 'won';
    commitRally(
      isWon ? '得点（詳細不明・見逃し）' : '失点（詳細不明・見逃し）',
      'rally',
      'unknown',
      {
        benchWonCategory: isWon ? 'unknown' : undefined,
        benchLostCategory: !isWon ? 'unknown' : undefined,
      }
    );
  };

  // ===========================================================================
  // 【得点時】各分岐の保存ロジック
  // ===========================================================================

  // 1. 得点 > サービスエース > コース選択
  const handleWonServiceAce = (course: BenchCourse) => {
    const { sCourse, sLen } = parseCourse(course);
    const courseLabel = BENCH_COURSE_LABELS[course];
    commitRally(
      `サービスエース (${courseLabel})`,
      'serve',
      'self_attack',
      {
        serveCourse: sCourse,
        serveLength: sLen,
        benchCourse: course,
        benchWonCategory: 'service_ace',
      }
    );
  };

  // 2. 得点 > レシーブ > コース選択
  const handleWonReceive = (course: BenchCourse) => {
    const tech = selectedWonReceiveTech || 'push';
    const techLabel = BENCH_WON_RECEIVE_LABELS[tech];
    const courseLabel = BENCH_COURSE_LABELS[course];
    const init: InitiativeType = (tech === 'flick' || tech === 'floated_opp_error') ? 'self_attack' : 'neutral';

    commitRally(
      `レシーブ得点 (${techLabel} → ${courseLabel})`,
      'receive',
      init,
      {
        benchCourse: course,
        benchWonCategory: 'receive',
        benchWonReceiveTech: tech,
        receiveTechnique: tech === 'push' ? 'push' : tech === 'stop' ? 'stop' : tech === 'flick' ? 'flick' : tech === 'sink' ? 'sink' : undefined,
      }
    );
  };

  // 3. 得点 > ３球目攻撃
  const handleWonThirdBall = (type: BenchWonThirdBallType) => {
    const typeLabel = BENCH_WON_THIRDBALL_LABELS[type];
    commitRally(
      `３球目攻撃 (${typeLabel})`,
      'third_ball',
      'self_attack',
      {
        benchWonCategory: 'third_ball',
        benchWonThirdBallType: type,
        thirdBallType: type === 'chance_from_serve' ? 'smash' : 'drive',
      }
    );
  };

  // 4. 得点 > ラリー
  const handleWonRally = (type: BenchWonRallyType) => {
    const typeLabel = BENCH_WON_RALLY_LABELS[type];
    const init: InitiativeType = type === 'out_attack' ? 'self_attack' : type === 'out_defend' ? 'opp_attack' : 'neutral';
    commitRally(
      `ラリー得点 (${typeLabel})`,
      'rally',
      init,
      {
        benchWonCategory: 'rally',
        benchWonRallyType: type,
        rallyType: type === 'out_attack' ? 'attack' : type === 'out_defend' ? 'block' : 'on_table',
      }
    );
  };

  // ===========================================================================
  // 【失点時】各分岐の保存ロジック
  // ===========================================================================

  // 1. 失点 > 相手サービスエース > コース選択
  const handleLostServiceAce = (course: BenchCourse) => {
    const { sCourse, sLen } = parseCourse(course);
    const courseLabel = BENCH_COURSE_LABELS[course];
    commitRally(
      `相手サービスエース (${courseLabel})`,
      'receive',
      'opp_attack',
      {
        serveCourse: sCourse,
        serveLength: sLen,
        benchCourse: course,
        benchLostCategory: 'service_ace',
        missType: 'no_touch',
      }
    );
  };

  // 2. 失点 > レシーブミス > コース & 技術 & ハンド選択
  const handleLostReceiveMiss = (hand: 'fore' | 'back') => {
    const tech = selectedLostReceiveTech || 'push';
    const techLabel = BENCH_LOST_RECEIVE_LABELS[tech];
    const courseLabel = BENCH_COURSE_LABELS[selectedLostCourse];
    const handLabel = hand === 'fore' ? 'フォア' : 'バック';
    const { sCourse, sLen } = parseCourse(selectedLostCourse);

    commitRally(
      `レシーブミス (${courseLabel}への${handLabel}${techLabel})`,
      'receive',
      'opp_attack',
      {
        serveCourse: sCourse,
        serveLength: sLen,
        benchCourse: selectedLostCourse,
        benchLostCategory: 'receive_miss',
        benchLostReceiveTech: tech,
        benchLostReceiveHand: hand,
        missType: tech === 'drive' || tech === 'smash' ? 'over' : 'net',
      }
    );
  };

  // 3. 失点 > 相手３球目攻撃 > 直前レシーブ & 質選択
  const handleLostThirdBall = (quality: BenchLostReceiveQuality) => {
    const priorTech = selectedLostPriorTech || 'push';
    const priorLabel = BENCH_LOST_RECEIVE_LABELS[priorTech as BenchLostReceiveTech] || 'ツッツキ';
    const qualityLabel = BENCH_LOST_RECEIVE_QUALITY_LABELS[quality];

    commitRally(
      `相手３球目攻撃 (${priorLabel}後 / ${qualityLabel})`,
      'receive',
      'opp_attack',
      {
        benchLostCategory: 'third_ball_lost',
        benchLostPriorReceiveTech: priorTech,
        benchLostReceiveQuality: quality,
        missType: quality === 'floated_chance' ? 'no_touch' : 'net',
      }
    );
  };

  // 4. 失点 > ラリー
  const handleLostRally = (type: BenchLostRallyType) => {
    const typeLabel = BENCH_LOST_RALLY_LABELS[type];
    const init: InitiativeType = type === 'out_attack_lost' ? 'self_attack' : type === 'out_defend_lost' ? 'opp_attack' : 'neutral';
    commitRally(
      `ラリー失点 (${typeLabel})`,
      'rally',
      init,
      {
        benchLostCategory: 'rally',
        benchLostRallyType: type,
        missType: type === 'self_chance_miss' ? 'over' : 'net',
      }
    );
  };

  // ===========================================================================
  // コース選択ボタン一覧 (再利用)
  // ===========================================================================
  const courseOptions: { id: BenchCourse; label: string }[] = [
    { id: 'fore_short', label: 'フォア前' },
    { id: 'middle_short', label: 'ミドル前' },
    { id: 'back_short', label: 'バック前' },
    { id: 'fore_long', label: 'フォアロング' },
    { id: 'middle_long', label: 'ミドルロング' },
    { id: 'back_long', label: 'バックロング' },
  ];

  return (
    <div className="bg-white border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-md space-y-4 text-slate-800 animate-in fade-in duration-150">
      {/* 1. ヘッダー: モード表示 ＆ アドバイス・Undoボタン */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-slate-900">ベンチコーチ入力</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                1〜3タッチ
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              サーバー: <strong className="text-slate-700">{defaultServer === 'self' ? '自分サーブ' : '相手サーブ'}</strong>（自動判定）
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onGoToBenchAnalysis && (
            <button
              type="button"
              onClick={onGoToBenchAnalysis}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition-all active:scale-95"
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

      {/* 2. 最上部: 得点 / 失点 切替タブ */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => resetSelection('won')}
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
          onClick={() => resetSelection('lost')}
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

      {/* 3. ナビゲーションバー (パンくず ＆ 戻る ＆ 不明スキップ) */}
      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-600 truncate">
          <span className={selectedResult === 'won' ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
            {selectedResult === 'won' ? '得点' : '失点'}
          </span>
          {wonCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 font-black">
                {wonCategory === 'service_ace' ? 'サービスエース' : wonCategory === 'receive' ? 'レシーブ' : wonCategory === 'third_ball' ? '３球目攻撃' : 'ラリー'}
              </span>
            </>
          )}
          {selectedWonReceiveTech && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-teal-700 font-black">{BENCH_WON_RECEIVE_LABELS[selectedWonReceiveTech]}</span>
            </>
          )}
          {lostCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 font-black">
                {lostCategory === 'service_ace' ? 'サービスエース' : lostCategory === 'receive_miss' ? 'レシーブミス' : lostCategory === 'third_ball_lost' ? '３球目攻撃' : 'ラリー'}
              </span>
            </>
          )}
          {selectedLostCourse !== 'unknown' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-amber-700 font-black">{BENCH_COURSE_LABELS[selectedLostCourse]}</span>
            </>
          )}
          {selectedLostReceiveTech && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-rose-700 font-black">{BENCH_LOST_RECEIVE_LABELS[selectedLostReceiveTech]}</span>
            </>
          )}
          {selectedLostPriorTech && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-rose-700 font-black">{BENCH_LOST_RECEIVE_LABELS[selectedLostPriorTech as BenchLostReceiveTech]}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(wonStep !== 'main' || lostStep !== 'main') && (
            <button
              type="button"
              onClick={() => resetSelection()}
              className="text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 font-bold px-2 py-1 rounded-lg flex items-center gap-0.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>選択やり直し</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveUnknown}
            className="text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>不明・スキップ</span>
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. 【得点時】のステップ別 UI */}
      {/* ======================================================================= */}
      {selectedResult === 'won' && (
        <div className="space-y-3">
          {/* Step 1: 大分類選択 (サービスエース / レシーブ / ３球目攻撃 / ラリー) */}
          {wonStep === 'main' && (
            <div className="grid grid-cols-2 gap-3">
              {/* ① サービスエース */}
              <button
                type="button"
                onClick={() => {
                  setWonCategory('service_ace');
                  setWonStep('course');
                }}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">⚡</span>
                  <span className="text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded">自サーブ</span>
                </div>
                <div className="font-black text-sm text-emerald-950 mt-2">サービスエース</div>
              </button>

              {/* ② レシーブ */}
              <button
                type="button"
                onClick={() => {
                  setWonCategory('receive');
                  setWonStep('receive_tech');
                }}
                className="p-4 rounded-2xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🛡️</span>
                  <span className="text-[10px] font-black bg-teal-600 text-white px-1.5 py-0.5 rounded">レシーブ</span>
                </div>
                <div className="font-black text-sm text-teal-950 mt-2">レシーブ</div>
              </button>

              {/* ③ ３球目攻撃 */}
              <button
                type="button"
                onClick={() => {
                  setWonCategory('third_ball');
                  setWonStep('course'); // または third_ball 専用画面
                }}
                className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💥</span>
                  <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded">自発先手</span>
                </div>
                <div className="font-black text-sm text-blue-950 mt-2">３球目攻撃</div>
              </button>

              {/* ④ ラリー */}
              <button
                type="button"
                onClick={() => {
                  setWonCategory('rally');
                  setWonStep('course'); // rally 専用画面
                }}
                className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🔄</span>
                  <span className="text-[10px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded">ラリー</span>
                </div>
                <div className="font-black text-sm text-purple-950 mt-2">ラリー</div>
              </button>
            </div>
          )}

          {/* サービスエース → コース選択 */}
          {wonCategory === 'service_ace' && wonStep === 'course' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">サーブのコースを選択（タップで即完了）</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {courseOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleWonServiceAce(c.id)}
                    className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 font-black text-sm text-emerald-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* レシーブ → 技術選択 */}
          {wonCategory === 'receive' && wonStep === 'receive_tech' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">レシーブの技術を選択</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['push', 'stop', 'flick', 'sink', 'floated_opp_error'] as BenchWonReceiveTech[]).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => {
                      setSelectedWonReceiveTech(tech);
                      setWonStep('course');
                    }}
                    className="p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 font-black text-sm text-teal-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {BENCH_WON_RECEIVE_LABELS[tech]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* レシーブ → コース選択 */}
          {wonCategory === 'receive' && wonStep === 'course' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">狙ったコースを選択（タップで即完了）</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {courseOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleWonReceive(c.id)}
                    className="p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 font-black text-sm text-teal-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ３球目攻撃 → 状況選択 */}
          {wonCategory === 'third_ball' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">３球目の状況を選択（タップで即完了）</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(['vs_push', 'vs_topspin', 'chance_from_serve'] as BenchWonThirdBallType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleWonThirdBall(type)}
                    className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 font-black text-sm text-blue-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {BENCH_WON_THIRDBALL_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ラリー → 展開選択 */}
          {wonCategory === 'rally' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">ラリーの展開を選択（タップで即完了）</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['on_table', 'out_attack', 'out_defend', 'out_rally', 'opp_chance_miss'] as BenchWonRallyType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleWonRally(type)}
                    className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 font-black text-sm text-purple-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {BENCH_WON_RALLY_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================= */}
      {/* 5. 【失点時】のステップ別 UI */}
      {/* ======================================================================= */}
      {selectedResult === 'lost' && (
        <div className="space-y-3">
          {/* Step 1: 大分類選択 (サービスエース / レシーブミス / ３球目攻撃 / ラリー) */}
          {lostStep === 'main' && (
            <div className="grid grid-cols-2 gap-3">
              {/* ① サービスエース (相手) */}
              <button
                type="button"
                onClick={() => {
                  setLostCategory('service_ace');
                  setLostStep('course');
                }}
                className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">⚡</span>
                  <span className="text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded">相手サーブ</span>
                </div>
                <div className="font-black text-sm text-rose-950 mt-2">サービスエース</div>
              </button>

              {/* ② レシーブミス */}
              <button
                type="button"
                onClick={() => {
                  setLostCategory('receive_miss');
                  setLostStep('course');
                }}
                className="p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-[10px] font-black bg-orange-600 text-white px-1.5 py-0.5 rounded">自ミス</span>
                </div>
                <div className="font-black text-sm text-orange-950 mt-2">レシーブミス</div>
              </button>

              {/* ③ 相手３球目攻撃 */}
              <button
                type="button"
                onClick={() => {
                  setLostCategory('third_ball_lost');
                  setLostStep('prior_tech');
                }}
                className="p-4 rounded-2xl bg-red-50 hover:bg-red-100 border-2 border-red-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💥</span>
                  <span className="text-[10px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded">相手強打</span>
                </div>
                <div className="font-black text-sm text-red-950 mt-2">３球目攻撃</div>
              </button>

              {/* ④ ラリー */}
              <button
                type="button"
                onClick={() => {
                  setLostCategory('rally');
                  setLostStep('course');
                }}
                className="p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 border-2 border-pink-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🔄</span>
                  <span className="text-[10px] font-black bg-pink-600 text-white px-1.5 py-0.5 rounded">ラリー</span>
                </div>
                <div className="font-black text-sm text-pink-950 mt-2">ラリー</div>
              </button>
            </div>
          )}

          {/* 相手サービスエース → コース選択 */}
          {lostCategory === 'service_ace' && lostStep === 'course' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">相手サーブのコースを選択（タップで即完了）</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {courseOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleLostServiceAce(c.id)}
                    className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 font-black text-sm text-rose-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* レシーブミス → Step 1: 相手サーブコース選択 */}
          {lostCategory === 'receive_miss' && lostStep === 'course' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">相手サーブのコースを選択</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {courseOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedLostCourse(c.id);
                      setLostStep('receive_tech');
                    }}
                    className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 font-black text-sm text-orange-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* レシーブミス → Step 2: レシーブ技術選択 */}
          {lostCategory === 'receive_miss' && lostStep === 'receive_tech' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">ミスの原因となったレシーブ技術を選択</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['push', 'stop', 'flick', 'sink', 'light_hit', 'drive', 'smash'] as BenchLostReceiveTech[]).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => {
                      setSelectedLostReceiveTech(tech);
                      setLostStep('receive_hand');
                    }}
                    className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-300 font-black text-sm text-orange-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {BENCH_LOST_RECEIVE_LABELS[tech]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* レシーブミス → Step 3: フォア/バック ハンド選択 (タップで即完了) */}
          {lostCategory === 'receive_miss' && lostStep === 'receive_hand' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">打球ハンドを選択（タップで即完了）</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLostReceiveMiss('fore')}
                  className="p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-400 font-black text-base text-orange-950 text-center transition-all active:scale-95 shadow-sm"
                >
                  🏓 フォアハンド
                </button>
                <button
                  type="button"
                  onClick={() => handleLostReceiveMiss('back')}
                  className="p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-400 font-black text-base text-orange-950 text-center transition-all active:scale-95 shadow-sm"
                >
                  🏓 バックハンド
                </button>
              </div>
            </div>
          )}

          {/* 相手３球目攻撃 → Step 1: 直前の行動（自分のレシーブ）選択 */}
          {lostCategory === 'third_ball_lost' && lostStep === 'prior_tech' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">相手３球目前の直前の行動（自分のレシーブ）</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['push', 'stop', 'flick', 'sink', 'light_hit', 'drive'] as BenchLostPriorReceiveTech[]).map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => {
                      setSelectedLostPriorTech(tech);
                      setLostStep('quality');
                    }}
                    className="p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 border-2 border-red-300 font-black text-sm text-red-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {BENCH_LOST_RECEIVE_LABELS[tech as BenchLostReceiveTech]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 相手３球目攻撃 → Step 2: レシーブの質選択（タップで即完了） */}
          {lostCategory === 'third_ball_lost' && lostStep === 'quality' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">レシーブの質・状態を選択（タップで即完了）</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLostThirdBall('good')}
                  className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 font-black text-sm text-blue-950 text-left transition-all active:scale-95 shadow-sm"
                >
                  <div className="font-black text-base text-blue-900">✅ うまくいった</div>
                  <div className="text-[11px] text-blue-600 mt-1">良いレシーブだったが相手に好打された</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleLostThirdBall('floated_chance')}
                  className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 font-black text-sm text-rose-950 text-left transition-all active:scale-95 shadow-sm"
                >
                  <div className="font-black text-base text-rose-900">⚠️ 浮いてチャンスボール</div>
                  <div className="text-[11px] text-rose-600 mt-1">甘くなって強打を浴びた</div>
                </button>
              </div>
            </div>
          )}

          {/* ラリー → 展開選択 */}
          {lostCategory === 'rally' && (
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">ラリーの展開を選択（タップで即完了）</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(['on_table', 'out_attack_lost', 'out_defend_lost', 'out_rally_lost', 'self_chance_miss'] as BenchLostRallyType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleLostRally(type)}
                    className="p-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100 border-2 border-pink-300 font-black text-sm text-pink-900 text-center transition-all active:scale-95 shadow-sm"
                  >
                    {BENCH_LOST_RALLY_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
