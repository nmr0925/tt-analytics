'use client';

import React, { useState } from 'react';
import {
  ActionCategory,
  Course3Way,
  MissType,
  PointResult,
  Rally,
  RallyType,
  ReceiveTechnique,
  ServeCourse,
  ServeLength,
  ServeSpin,
  ServerType,
  ThirdBallHand,
  ThirdBallType,
  OpponentHand,
  PlayerHand,
  ACTION_CATEGORY_LABELS,
  MISS_TYPE_LABELS,
  RALLY_TYPE_LABELS,
  RECEIVE_TECHNIQUE_LABELS,
  SERVE_SPIN_LABELS,
  THIRD_BALL_HAND_LABELS,
  THIRD_BALL_TYPE_LABELS,
  COURSE_3WAY_LABELS,
  getServe8WayLabel,
} from '@/types/table-tennis';
import { TableTennisCourt } from './TableTennisCourt';
import { ChevronLeft, RotateCcw, Sparkles, Check, ArrowRight } from 'lucide-react';

// 現在表示中の画面ステップ
type WizardStep = 
  | 'step1_result'                // 得失点 & サーバー
  | 'step2_category'              // プレー大分類 (サーブ/レシーブ/3球目/ラリー/サーブミス)
  | 'step3_serve_course'          // サーブ8分割コース
  | 'step3_serve_spin'            // サーブ回転
  | 'step3_rec_opp_serve_course'  // 相手サーブコース (レシーブ失点時)
  | 'step3_rec_opp_serve_spin'    // 相手サーブ回転 (レシーブ失点時)
  | 'step3_receive_tech'          // レシーブ技術
  | 'step3_receive_course'        // レシーブコース (狙ったコース)
  | 'step3_3rd_hand'              // 3球目打法 (フォア/バック)
  | 'step3_3rd_rec_course'        // 相手レシーブコース
  | 'step3_3rd_my_course'         // 自分の3球目コース
  | 'step3_3rd_type'              // 3球目種類 (ドライブ等)
  | 'step3_rally_type'            // ラリー種類
  | 'step4_miss_type';            // ミス種別

interface PlayInputWizardProps {
  matchId: string;
  gameNumber: number;
  scoreMy: number;
  scoreOpp: number;
  defaultServer: ServerType;
  opponentHand?: OpponentHand;
  myHand?: PlayerHand;
  onSaveRally: (rally: Rally) => void;
}

