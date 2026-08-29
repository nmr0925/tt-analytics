import { Match, Rally, OpponentStyle, OpponentHand, ActionCategory, ReceiveTechnique, ServeLength, ServeCourse, ServeSpin, ThirdBallHand, ThirdBallType, RallyType, MissType } from '@/types/table-tennis';

export interface AnalyticsFilter {
  dateFrom?: string;
  dateTo?: string;
  matchType?: string; // 'all' | MatchType
  opponentStyle?: string; // 'all' | OpponentStyle
  opponentHand?: string; // 'all' | OpponentHand
  matchId?: string; // 'all' | matchId
  server?: string; // 'all' | 'self' | 'opponent'
  result?: string; // 'all' | 'won' | 'lost'

  // 技術カテゴリ
  actionCategory?: string; // 'all' | ActionCategory

  // サーブ詳細
  serveLength?: string; // 'all' | ServeLength
  serveCourse?: string; // 'all' | ServeCourse
  serveSpin?: string; // 'all' | ServeSpin

  // レシーブ詳細
  receiveTechnique?: string; // 'all' | ReceiveTechnique
  receiveCourse?: string; // 'all' | Course3Way

  // 3球目攻撃詳細
  thirdBallHand?: string; // 'all' | ThirdBallHand
  thirdBallReceiveCourse?: string; // 'all' | Course3Way
  thirdBallTargetCourse?: string; // 'all' | Course3Way
  thirdBallType?: string; // 'all' | ThirdBallType

  // ラリー
  rallyType?: string; // 'all' | RallyType

  // ミス
  missType?: string; // 'all' | MissType
}

export interface EnrichedRally extends Rally {
  match?: Match;
}

export interface AnalyticsSummary {
  totalRallies: number;
  wonCount: number;
  lostCount: number;
  winRate: number; // %
  lossRate: number; // %
  selfServeCount: number;
  selfServeWinRate: number;
  oppServeCount: number;
  oppServeWinRate: number;
  missCount: number;
  missRate: number; // 全失点中、または全プレー中のミス率

  // 戦型別集計
  byOpponentStyle: Array<{
    style: OpponentStyle;
    total: number;
    won: number;
    winRate: number;
  }>;

  // 技術大分類別集計
  byActionCategory: Array<{
    category: ActionCategory;
    total: number;
    won: number;
    lost: number;
    winRate: number;
  }>;

  // レシーブ技術別集計
  byReceiveTechnique: Array<{
    technique: ReceiveTechnique;
    total: number;
    won: number;
    winRate: number;
  }>;

  // サーブコース×長さヒートマップ
  serveHeatmap: Record<string, { total: number; won: number; winRate: number }>;

  // 3球目コースヒートマップ
  thirdBallTargetHeatmap: Record<string, { total: number; won: number; winRate: number }>;

  // ミス種別内訳
  byMissType: Array<{
    missType: MissType;
    count: number;
    percentage: number;
  }>;
}

