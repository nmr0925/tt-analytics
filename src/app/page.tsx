'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Match,
  Rally,
  ServerType,
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
import { PlayHistoryList } from '@/components/PlayHistoryList';
import { MatchSetupModal } from '@/components/MatchSetupModal';
import { AnalysisFilters } from '@/components/AnalysisFilters';
import { KpiCards } from '@/components/KpiCards';
import { CourtHeatmap } from '@/components/CourtHeatmap';
import { ChartBreakdowns } from '@/components/ChartBreakdowns';
import { MatchesList } from '@/components/MatchesList';
import { DataManagement } from '@/components/DataManagement';
import { TopMenu } from '@/components/TopMenu';
import { Swords, PlusCircle, Cloud, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

import { INITIAL_MATCHES, INITIAL_RALLIES } from '@/lib/mock-data';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [activeMatchIdState, setActiveMatchIdState] = useState<string | null>(INITIAL_MATCHES[0]?.id || null);
  const [allRallies, setAllRallies] = useState<Rally[]>(INITIAL_RALLIES);

  // 分析用データ（常にクラウドDBの最新データを参照）
  const [analyticsMatches, setAnalyticsMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [analyticsRallies, setAnalyticsRallies] = useState<Rally[]>(INITIAL_RALLIES);
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);
  const [isFromCloud, setIsFromCloud] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // 試合進行用
  const [currentGameNumber, setCurrentGameNumber] = useState<number>(1);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // 分析用フィルター
  const [analyticsFilter, setAnalyticsFilter] = useState<AnalyticsFilter>({
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

  // 初回ロード
  useEffect(() => {
    initStorage();
    refreshData();
    loadCloudAnalyticsData();
  }, []);

  const refreshData = () => {
    const loadedMatches = getMatches();
    const loadedActiveId = getActiveMatchId();
    const loadedRallies = getRallies();

    setMatches(loadedMatches);
    setAllRallies(loadedRallies);
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
        // クラウドデータを取得できた場合はメインステートも同期
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
    if (newTab === 'analysis' || newTab === 'matches') {
      // 分析画面または試合一覧を開いたときは最新クラウドDBデータを参照
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
    // 11点先取かつ2点差でゲーム獲得判定
    games.forEach((val) => {
      if ((val.won >= 11 && val.won - val.lost >= 2) || (val.won >= 7 && val.won > val.lost && val.won + val.lost >= 15)) {
        myWins++;
      } else if ((val.lost >= 11 && val.lost - val.won >= 2) || (val.lost >= 7 && val.lost > val.won && val.won + val.lost >= 15)) {
        oppWins++;
      }
    });

    return {
      myGameScore: activeMatch?.myScoreGames || myWins,
      oppGameScore: activeMatch?.oppScoreGames || oppWins,
    };
  }, [currentMatchRallies, activeMatchIdState, activeMatch]);

  // プレー登録ハンドラ（ローカルに0ms即時保存）
  const handleSaveRally = (rally: Rally) => {
    saveRally(rally);
    const updated = getRallies();
    setAllRallies(updated);
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
    undoLastRally(activeMatchIdState);
    const updated = getRallies();
    setAllRallies(updated);
  };

  // 次のゲームへ進む
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

    // クラウド同期
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
  const handleStartNewMatch = () => {
    const newMatch: Match = {
      id: 'match-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      matchType: 'practice',
      opponentHand: 'right',
      opponentStyle: 'shake_attack',
      opponentRubberFore: 'inverted',
      opponentRubberBack: 'inverted',
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
    setActiveTab('input');
  };

  // 試合の保存（新規・編集）
  const handleSaveMatch = (match: Match) => {
    saveMatch(match);
    setActiveMatchId(match.id);
    refreshData();
    setCurrentGameNumber(1);
    setActiveTab('input');
  };

  // 試合の削除
  const handleDeleteMatch = (matchId: string) => {
    deleteMatch(matchId);
    refreshData();
  };

  // アクティブ試合の切り替え
  const handleSelectActiveMatch = (matchId: string) => {
    setActiveMatchId(matchId);
    setActiveMatchIdState(matchId);
    setCurrentGameNumber(1);
    setActiveTab('input');
  };

  // 分析データの計算（常にクラウドDBデータをベースに集計）
  const filteredRalliesData = useMemo(() => {
    return filterRallies(analyticsRallies, analyticsMatches, analyticsFilter);
  }, [analyticsRallies, analyticsMatches, analyticsFilter]);

  const analyticsSummary = useMemo(() => {
    return calculateAnalytics(filteredRalliesData);
  }, [filteredRalliesData]);

  // デフォルトサーバーの決定
  const defaultServer: ServerType = useMemo(() => {
    const total = scoreMy + scoreOpp;
    const isDeuce = scoreMy >= 10 && scoreOpp >= 10;
    return isDeuce
      ? total % 2 === 0 ? 'self' : 'opponent'
      : Math.floor(total / 2) % 2 === 0 ? 'self' : 'opponent';
  }, [scoreMy, scoreOpp]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* ナビゲーションバー */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewMatchClick={handleStartNewMatch}
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
            onStartNewMatch={handleStartNewMatch}
            onGoToAnalysis={() => handleTabChange('analysis')}
            onGoToMatches={() => handleTabChange('matches')}
            onGoToDataManagement={() => handleTabChange('settings')}
            onSelectRecentMatch={(matchId) => handleSelectActiveMatch(matchId)}
            recentMatches={matches}
            totalRalliesCount={allRallies.length}
          />
        )}

        {/* ========================================================================= */}
        {/* 1. 入力タブ (Input Tab) */}
        {/* ========================================================================= */}
        {activeTab === 'input' && (
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
                  日付、相手の戦型（シェーク/カットマン/粒高など）、利き腕を登録すると、1プレーずつの記録を開始できます。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMatch(null);
                    setIsMatchModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition-all active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  新規試合を開始する
                </button>
              </div>
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
                    key={`${activeMatch.id}-${currentGameNumber}-${scoreMy}-${scoreOpp}`}
                    matchId={activeMatch.id}
                    gameNumber={currentGameNumber}
                    scoreMy={scoreMy}
                    scoreOpp={scoreOpp}
                    defaultServer={defaultServer}
                    opponentHand={activeMatch.opponentHand}
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
        {/* 2. 分析タブ (Analysis Tab) */}
        {/* ========================================================================= */}
        {activeTab === 'analysis' && (
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
            onSelectActiveMatch={handleSelectActiveMatch}
            onEditMatch={(m) => {
              setEditingMatch(m);
              setIsMatchModalOpen(true);
            }}
            onDeleteMatch={handleDeleteMatch}
            onNewMatchClick={() => {
              setEditingMatch(null);
              setIsMatchModalOpen(true);
            }}
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