export const PlayInputWizard: React.FC<PlayInputWizardProps> = ({
  matchId,
  gameNumber,
  scoreMy,
  scoreOpp,
  defaultServer,
  opponentHand = 'right',
  myHand = 'right',
  onSaveRally,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('step1_result');

  // 入力データ状態
  const [result, setResult] = useState<PointResult>('won');
  const [server, setServer] = useState<ServerType>(defaultServer);
  const [actionCategory, setActionCategory] = useState<ActionCategory>('serve');

  // サーブ / 相手サーブ
  const [serveLength, setServeLength] = useState<ServeLength>('short');
  const [serveCourse, setServeCourse] = useState<ServeCourse>('fore');
  const [serveSpin, setServeSpin] = useState<ServeSpin>('backspin');

  // レシーブ
  const [receiveTechnique, setReceiveTechnique] = useState<ReceiveTechnique>('push');
  const [receiveCourse, setReceiveCourse] = useState<Course3Way>('fore');

  // 3球目
  const [thirdBallHand, setThirdBallHand] = useState<ThirdBallHand>('forehand');
  const [thirdBallReceiveCourse, setThirdBallReceiveCourse] = useState<Course3Way>('back');
  const [thirdBallTargetCourse, setThirdBallTargetCourse] = useState<Course3Way>('fore');
  const [thirdBallType, setThirdBallType] = useState<ThirdBallType>('drive');

  // ラリー
  const [rallyType, setRallyType] = useState<RallyType>('attack');

  // ミス種別
  const [missType, setMissType] = useState<MissType>('net');

  // 登録実行とステップ初期化
  const commitSave = (customMissType?: MissType) => {
    const finalResult = actionCategory === 'serve_miss' ? 'lost' : result;
    const newRally: Rally = {
      id: 'rally-' + Date.now(),
      matchId,
      gameNumber,
      scoreMy,
      scoreOpp,
      result: finalResult,
      server: actionCategory === 'serve_miss' ? 'self' : server,
      actionCategory,
      createdAt: new Date().toISOString(),
    };

    if (actionCategory === 'serve' || actionCategory === 'serve_miss' || actionCategory === 'receive') {
      newRally.serveLength = serveLength;
      newRally.serveCourse = serveCourse;
      newRally.serveSpin = serveSpin;
    }

    if (actionCategory === 'receive') {
      newRally.receiveTechnique = receiveTechnique;
      newRally.receiveCourse = receiveCourse;
    }

    if (actionCategory === 'third_ball') {
      newRally.thirdBallHand = thirdBallHand;
      newRally.thirdBallReceiveCourse = thirdBallReceiveCourse;
      newRally.thirdBallTargetCourse = thirdBallTargetCourse;
      newRally.thirdBallType = thirdBallType;
    }

    if (actionCategory === 'rally') {
      newRally.rallyType = rallyType;
    }

    if (finalResult === 'lost') {
      if (actionCategory !== 'serve_miss') {
        newRally.missType = customMissType || missType;
      }
    }

    onSaveRally(newRally);

    // 次のプレー入力のためにStep 1へリセット
    setCurrentStep('step1_result');
  };

  // ==========================================
  // ステップ遷移ハンドラ
  // ==========================================

  // Step 1: 得失点選択
  const handleSelectResult = (res: PointResult) => {
    setResult(res);
    setCurrentStep('step2_category');
  };

  // Step 2: カテゴリー選択
  const handleSelectCategory = (cat: ActionCategory) => {
    setActionCategory(cat);

    if (cat === 'serve') {
      setCurrentStep('step3_serve_course');
    } else if (cat === 'serve_miss') {
      setResult('lost');
      setServer('self');
      setCurrentStep('step3_serve_course');
    } else if (cat === 'receive') {
      setServer('opponent');
      if (result === 'lost') {
        // 失点時: 相手サーブコース -> 相手サーブ回転 -> レシーブ技術 -> 狙ったコース -> ミス理由
        setCurrentStep('step3_rec_opp_serve_course');
      } else {
        // 得点時: レシーブ技術 -> 送球コース
        setCurrentStep('step3_receive_tech');
      }
    } else if (cat === 'third_ball') {
      setCurrentStep('step3_3rd_hand');
    } else if (cat === 'rally') {
      setCurrentStep('step3_rally_type');
    }
  };

  // Step 3-A: サーブ/サーブミスコース選択
  const handleSelectServeCourse = (len: ServeLength, crs: ServeCourse) => {
    setServeLength(len);
    setServeCourse(crs);
    setCurrentStep('step3_serve_spin');
  };

  // Step 3-A: サーブ/サーブミス回転選択
  const handleSelectServeSpin = (spin: ServeSpin) => {
    setServeSpin(spin);
    if (actionCategory === 'serve_miss') {
      // サーブミスの場合は回転選択で即座に失点登録完了
      commitSave();
    } else if (result === 'lost') {
      setCurrentStep('step4_miss_type');
    } else {
      commitSave();
    }
  };

  // Step 3-Rec-A: 相手サーブコース選択 (レシーブ失点時)
  const handleSelectRecOppServeCourse = (len: ServeLength, crs: ServeCourse) => {
    setServeLength(len);
    setServeCourse(crs);
    setCurrentStep('step3_rec_opp_serve_spin');
  };

  // Step 3-Rec-B: 相手サーブ回転選択 (レシーブ失点時)
  const handleSelectRecOppServeSpin = (spin: ServeSpin) => {
    setServeSpin(spin);
    setCurrentStep('step3_receive_tech');
  };

  // Step 3-B: レシーブ技術選択
  const handleSelectReceiveTech = (tech: ReceiveTechnique) => {
    setReceiveTechnique(tech);
    setCurrentStep('step3_receive_course');
  };

  // Step 3-B: レシーブコース選択 (狙ったコース / 送球コース)
  const handleSelectReceiveCourse = (crs: Course3Way) => {
    setReceiveCourse(crs);
    if (result === 'lost') {
      setCurrentStep('step4_miss_type');
    } else {
      commitSave();
    }
  };

  // Step 3-C: 3球目打法選択
  const handleSelect3rdHand = (hand: ThirdBallHand) => {
    setThirdBallHand(hand);
    setCurrentStep('step3_3rd_rec_course');
  };

  // Step 3-C: 相手レシーブコース選択
  const handleSelect3rdRecCourse = (crs: Course3Way) => {
    setThirdBallReceiveCourse(crs);
    setCurrentStep('step3_3rd_my_course');
  };

  // Step 3-C: 自分の3球目コース選択
  const handleSelect3rdMyCourse = (crs: Course3Way) => {
    setThirdBallTargetCourse(crs);
    setCurrentStep('step3_3rd_type');
  };

  // Step 3-C: 3球目種類選択
  const handleSelect3rdType = (type: ThirdBallType) => {
    setThirdBallType(type);
    if (result === 'lost') {
      setCurrentStep('step4_miss_type');
    } else {
      commitSave();
    }
  };

  // Step 3-D: ラリー種類選択
  const handleSelectRallyType = (rtype: RallyType) => {
    setRallyType(rtype);
    if (result === 'lost') {
      setCurrentStep('step4_miss_type');
    } else {
      commitSave();
    }
  };

  // Step 4: ミス種別選択 (最終ステップ)
  const handleSelectMissType = (mtype: MissType) => {
    setMissType(mtype);
    commitSave(mtype);
  };

  // 1つ前のステップに戻る
  const handleGoBack = () => {
    switch (currentStep) {
      case 'step2_category':
        setCurrentStep('step1_result');
        break;
      case 'step3_serve_course':
      case 'step3_rec_opp_serve_course':
      case 'step3_3rd_hand':
      case 'step3_rally_type':
        setCurrentStep('step2_category');
        break;
      case 'step3_serve_spin':
        setCurrentStep('step3_serve_course');
        break;
      case 'step3_rec_opp_serve_spin':
        setCurrentStep('step3_rec_opp_serve_course');
        break;
      case 'step3_receive_tech':
        if (result === 'lost' && actionCategory === 'receive') {
          setCurrentStep('step3_rec_opp_serve_spin');
        } else {
          setCurrentStep('step2_category');
        }
        break;
      case 'step3_receive_course':
        setCurrentStep('step3_receive_tech');
        break;
      case 'step3_3rd_rec_course':
        setCurrentStep('step3_3rd_hand');
        break;
      case 'step3_3rd_my_course':
        setCurrentStep('step3_3rd_rec_course');
        break;
      case 'step3_3rd_type':
        setCurrentStep('step3_3rd_my_course');
        break;
      case 'step4_miss_type':
        if (actionCategory === 'serve') setCurrentStep('step3_serve_spin');
        else if (actionCategory === 'receive') setCurrentStep('step3_receive_course');
        else if (actionCategory === 'third_ball') setCurrentStep('step3_3rd_type');
        else setCurrentStep('step3_rally_type');
        break;
      default:
        setCurrentStep('step1_result');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm text-slate-800">
      {/* 上部: ナビゲーション & パンくず */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[80%] scrollbar-none">
          {/* Step 1 バッジ */}
          <button
            type="button"
            onClick={() => setCurrentStep('step1_result')}
            className={`px-2 py-0.5 rounded-md font-bold text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 ${
              currentStep === 'step1_result'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {result === 'won' ? '⭕得点' : '❌失点'}
          </button>

          {currentStep !== 'step1_result' && (
            <>
              <span className="text-slate-300">/</span>
              {/* Step 2 バッジ */}
              <button
                type="button"
                onClick={() => setCurrentStep('step2_category')}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] whitespace-nowrap transition-colors ${
                  currentStep === 'step2_category'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ACTION_CATEGORY_LABELS[actionCategory].split(' ')[0]}
              </button>
            </>
          )}

          {/* サーブ進行時 */}
          {(currentStep === 'step3_serve_spin' || (currentStep === 'step4_miss_type' && actionCategory.includes('serve'))) && (
            <>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => setCurrentStep('step3_serve_course')}
                className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap"
              >
                {getServe8WayLabel(serveLength, serveCourse)}
              </button>
            </>
          )}

          {/* レシーブ失点・相手サーブ入力進行時 */}
          {actionCategory === 'receive' && result === 'lost' && (
            <>
              {(currentStep === 'step3_rec_opp_serve_spin' || currentStep === 'step3_receive_tech' || currentStep === 'step3_receive_course' || currentStep === 'step4_miss_type') && (
                <>
                  <span className="text-slate-300">/</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step3_rec_opp_serve_course')}
                    className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap"
                  >
                    相手:{getServe8WayLabel(serveLength, serveCourse)}
                  </button>
                </>
              )}
              {(currentStep === 'step3_receive_tech' || currentStep === 'step3_receive_course' || currentStep === 'step4_miss_type') && (
                <>
                  <span className="text-slate-300">/</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step3_rec_opp_serve_spin')}
                    className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap"
                  >
                    {SERVE_SPIN_LABELS[serveSpin]}
                  </button>
                </>
              )}
            </>
          )}

          {/* レシーブ技術進行時 */}
          {actionCategory === 'receive' && (currentStep === 'step3_receive_course' || currentStep === 'step4_miss_type') && (
            <>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => setCurrentStep('step3_receive_tech')}
                className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap"
              >
                {RECEIVE_TECHNIQUE_LABELS[receiveTechnique]}
              </button>
            </>
          )}
        </div>

        {/* 戻るボタン */}
        {currentStep !== 'step1_result' && (
          <button
            type="button"
            onClick={handleGoBack}
            className="flex items-center gap-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 border border-slate-200"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            戻る
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 画面 1: 得失点 ＆ サーバー選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step1_result' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
            このプレーの結果をタップしてください
          </div>

          {/* 得点 / 失点の特大ボタン */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSelectResult('won')}
              className="h-28 sm:h-36 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xl sm:text-2xl shadow-lg shadow-emerald-200 border-2 border-emerald-400 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span className="text-3xl sm:text-4xl">⭕</span>
              <span>得点</span>
              <span className="text-[10px] sm:text-xs font-semibold opacity-90 uppercase tracking-wider">
                POINT WON
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectResult('lost')}
              className="h-28 sm:h-36 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-xl sm:text-2xl shadow-lg shadow-rose-200 border-2 border-rose-400 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span className="text-3xl sm:text-4xl">❌</span>
              <span>失点</span>
              <span className="text-[10px] sm:text-xs font-semibold opacity-90 uppercase tracking-wider">
                POINT LOST
              </span>
            </button>
          </div>

          {/* サーバー切替バー */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">現在のサーバー:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setServer('self')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  server === 'self'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                自分サーブ
              </button>
              <button
                type="button"
                onClick={() => setServer('opponent')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  server === 'opponent'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                相手サーブ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 2: プレーカテゴリー選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step2_category' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-center">
            {result === 'won' ? (
              <span className="text-emerald-600">得点に繋がったプレーを選択</span>
            ) : (
              <span className="text-rose-600">失点・ミスに関わったプレーを選択</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* サーブ */}
            <button
              type="button"
              onClick={() => handleSelectCategory('serve')}
              className="h-24 sm:h-28 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 p-3 text-left flex flex-col justify-between transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 group-hover:text-emerald-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                  1球目
                </span>
                <span className="text-lg">🏓</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900">サーブ</div>
                <div className="text-[10px] text-slate-500">コース・長さ・回転</div>
              </div>
            </button>

            {/* レシーブ */}
            <button
              type="button"
              onClick={() => handleSelectCategory('receive')}
              className="h-24 sm:h-28 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 p-3 text-left flex flex-col justify-between transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 group-hover:text-emerald-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                  2球目
                </span>
                <span className="text-lg">🛡️</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900">レシーブ</div>
                <div className="text-[10px] text-slate-500">ツッツキ・ストップ・フリック等</div>
              </div>
            </button>

            {/* 3球目攻撃 */}
            <button
              type="button"
              onClick={() => handleSelectCategory('third_ball')}
              className="h-24 sm:h-28 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 p-3 text-left flex flex-col justify-between transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 group-hover:text-emerald-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                  3球目
                </span>
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900">３球目攻撃</div>
                <div className="text-[10px] text-slate-500">ドライブ・スマッシュ・決定打</div>
              </div>
            </button>

            {/* ラリー */}
            <button
              type="button"
              onClick={() => handleSelectCategory('rally')}
              className="h-24 sm:h-28 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-500 p-3 text-left flex flex-col justify-between transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 group-hover:text-indigo-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                  4球目以降
                </span>
                <span className="text-lg">🔥</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-slate-900">ラリー</div>
                <div className="text-[10px] text-slate-500">攻撃・ブロック・チャンスボール</div>
              </div>
            </button>

            {/* サーブミス */}
            <button
              type="button"
              onClick={() => handleSelectCategory('serve_miss')}
              className="col-span-2 h-20 sm:h-22 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 hover:border-rose-400 p-3 text-left flex items-center justify-between transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
                  ⚠️
                </div>
                <div>
                  <div className="text-base sm:text-lg font-black text-rose-900 flex items-center gap-2">
                    <span>サーブミス</span>
                    <span className="text-[10px] font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
                      失点
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-600">狙ったコース・回転を詳細記録</div>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-white border border-rose-200 px-3 py-1.5 rounded-xl shadow-xs">
                コース・回転へ ➔
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-A: サーブコース（8分割卓球台マップ） */}
      {/* ========================================================================= */}
      {currentStep === 'step3_serve_course' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <TableTennisCourt
            mode="serve_select"
            selectedLength={serveLength}
            selectedCourse={serveCourse}
            opponentHand={opponentHand}
            onSelectServe={(len, crs) => handleSelectServeCourse(len, crs)}
            title={
              actionCategory === 'serve_miss'
                ? '⚠️ 狙ったサーブコースをタップしてください'
                : result === 'lost'
                ? '狙ったサーブコースをタップ'
                : 'サーブコースをタップ'
            }
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-A: サーブ回転選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step3_serve_spin' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-center">
            {actionCategory === 'serve_miss' ? (
              <span className="text-rose-600">⚠️ 狙ったサーブの回転をタップ（タップで即登録）</span>
            ) : (
              <span className="text-teal-700">サーブの回転をタップしてください（タップで即登録）</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(SERVE_SPIN_LABELS) as ServeSpin[]).map((spin) => (
              <button
                key={spin}
                type="button"
                onClick={() => handleSelectServeSpin(spin)}
                className="h-16 rounded-xl bg-slate-50 hover:bg-teal-600 hover:text-white border border-slate-200 font-black text-sm text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                {SERVE_SPIN_LABELS[spin]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-Rec-A: 相手サーブコース選択 (レシーブ失点時) */}
      {/* ========================================================================= */}
      {currentStep === 'step3_rec_opp_serve_course' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <TableTennisCourt
            mode="receive_serve_select"
            selectedLength={serveLength}
            selectedCourse={serveCourse}
            opponentHand={opponentHand}
            myHand={myHand}
            onSelectServe={(len, crs) => handleSelectRecOppServeCourse(len, crs)}
            title="⚠️ 相手のサーブコースをタップしてください"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-Rec-B: 相手サーブ回転選択 (レシーブ失点時) */}
      {/* ========================================================================= */}
      {currentStep === 'step3_rec_opp_serve_spin' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-rose-600 text-center">
            ⚠️ 相手のサーブ回転をタップしてください
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(SERVE_SPIN_LABELS) as ServeSpin[]).map((spin) => (
              <button
                key={spin}
                type="button"
                onClick={() => handleSelectRecOppServeSpin(spin)}
                className="h-16 rounded-xl bg-slate-50 hover:bg-rose-600 hover:text-white border border-slate-200 font-black text-sm text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                {SERVE_SPIN_LABELS[spin]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-B: レシーブ技術選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step3_receive_tech' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-emerald-700 text-center">
            レシーブ技術をタップしてください
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(RECEIVE_TECHNIQUE_LABELS) as ReceiveTechnique[]).map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => handleSelectReceiveTech(tech)}
                className="h-16 rounded-xl bg-slate-50 hover:bg-emerald-600 hover:text-white border border-slate-200 font-black text-sm text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                {RECEIVE_TECHNIQUE_LABELS[tech]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-B: レシーブ送球コース選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step3_receive_course' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-center">
            {result === 'lost' ? (
              <span className="text-rose-600">狙ったレシーブコースをタップ（ミスの理由選択へ）</span>
            ) : (
              <span className="text-blue-700">レシーブを送ったコースをタップ（タップで即登録）</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(opponentHand === 'left' ? ['back', 'middle', 'fore'] : ['fore', 'middle', 'back'] as Course3Way[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleSelectReceiveCourse(c as Course3Way)}
                className={`h-28 rounded-2xl border-2 font-black text-base flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm group ${
                  result === 'lost'
                    ? 'bg-rose-50 hover:bg-rose-600 hover:text-white border-rose-200 hover:border-rose-400 text-rose-900'
                    : 'bg-blue-50 hover:bg-blue-600 hover:text-white border-blue-200 hover:border-blue-400 text-blue-900'
                }`}
              >
                <span>相手{COURSE_3WAY_LABELS[c as Course3Way]}</span>
                <span className={`text-[10px] font-normal ${result === 'lost' ? 'text-rose-600 group-hover:text-rose-100' : 'text-blue-600 group-hover:text-blue-100'}`}>
                  {result === 'lost' ? '狙ったコース' : '送球コース'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-C: 3球目打法選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step3_3rd_hand' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-emerald-700 text-center">
            3球目の自分の打法をタップ
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['forehand', 'backhand'] as ThirdBallHand[]).map((hand) => (
              <button
                key={hand}
                type="button"
                onClick={() => handleSelect3rdHand(hand)}
                className="h-28 rounded-2xl bg-slate-50 hover:bg-emerald-600 hover:text-white border-2 border-slate-200 hover:border-emerald-400 font-black text-lg text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                {THIRD_BALL_HAND_LABELS[hand]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-C: 相手のレシーブコース選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step3_3rd_rec_course' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-blue-700 text-center">
            相手のレシーブが来たコースをタップ
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(myHand === 'left' ? ['back', 'middle', 'fore'] : ['fore', 'middle', 'back'] as Course3Way[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleSelect3rdRecCourse(c as Course3Way)}
                className="h-28 rounded-2xl bg-blue-50 hover:bg-blue-600 hover:text-white border-2 border-blue-200 hover:border-blue-400 font-black text-base text-blue-900 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm group"
              >
                <span>{COURSE_3WAY_LABELS[c as Course3Way]}</span>
                <span className="text-[10px] text-blue-600 group-hover:text-blue-100 font-normal">に来た</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-C: 自分が打った3球目コース選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step3_3rd_my_course' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-emerald-700 text-center">
            自分が打った（狙った）コースをタップ
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(opponentHand === 'left' ? ['back', 'middle', 'fore'] : ['fore', 'middle', 'back'] as Course3Way[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleSelect3rdMyCourse(c as Course3Way)}
                className="h-28 rounded-2xl bg-emerald-50 hover:bg-emerald-600 hover:text-white border-2 border-emerald-200 hover:border-emerald-400 font-black text-base text-emerald-900 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm group"
              >
                <span>相手{COURSE_3WAY_LABELS[c as Course3Way]}</span>
                <span className="text-[10px] text-emerald-600 group-hover:text-emerald-100 font-normal">へ打った</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-C: 3球目種類選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step3_3rd_type' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-teal-700 text-center">
            攻撃の種類をタップ（タップで即登録）
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(THIRD_BALL_TYPE_LABELS) as ThirdBallType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSelect3rdType(type)}
                className="h-20 rounded-2xl bg-slate-50 hover:bg-teal-600 hover:text-white border border-slate-200 font-black text-base text-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                {THIRD_BALL_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 3-D: ラリー展開選択 */}
      {/* ========================================================================= */}
      {currentStep === 'step3_rally_type' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-indigo-700 text-center">
            ラリー展開の種類をタップ（タップで即登録）
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(Object.keys(RALLY_TYPE_LABELS) as RallyType[]).map((rtype) => (
              <button
                key={rtype}
                type="button"
                onClick={() => handleSelectRallyType(rtype)}
                className="h-20 rounded-2xl bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-400 font-black text-base text-indigo-900 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                {RALLY_TYPE_LABELS[rtype]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 画面 4: ミス要因・失点理由選択 (ミス時・失点時のみ) */}
      {/* ========================================================================= */}
      {currentStep === 'step4_miss_type' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-rose-600 text-center">
            失点・ミス理由をタップしてください（タップで即登録）
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(Object.keys(MISS_TYPE_LABELS) as MissType[]).map((mtype) => (
              <button
                key={mtype}
                type="button"
                onClick={() => handleSelectMissType(mtype)}
                className="h-20 rounded-2xl bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-400 font-black text-sm text-rose-900 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                {MISS_TYPE_LABELS[mtype]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
