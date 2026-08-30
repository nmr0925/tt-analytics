import { Match, Rally } from '@/types/table-tennis';
import { INITIAL_MATCHES, INITIAL_RALLIES } from './mock-data';

const STORAGE_KEYS = {
  MATCHES: 'tt_analytics_matches_v1',
  RALLIES: 'tt_analytics_rallies_v1',
  ACTIVE_MATCH_ID: 'tt_analytics_active_match_id_v1',
};

// クライアントサイドかどうかの判定
const isClient = typeof window !== 'undefined';

// 初期化（LocalStorageにデータがなければモックをセット）
export function initStorage(): void {
  if (!isClient) return;

  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RALLIES)) {
    localStorage.setItem(STORAGE_KEYS.RALLIES, JSON.stringify(INITIAL_RALLIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH_ID)) {
    const matches = getMatches();
    if (matches.length > 0) {
      setActiveMatchId(matches[0].id);
    }
  }
}

// 試合一覧取得
export function getMatches(): Match[] {
  if (!isClient) return INITIAL_MATCHES;
  const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
  if (!data) return INITIAL_MATCHES;
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MATCHES;
  }
}

// 試合1件保存（新規 or 更新）
export function saveMatch(match: Match): Match {
  if (!isClient) return match;
  const matches = getMatches();
  const existingIdx = matches.findIndex((m) => m.id === match.id);
  let updated: Match[];
  if (existingIdx >= 0) {
    updated = [...matches];
    updated[existingIdx] = match;
  } else {
    updated = [match, ...matches];
  }
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));
  return match;
}

// 試合削除
export function deleteMatch(matchId: string): void {
  if (!isClient) return;
  const matches = getMatches().filter((m) => m.id !== matchId);
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));

  // 関連するラリーも削除
  const rallies = getRallies().filter((r) => r.matchId !== matchId);
  localStorage.setItem(STORAGE_KEYS.RALLIES, JSON.stringify(rallies));

  if (getActiveMatchId() === matchId) {
    setActiveMatchId(matches.length > 0 ? matches[0].id : null);
  }
}

// アクティブ試合IDの取得・設定
export function getActiveMatchId(): string | null {
  if (!isClient) return INITIAL_MATCHES[0]?.id || null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
}

export function setActiveMatchId(matchId: string | null): void {
  if (!isClient) return;
  if (matchId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MATCH_ID, matchId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
  }
}

// ラリーデータのマイグレーション（過去バージョンのキー互換）
function sanitizeRally(r: any): Rally {
  let actionCat = r.actionCategory;
  let missType = r.missType;
  if (missType === 'serve_miss') {
    actionCat = 'serve_miss';
    missType = undefined;
  } else if (actionCat === 'receive_miss') {
    actionCat = 'receive';
    if (!missType) missType = 'net';
  } else if (actionCat === 'third_ball_miss') {
    actionCat = 'third_ball';
    if (!missType) missType = 'net';
  }
  return { ...r, actionCategory: actionCat, missType };
}

// ラリー一覧取得（matchIdでフィルタも可能）
export function getRallies(matchId?: string): Rally[] {
  if (!isClient) {
    const list = INITIAL_RALLIES.map(sanitizeRally);
    return matchId ? list.filter((r) => r.matchId === matchId) : list;
  }
  const data = localStorage.getItem(STORAGE_KEYS.RALLIES);
  let rallies: Rally[] = [];
  if (data) {
    try {
      const parsed = JSON.parse(data);
      rallies = Array.isArray(parsed) ? parsed.map(sanitizeRally) : INITIAL_RALLIES;
    } catch {
      rallies = INITIAL_RALLIES;
    }
  } else {
    rallies = INITIAL_RALLIES;
  }

  if (matchId) {
    return rallies.filter((r) => r.matchId === matchId);
  }
  return rallies;
}

// ラリー保存
export function saveRally(rally: Rally): Rally {
  if (!isClient) return rally;
  const rallies = getRallies();
  const existingIdx = rallies.findIndex((r) => r.id === rally.id);
  let updated: Rally[];
  if (existingIdx >= 0) {
    updated = [...rallies];
    updated[existingIdx] = rally;
  } else {
    updated = [...rallies, rally];
  }
  localStorage.setItem(STORAGE_KEYS.RALLIES, JSON.stringify(updated));
  return rally;
}