// フィルタリング処理
export function filterRallies(
  rallies: Rally[],
  matches: Match[],
  filter: AnalyticsFilter
): EnrichedRally[] {
  const matchMap = new Map<string, Match>(matches.map((m) => [m.id, m]));

  return rallies
    .map((r) => ({ ...r, match: matchMap.get(r.matchId) }))
    .filter((r) => {
      const m = r.match;
      if (!m) return false;

      // 試合ID
      if (filter.matchId && filter.matchId !== 'all' && r.matchId !== filter.matchId) {
        return false;
      }

      // 日付
      if (filter.dateFrom && m.date < filter.dateFrom) return false;
      if (filter.dateTo && m.date > filter.dateTo) return false;

      // 試合種別
      if (filter.matchType && filter.matchType !== 'all' && m.matchType !== filter.matchType) {
        return false;
      }

      // 相手戦型
      if (filter.opponentStyle && filter.opponentStyle !== 'all' && m.opponentStyle !== filter.opponentStyle) {
        return false;
      }

      // 相手利き腕
      if (filter.opponentHand && filter.opponentHand !== 'all' && m.opponentHand !== filter.opponentHand) {
        return false;
      }

      // サーバー
      if (filter.server && filter.server !== 'all' && r.server !== filter.server) {
        return false;
      }

      // 勝敗
      if (filter.result && filter.result !== 'all' && r.result !== filter.result) {
        return false;
      }

      // 技術大分類
      if (filter.actionCategory && filter.actionCategory !== 'all' && r.actionCategory !== filter.actionCategory) {
        return false;
      }

      // サーブ詳細
      if (filter.serveLength && filter.serveLength !== 'all' && r.serveLength !== filter.serveLength) {
        return false;
      }
      if (filter.serveCourse && filter.serveCourse !== 'all' && r.serveCourse !== filter.serveCourse) {
        return false;
      }
      if (filter.serveSpin && filter.serveSpin !== 'all' && r.serveSpin !== filter.serveSpin) {
        return false;
      }

      // レシーブ詳細
      if (filter.receiveTechnique && filter.receiveTechnique !== 'all' && r.receiveTechnique !== filter.receiveTechnique) {
        return false;
      }
      if (filter.receiveCourse && filter.receiveCourse !== 'all' && r.receiveCourse !== filter.receiveCourse) {
        return false;
      }

      // 3球目詳細
      if (filter.thirdBallHand && filter.thirdBallHand !== 'all' && r.thirdBallHand !== filter.thirdBallHand) {
        return false;
      }
      if (filter.thirdBallReceiveCourse && filter.thirdBallReceiveCourse !== 'all' && r.thirdBallReceiveCourse !== filter.thirdBallReceiveCourse) {
        return false;
      }
      if (filter.thirdBallTargetCourse && filter.thirdBallTargetCourse !== 'all' && r.thirdBallTargetCourse !== filter.thirdBallTargetCourse) {
        return false;
      }
      if (filter.thirdBallType && filter.thirdBallType !== 'all' && r.thirdBallType !== filter.thirdBallType) {
        return false;
      }

      // ラリー
      if (filter.rallyType && filter.rallyType !== 'all' && r.rallyType !== filter.rallyType) {
        return false;
      }

      // ミス
      if (filter.missType && filter.missType !== 'all' && r.missType !== filter.missType) {
        return false;
      }

      return true;
    });
}

