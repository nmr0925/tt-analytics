'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Match,
  Rally,
  ServerType,
  getCurrentServer,
  isGameFinished,
} from '@/types/table-tennis';
import {
  initStorage,
  getMatches,
  saveMatch,
  deleteMatch,
  getActiveMatchId,
  setActiveMatchId,
  getRallies,
  saveRally,
  deleteRally,
  undoLastRally,
  calculateCurrentScore,
} from '@/lib/storage';
import {
  AnalyticsFilter,
  filterRallies,
  calculateAnalytics,
} from '@/lib/analytics';
import { syncMatchToCloud, fetchAnalyticsDataFromCloud } from '@/lib/sync-service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Navbar, TabType } from '@/components/Navbar';
import { ScoreBoard } from '@/components/ScoreBoard';
import { PlayInputWizard } from '@/components/PlayInputWizard';
import { BenchCoachInput } from '@/components/BenchCoachInput';
import { BenchCoachAnalysisView } from '@/components/BenchCoachAnalysisView';
import { PlayHistoryList } from '@/components/PlayHistoryList';
import { MatchSetupModal } from '@/components/MatchSetupModal';
import { AnalysisFilters } from '@/components/AnalysisFilters';
import { KpiCards } from '@/components/KpiCards';
import { CourtHeatmap } from '@/components/CourtHeatmap';
import { ChartBreakdowns } from '@/components/ChartBreakdowns';
import { TechniqueBreakdownTable } from '@/components/TechniqueBreakdownTable';
import { MatchesList } from '@/components/MatchesList';
import { DataManagement } from '@/components/DataManagement';
import { TopMenu } from '@/components/TopMenu';
import { MatchResultView } from '@/components/MatchResultView';
import { Swords, PlusCircle, Cloud, RefreshCw, CheckCircle2, AlertCircle, Zap, Play, Clock, BarChart3 } from 'lucide-react';
import {
  playPointWonSound,
  playPointLostSound,
  playGameWonSound,
  unlockAudioContext,
} from '@/lib/sound-effects';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [matches, setMatches] = useState<Match[]>([]);
  const [allRallies, setAllRallies] = useState<Rally[]>([]);
  const [activeMatchIdState, setActiveMatchIdState] = useState<string | null>(null);
  const [currentGameNumber, setCurrentGameNumber] = useState<number>(1);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // 分析用ステート (クラウドDBデータを優先)
  const [analyticsMatches, setAnalyticsMatches] = useState<Match[]>([]);
  const [analyticsRallies, setAnalyticsRallies] = useState<Rally[]>([]);
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);
  const [isFromCloud, setIsFromCloud] = useState<boolean>(false);

  // フィルター
  const [analyticsFilter, setAnalyticsFilter] = useState<AnalyticsFilter>({
    opponentHand: 'all',
    opponentStyle: 'all',
    matchType: 'all',
  });

  // 初期化・データ読み込み
  useEffect(() => {
    initStorage();
    refreshData();
    loadCloudAnalyticsData();
  }, []);

  const refreshData = () => {
    const loadedMatches = getMatches();
    const loadedRallies = getRallies();
    const loadedActiveId = getActiveMatchId();
    setMatches(loadedMatches);
    setAllRallies(loadedRallies);
    setAnalyticsMatches(loadedMatches);
    setAnalyticsRallies(loadedRallies);
    setActiveMatchIdState(loadedActiveId || (loadedMatches[0]?.id ?? null));
  };

  // クラウドDBから分析用データを読み込む
  const loadCloudAnalyticsData = async () => {
    setIsCloudLoading(true);
    try {
      const result = await fetchAnalyticsDataFromCloud();
      setAnalyticsMatches(result.matches);
      setAnalyticsRallies(result.rallies);
      setIsFromCloud(result.fromCloud);
      if (result.fromCloud) {
        setMatches(result.matches);
        setAllRallies(result.rallies);
      }
    } finally {
      setIsCloudLoading(false);
    }
  };

  // タブ切り替え時のハンドラ
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    if (newTab === 'comprehensive_analysis' || newTab === 'bench_analysis' || newTab === 'matches') {
      loadCloudAnalyticsData();
    }
  };

  // 現在アクティブな試合
  const activeMatch = useMemo(() => {
    return matches.find((m) => m.id === activeMatchIdState) || null;
  }, [matches, activeMatchIdState]);

  // アクティブな試合のラリー履歴
  const currentMatchRallies = useMemo(() => {
    if (!activeMatchIdState) return [];
    return allRallies.filter((r) => r.matchId === activeMatchIdState);
  }, [allRallies, activeMatchIdState]);

  // 現在のゲームのスコア
  const { scoreMy, scoreOpp } = useMemo(() => {
    if (!activeMatchIdState) return { scoreMy: 0, scoreOpp: 0 };
    return calculateCurrentScore(activeMatchIdState, currentGameNumber);
  }, [activeMatchIdState, currentGameNumber, allRallies]);

  // 各ゲームの勝敗から獲得ゲーム数を計算
  const { myGameScore, oppGameScore } = useMemo(() => {
    if (!activeMatchIdState) return { myGameScore: 0, oppGameScore: 0 };
    const games = new Map<number, { won: number; lost: number }>();
    for (const r of currentMatchRallies) {
      const g = games.get(r.gameNumber) || { won: 0, lost: 0 };
      if (r.result === 'won') g.won++;
      else g.lost++;
      games.set(r.gameNumber, g);
    }

    let myWins = 0;
    let oppWins = 0;
    games.forEach((val) => {
      if (isGameFinished(val.won, val.lost)) {
        if (val.won > val.lost) myWins++;
        else oppWins++;
      }
    });

    return {
      myGameScore: activeMatch?.isCompleted && activeMatch?.myScoreGames !== undefined ? activeMatch.myScoreGames : myWins,
      oppGameScore: activeMatch?.isCompleted && activeMatch?.oppScoreGames !== undefined ? activeMatch.oppScoreGames : oppWins,
    };
  }, [currentMatchRallies, activeMatchIdState, activeMatch]);

  // プレー登録ハンドラ（ローカルに0ms即時保存 ＆ 自動ゲーム終了・次ゲーム移行判定）
  const handleSaveRally = (rally: Rally) => {
    unlockAudioContext();
    saveRally(rally);
    const updated = getRallies();
    setAllRallies(updated);

    // 今回のプレー追加後の新スコアを算出
    const newScoreMy = rally.result === 'won' ? scoreMy + 1 : scoreMy;
    const newScoreOpp = rally.result === 'lost' ? scoreOpp + 1 : scoreOpp;

    // ゲーム終了判定 (11点以上かつ2点差以上)
    if (isGameFinished(newScoreMy, newScoreOpp)) {
      const matchRallies = updated.filter((r) => r.matchId === activeMatchIdState);
      const games = new Map<number, { won: number; lost: number }>();
      for (const r of matchRallies) {
        const g = games.get(r.gameNumber) || { won: 0, lost: 0 };
        if (r.result === 'won') g.won++;
        else g.lost++;
        games.set(r.gameNumber, g);
      }

      let updatedMyGames = 0;
      let updatedOppGames = 0;
      games.forEach((val) => {
        if (isGameFinished(val.won, val.lost)) {
          if (val.won > val.lost) updatedMyGames++;
          else updatedOppGames++;
        }
      });

      const gameFormat = activeMatch?.gameFormat || 5;
      const gamesNeededToWin = Math.ceil(gameFormat / 2);

      if (updatedMyGames >= gamesNeededToWin || updatedOppGames >= gamesNeededToWin) {
        // マッチ決着
        const wonMatch = updatedMyGames > updatedOppGames;
        setSyncStatusMsg(
          wonMatch
            ? `🎉 第${currentGameNumber}ゲーム（${newScoreMy}-${newScoreOpp}）でゲームカウント ${updatedMyGames}-${updatedOppGames} となり勝利しました！`
            : `第${currentGameNumber}ゲーム（${newScoreMy}-${newScoreOpp}）でゲームカウント ${updatedMyGames}-${updatedOppGames} で試合終了しました。`
        );
        setTimeout(() => setSyncStatusMsg(null), 6000);

        if (activeMatch) {
          const updatedMatch: Match = {
            ...activeMatch,
            isCompleted: true,
            myScoreGames: updatedMyGames,
            oppScoreGames: updatedOppGames,
          };
          saveMatch(updatedMatch);
          refreshData();

          if (isSupabaseConfigured) {
            syncMatchToCloud(activeMatch.id);
          }
        }
      } else {
        // 次のゲームへ自動移行
        if (newScoreMy > newScoreOpp) {
          playGameWonSound();
        } else {
          playPointLostSound();
        }
        const nextGameNum = currentGameNumber + 1;
        setCurrentGameNumber(nextGameNum);
        setSyncStatusMsg(
          `🔔 第${currentGameNumber}ゲーム終了（${newScoreMy}-${newScoreOpp}）！ 第${nextGameNum}ゲームを開始します`
        );
        setTimeout(() => setSyncStatusMsg(null), 5000);
      }
    } else {
      if (rally.result === 'won') {
        playPointWonSound();
      } else {
        playPointLostSound();
      }
    }
  };

  // プレー削除ハンドラ
  const handleDeleteRally = (rallyId: string) => {
    deleteRally(rallyId);
    const updated = getRallies();
    setAllRallies(updated);
  };

  // 1手戻す (Undo)
  const handleUndo = () => {
    if (!activeMatchIdState) return;
    const currentRallies = allRallies.filter((r) => r.matchId === activeMatchIdState);
    const currentGameRallies = currentRallies.filter((r) => r.gameNumber === currentGameNumber);
    if (currentGameRallies.length === 0 && currentGameNumber > 1) {
      setCurrentGameNumber((prev) => prev - 1);
    }
    undoLastRally(activeMatchIdState);
    const updated = getRallies();
    setAllRallies(updated);
  };

  // 次のゲームへ進む (手動)
  const handleNextGame = () => {
    setCurrentGameNumber((prev) => prev + 1);
  };

  // 試合完了 ＆ クラウドDB自動同期
  const handleCompleteMatch = async () => {
    if (!activeMatch) return;
    const updatedMatch: Match = {
      ...activeMatch,
      isCompleted: true,
      myScoreGames: myGameScore,
      oppScoreGames: oppGameScore,
    };
    saveMatch(updatedMatch);
    refreshData();

    if (isSupabaseConfigured) {
      setSyncStatusMsg('☁️ クラウドDBに同期中...');
      const syncRes = await syncMatchToCloud(activeMatch.id);
      if (syncRes.success) {
        setSyncStatusMsg('✅ クラウドDBへ安全に同期完了しました！');
        setTimeout(() => setSyncStatusMsg(null), 5000);
      } else {
        setSyncStatusMsg(`⚠️ クラウド同期保留（ローカルには保存済）: ${syncRes.error}`);
        setTimeout(() => setSyncStatusMsg(null), 6000);
      }
    } else {
      alert(`試合を記録完了しました！ スコア: ${myGameScore} - ${oppGameScore}`);
    }
  };

  // 新規試合を空の状態で開始
  const handleStartNewMatch = (targetTab: TabType = 'bench_input') => {
    const newMatch: Match = {
      id: 'match-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      matchType: 'practice',
      myHand: 'right',
      opponentHand: 'right',
      opponentStyle: 'shake_attack',
      opponentRubberFore: 'inverted',
      opponentRubberBack: 'inverted',
      initialServer: 'self',
      gameFormat: 5,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    saveMatch(newMatch);
    setActiveMatchId(newMatch.id);
    setActiveMatchIdState(newMatch.id);
    refreshData();
    setCurrentGameNumber(1);
    setEditingMatch(newMatch);
    setIsMatchModalOpen(true);
    setActiveTab(targetTab);
  };

  // 試合の保存（新規・編集）
  const handleSaveMatch = (match: Match) => {
    saveMatch(match);
    setActiveMatchId(match.id);
    refreshData();
    setCurrentGameNumber(1);
  };

  // 試合の削除
  const handleDeleteMatch = (matchId: string) => {
    deleteMatch(matchId);
    refreshData();
  };

  // アクティブ試合の切り替え
  const handleSelectActiveMatch = (matchId: string, targetTab: TabType = 'bench_input') => {
    setActiveMatchId(matchId);
    setActiveMatchIdState(matchId);
    setCurrentGameNumber(1);
    setActiveTab(targetTab);
  };

  // 総合分析データの計算
  const filteredRalliesData = useMemo(() => {
    return filterRallies(analyticsRallies, analyticsMatches, analyticsFilter);
  }, [analyticsRallies, analyticsMatches, analyticsFilter]);

  const analyticsSummary = useMemo(() => {
    return calculateAnalytics(filteredRalliesData);
  }, [filteredRalliesData]);

  // デフォルトサーバーの決定 (ゲーム番号・スコア・開始サーバーから自動計算)
  const defaultServer: ServerType = useMemo(() => {
    return getCurrentServer(
      activeMatch?.initialServer || 'self',
      currentGameNumber,
      scoreMy,
      scoreOpp
    );
  }, [activeMatch?.initialServer, currentGameNumber, scoreMy, scoreOpp]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* ナビゲーションバー */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewMatchClick={() => handleStartNewMatch('bench_input')}
        activeMatchName={
          activeMatch
            ? `${activeMatch.date} vs ${activeMatch.opponentName || '対戦相手'}`
            : undefined
        }
      />

      {/* 同期ステータス通知トースト */}
      {syncStatusMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Cloud className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {/* ========================================================================= */}
        {/* 0. トップメニュータブ (Home Tab) */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <TopMenu
            onStartBenchInput={() => handleStartNewMatch('bench_input')}
            onStartDetailedInput={() => handleStartNewMatch('detailed_input')}
            onGoToBenchAnalysis={() => handleTabChange('bench_analysis')}
            onGoToComprehensiveAnalysis={() => handleTabChange('comprehensive_analysis')}
            onGoToMatches={() => handleTabChange('matches')}
            onGoToDataManagement={() => handleTabChange('settings')}
            onSelectRecentMatch={(matchId) => handleSelectActiveMatch(matchId, 'bench_input')}
            recentMatches={matches}
            totalRalliesCount={allRallies.length}
          />
        )}

        {/* ========================================================================= */}
        {/* 1-A. ベンチコーチ入力タブ (Bench Coach Input) */}
        {/* ========================================================================= */}
        {activeTab === 'bench_input' && (
          <div>
            {!activeMatch ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm border border-amber-100">
                  <Zap className="w-8 h-8 fill-amber-500 text-amber-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  まずは試合・対戦相手を登録してください
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  ベンチコーチ入力では、回転入力不要で1タップ即座にプレーを記録できます。<br />
                  対戦相手の名前や戦型を設定して開始しましょう。
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleStartNewMatch('bench_input')}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-3 rounded-2xl text-sm shadow-md transition-all active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    ベンチコーチ入力を開始する
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartNewMatch('detailed_input')}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl text-sm border border-slate-200 transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4" />
                    詳細試合入力へ
                  </button>
                </div>
              </div>
            ) : activeMatch.isCompleted ? (
              <MatchResultView
                match={activeMatch}
                rallies={currentMatchRallies}
                myGameScore={myGameScore}
                oppGameScore={oppGameScore}
                onGoToHome={() => setActiveTab('home')}
                onGoToBenchAnalysis={() => setActiveTab('bench_analysis')}
                onGoToAnalysis={() => {
                  setAnalyticsFilter((prev) => ({ ...prev, matchId: activeMatch.id }));
                  setActiveTab('comprehensive_analysis');
                }}
                onGoToMatches={() => setActiveTab('matches')}
                onReopenMatch={() => {
                  const updatedMatch: Match = {
                    ...activeMatch,
                    isCompleted: false,
                  };
                  saveMatch(updatedMatch);
                  refreshData();
                  handleUndo();
                }}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 左側: スコアボード ＆ ベンチコーチ入力 (7/12) */}
                <div className="lg:col-span-7 space-y-5">
                  <ScoreBoard
                    match={activeMatch}
                    currentGameNumber={currentGameNumber}
                    scoreMy={scoreMy}
                    scoreOpp={scoreOpp}
                    myGameScore={myGameScore}
                    oppGameScore={oppGameScore}
                    onUndo={handleUndo}
                    onNextGame={handleNextGame}
                    onCompleteMatch={handleCompleteMatch}
                    canUndo={currentMatchRallies.length > 0}
                  />

                  <BenchCoachInput
                    key={`bench-${activeMatch.id}-${currentGameNumber}-${scoreMy}-${scoreOpp}`}
                    matchId={activeMatch.id}
                    gameNumber={currentGameNumber}
                    scoreMy={scoreMy}
                    scoreOpp={scoreOpp}
                    defaultServer={defaultServer}
                    onSaveRally={handleSaveRally}
                    onUndo={handleUndo}
                    canUndo={currentMatchRallies.length > 0}
                    onGoToBenchAnalysis={() => handleTabChange('bench_analysis')}
                  />
                </div>

                {/* 右側: プレー履歴 (5/12) */}
                <div className="lg:col-span-5 space-y-5">
                  <PlayHistoryList
                    rallies={currentMatchRallies}
                    onDeleteRally={handleDeleteRally}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1-B. 詳細試合入力タブ (Detailed Match Input) */}
        {/* ========================================================================= */}
        {activeTab === 'detailed_input' && (
          <div>
            {!activeMatch ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
                  <Swords className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  まずは試合・対戦相手を登録してください
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  日付、相手の戦型、利き腕を登録すると、サーブ回転やコースを含む完全な1プレーずつの記録を開始できます。
                </p>
                <button
                  type="button"
                  onClick={() => handleStartNewMatch('detailed_input')}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition-all active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  詳細試合入力を開始する
                </button>
              </div>
            ) : activeMatch.isCompleted ? (
              <MatchResultView
                match={activeMatch}
                rallies={currentMatchRallies}
                myGameScore={myGameScore}
                oppGameScore={oppGameScore}
                onGoToHome={() => setActiveTab('home')}
                onGoToBenchAnalysis={() => setActiveTab('bench_analysis')}
                onGoToAnalysis={() => {
                  setAnalyticsFilter((prev) => ({ ...prev, matchId: activeMatch.id }));
                  setActiveTab('comprehensive_analysis');
                }}
                onGoToMatches={() => setActiveTab('matches')}
                onReopenMatch={() => {
                  const updatedMatch: Match = {
                    ...activeMatch,
                    isCompleted: false,
                  };
                  saveMatch(updatedMatch);
                  refreshData();
                  handleUndo();
                }}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 左側: スコアボード ＆ 入力フォーム (7/12) */}
                <div className="lg:col-span-7 space-y-5">
                  <ScoreBoard
                    match={activeMatch}
                    currentGameNumber={currentGameNumber}
                    scoreMy={scoreMy}
                    scoreOpp={scoreOpp}
                    myGameScore={myGameScore}
                    oppGameScore={oppGameScore}
                    onUndo={handleUndo}
                    onNextGame={handleNextGame}
                    onCompleteMatch={handleCompleteMatch}
                    canUndo={currentMatchRallies.length > 0}
                  />

                  <PlayInputWizard
                    key={`detail-${activeMatch.id}-${currentGameNumber}-${scoreMy}-${scoreOpp}`}
                    matchId={activeMatch.id}
                    gameNumber={currentGameNumber}
                    scoreMy={scoreMy}
                    scoreOpp={scoreOpp}
                    defaultServer={defaultServer}
                    opponentHand={activeMatch.opponentHand}
                    myHand={activeMatch.myHand || 'right'}
                    onSaveRally={handleSaveRally}
                  />
                </div>

                {/* 右側: プレー履歴 (5/12) */}
                <div className="lg:col-span-5 space-y-5">
                  <PlayHistoryList
                    rallies={currentMatchRallies}
                    onDeleteRally={handleDeleteRally}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2-A. ベンチコーチ分析タブ (Bench Coach Analysis) */}
        {/* ========================================================================= */}
        {activeTab === 'bench_analysis' && (
          <BenchCoachAnalysisView
            rallies={currentMatchRallies.length > 0 ? currentMatchRallies : allRallies}
            match={activeMatch}
            onGoToInput={() => handleTabChange('bench_input')}
          />
        )}

        {/* ========================================================================= */}
        {/* 2-B. 総合分析タブ (Comprehensive Analysis) */}
        {/* ========================================================================= */}
        {activeTab === 'comprehensive_analysis' && (
          <div className="space-y-5">
            {/* クラウドDB接続 ＆ 同期ステータスバー */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-slate-800 flex items-center gap-1.5">
                    <span>データ参照元:</span>
                    {isFromCloud ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        クラウドデータベース (Supabase)
                      </span>
                    ) : (
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        端末内ストレージ (LocalStorage)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    蓄積データ: 登録試合 {analyticsMatches.length} 試合 / 総計 {analyticsRallies.length} プレーを対象に分析中
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isCloudLoading}
                onClick={loadCloudAnalyticsData}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all border border-slate-200 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCloudLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span>{isCloudLoading ? 'DB取得中...' : 'DBから最新データを再取得'}</span>
              </button>
            </div>

            {/* フィルターバー */}
            <AnalysisFilters
              filter={analyticsFilter}
              onChangeFilter={setAnalyticsFilter}
              matches={analyticsMatches}
            />

            {/* KPI サマリーカード */}
            <KpiCards summary={analyticsSummary} />

            {/* 卓球台ヒートマップ */}
            <CourtHeatmap summary={analyticsSummary} />

            {/* 技術別 得失点率一覧テーブル */}
            <TechniqueBreakdownTable summary={analyticsSummary} />

            {/* チャート・内訳グラフ */}
            <ChartBreakdowns summary={analyticsSummary} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. 試合一覧タブ (Matches Tab) */}
        {/* ========================================================================= */}
        {activeTab === 'matches' && (
          <MatchesList
            matches={analyticsMatches}
            activeMatchId={activeMatchIdState}
            onSelectActiveMatch={(id) => handleSelectActiveMatch(id, 'bench_input')}
            onEditMatch={(m) => {
              setEditingMatch(m);
              setIsMatchModalOpen(true);
            }}
            onDeleteMatch={handleDeleteMatch}
            onNewMatchClick={() => handleStartNewMatch('bench_input')}
          />
        )}

        {/* ========================================================================= */}
        {/* 4. データ管理・設定タブ (Settings Tab) */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <DataManagement onDataChanged={refreshData} />
        )}
      </main>

      {/* 新規試合・編集モーダル */}
      <MatchSetupModal
        isOpen={isMatchModalOpen}
        onClose={() => {
          setIsMatchModalOpen(false);
          setEditingMatch(null);
        }}
        onSaveMatch={handleSaveMatch}
        editingMatch={editingMatch}
      />
    </div>
  );
}