// ラリー削除
export function deleteRally(rallyId: string): void {
  if (!isClient) return;
  const rallies = getRallies().filter((r) => r.id !== rallyId);
  localStorage.setItem(STORAGE_KEYS.RALLIES, JSON.stringify(rallies));
}

// 直前のラリーを取り消す (Undo)
export function undoLastRally(matchId: string): Rally | null {
  if (!isClient) return null;
  const allRallies = getRallies();
  const matchRallies = allRallies.filter((r) => r.matchId === matchId);
  if (matchRallies.length === 0) return null;

  const lastRally = matchRallies[matchRallies.length - 1];
  const updatedAll = allRallies.filter((r) => r.id !== lastRally.id);
  localStorage.setItem(STORAGE_KEYS.RALLIES, JSON.stringify(updatedAll));
  return lastRally;
}

// 現在の試合のスコアをラリー履歴から計算
export function calculateCurrentScore(matchId: string, currentGameNumber = 1): { scoreMy: number; scoreOpp: number } {
  const rallies = getRallies(matchId).filter((r) => r.gameNumber === currentGameNumber);
  let scoreMy = 0;
  let scoreOpp = 0;
  for (const r of rallies) {
    if (r.result === 'won') {
      scoreMy += 1;
    } else {
      scoreOpp += 1;
    }
  }
  return { scoreMy, scoreOpp };
}

// 全データリセット
export function resetToMockData(): void {
  if (!isClient) return;
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
  localStorage.setItem(STORAGE_KEYS.RALLIES, JSON.stringify(INITIAL_RALLIES));
  setActiveMatchId(INITIAL_MATCHES[0].id);
}

// 全データクリア
export function clearAllData(): void {
  if (!isClient) return;
  localStorage.removeItem(STORAGE_KEYS.MATCHES);
  localStorage.removeItem(STORAGE_KEYS.RALLIES);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
}

// JSONエクスポート
export function exportToJSON(): string {
  const matches = getMatches();
  const rallies = getRallies();
  return JSON.stringify({ matches, rallies, exportedAt: new Date().toISOString() }, null, 2);
}

// JSONインポート
export function importFromJSON(jsonString: string): boolean {
  if (!isClient) return false;
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data.matches) && Array.isArray(data.rallies)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(data.matches));
      localStorage.setItem(STORAGE_KEYS.RALLIES, JSON.stringify(data.rallies));
      if (data.matches.length > 0) {
        setActiveMatchId(data.matches[0].id);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}

// CSVエクスポート
export function exportToCSV(): string {
  const matches = getMatches();
  const rallies = getRallies();
  const matchMap = new Map<string, Match>(matches.map((m) => [m.id, m]));

  const headers = [
    'RallyID',
    'MatchID',
    'Date',
    'Tournament',
    'Opponent',
    'OpponentHand',
    'OpponentStyle',
    'Game',
    'ScoreMy',
    'ScoreOpp',
    'Result',
    'Server',
    'ActionCategory',
    'ServeLength',
    'ServeCourse',
    'ServeSpin',
    'ReceiveTechnique',
    'ReceiveCourse',
    'ThirdBallHand',
    'ThirdBallReceiveCourse',
    'ThirdBallTargetCourse',
    'ThirdBallType',
    'RallyType',
    'MissType',
    'CreatedAt'
  ];

  const rows = rallies.map((r) => {
    const m = matchMap.get(r.matchId);
    return [
      r.id,
      r.matchId,
      m?.date || '',
      `"${m?.tournamentName || ''}"`,
      `"${m?.opponentName || ''}"`,
      m?.opponentHand || '',
      m?.opponentStyle || '',
      r.gameNumber,
      r.scoreMy,
      r.scoreOpp,
      r.result,
      r.server,
      r.actionCategory,
      r.serveLength || '',
      r.serveCourse || '',
      r.serveSpin || '',
      r.receiveTechnique || '',
      r.receiveCourse || '',
      r.thirdBallHand || '',
      r.thirdBallReceiveCourse || '',
      r.thirdBallTargetCourse || '',
      r.thirdBallType || '',
      r.rallyType || '',
      r.missType || '',
      r.createdAt
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