// 集計値計算
export function calculateAnalytics(filteredRallies: EnrichedRally[]): AnalyticsSummary {
  const totalRallies = filteredRallies.length;
  if (totalRallies === 0) {
    return {
      totalRallies: 0,
      wonCount: 0,
      lostCount: 0,
      winRate: 0,
      lossRate: 0,
      selfServeCount: 0,
      selfServeWinRate: 0,
      oppServeCount: 0,
      oppServeWinRate: 0,
      missCount: 0,
      missRate: 0,
      byOpponentStyle: [],
      byActionCategory: [],
      byReceiveTechnique: [],
      serveHeatmap: {},
      thirdBallTargetHeatmap: {},
      byMissType: [],
    };
  }

  let wonCount = 0;
  let lostCount = 0;
  let selfServeCount = 0;
  let selfServeWon = 0;
  let oppServeCount = 0;
  let oppServeWon = 0;
  let missCount = 0;

  const styleMap = new Map<OpponentStyle, { total: number; won: number }>();
  const categoryMap = new Map<ActionCategory, { total: number; won: number; lost: number }>();
  const receiveMap = new Map<ReceiveTechnique, { total: number; won: number }>();
  const serveHeatmap: Record<string, { total: number; won: number; winRate: number }> = {};
  const thirdBallHeatmap: Record<string, { total: number; won: number; winRate: number }> = {};
  const missMap = new Map<MissType, number>();

  for (const r of filteredRallies) {
    const isWon = r.result === 'won';
    if (isWon) wonCount++;
    else lostCount++;

    if (r.server === 'self') {
      selfServeCount++;
      if (isWon) selfServeWon++;
    } else {
      oppServeCount++;
      if (isWon) oppServeWon++;
    }

    if (r.missType) {
      missCount++;
      missMap.set(r.missType, (missMap.get(r.missType) || 0) + 1);
    }

    // 相手戦型別
    if (r.match?.opponentStyle) {
      const cur = styleMap.get(r.match.opponentStyle) || { total: 0, won: 0 };
      cur.total++;
      if (isWon) cur.won++;
      styleMap.set(r.match.opponentStyle, cur);
    }

    // 技術大分類別
    const cat = categoryMap.get(r.actionCategory) || { total: 0, won: 0, lost: 0 };
    cat.total++;
    if (isWon) cat.won++;
    else cat.lost++;
    categoryMap.set(r.actionCategory, cat);

    // レシーブ技術別
    if (r.receiveTechnique) {
      const rec = receiveMap.get(r.receiveTechnique) || { total: 0, won: 0 };
      rec.total++;
      if (isWon) rec.won++;
      receiveMap.set(r.receiveTechnique, rec);
    }

    // サーブヒートマップ (length_course キー)
    if (r.serveLength && r.serveCourse) {
      const key = `${r.serveLength}_${r.serveCourse}`;
      if (!serveHeatmap[key]) {
        serveHeatmap[key] = { total: 0, won: 0, winRate: 0 };
      }
      serveHeatmap[key].total++;
      if (isWon) serveHeatmap[key].won++;
    }

    // 3球目コースヒートマップ
    if (r.thirdBallTargetCourse) {
      const key = r.thirdBallTargetCourse;
      if (!thirdBallHeatmap[key]) {
        thirdBallHeatmap[key] = { total: 0, won: 0, winRate: 0 };
      }
      thirdBallHeatmap[key].total++;
      if (isWon) thirdBallHeatmap[key].won++;
    }
  }

  // ヒートマップの勝率計算
  Object.keys(serveHeatmap).forEach((k) => {
    serveHeatmap[k].winRate = Math.round((serveHeatmap[k].won / serveHeatmap[k].total) * 100);
  });
  Object.keys(thirdBallHeatmap).forEach((k) => {
    thirdBallHeatmap[k].winRate = Math.round((thirdBallHeatmap[k].won / thirdBallHeatmap[k].total) * 100);
  });

  const byOpponentStyle = Array.from(styleMap.entries()).map(([style, val]) => ({
    style,
    total: val.total,
    won: val.won,
    winRate: Math.round((val.won / val.total) * 100),
  }));

  const byActionCategory = Array.from(categoryMap.entries()).map(([category, val]) => ({
    category,
    total: val.total,
    won: val.won,
    lost: val.lost,
    winRate: Math.round((val.won / val.total) * 100),
  }));

  const byReceiveTechnique = Array.from(receiveMap.entries()).map(([technique, val]) => ({
    technique,
    total: val.total,
    won: val.won,
    winRate: Math.round((val.won / val.total) * 100),
  }));

  const byMissType = Array.from(missMap.entries()).map(([missType, count]) => ({
    missType,
    count,
    percentage: missCount > 0 ? Math.round((count / missCount) * 100) : 0,
  }));

  return {
    totalRallies,
    wonCount,
    lostCount,
    winRate: Math.round((wonCount / totalRallies) * 100),
    lossRate: Math.round((lostCount / totalRallies) * 100),
    selfServeCount,
    selfServeWinRate: selfServeCount > 0 ? Math.round((selfServeWon / selfServeCount) * 100) : 0,
    oppServeCount,
    oppServeWinRate: oppServeCount > 0 ? Math.round((oppServeWon / oppServeCount) * 100) : 0,
    missCount,
    missRate: Math.round((missCount / totalRallies) * 100),
    byOpponentStyle,
    byActionCategory,
    byReceiveTechnique,
    serveHeatmap,
    thirdBallTargetHeatmap: thirdBallHeatmap,
    byMissType,
  };
}
