import {
  Match,
  Rally,
  OpponentStyle,
  OpponentHand,
  ActionCategory,
  ReceiveTechnique,
  ServeLength,
  ServeCourse,
  ServeSpin,
  ThirdBallHand,
  ThirdBallType,
  RallyType,
  MissType,
  Course3Way,
  SERVE_SPIN_LABELS,
  SERVE_LENGTH_LABELS,
  SERVE_COURSE_LABELS,
  getServe8WayLabel,
  RECEIVE_TECHNIQUE_LABELS,
  COURSE_3WAY_LABELS,
  THIRD_BALL_HAND_LABELS,
  THIRD_BALL_TYPE_LABELS,
  RALLY_TYPE_LABELS,
  ACTION_CATEGORY_LABELS,
  MISS_TYPE_LABELS,
} from '@/types/table-tennis';

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

// 各技術ごとの得失点統計アイテム
export interface TechniqueStatsItem {
  key: string;
  name: string;
  subLabel?: string;
  category: ActionCategory | 'other';
  total: number;
  won: number;
  lost: number;
  winRate: number; // % 得点率
  lossRate: number; // % 失点率
}

// 各技術ごとの詳細得失点一覧まとめ
export interface DetailedTechniqueSummary {
  // 1. サーブ詳細一覧 (回転別、コース別、回転×コース組み合わせ)
  serveBySpin: TechniqueStatsItem[];
  serveByCourse: TechniqueStatsItem[];
  serveByCombo: TechniqueStatsItem[];

  // 2. レシーブ詳細一覧 (技術別、狙ったコース別、技術×コース組み合わせ)
  receiveByTech: TechniqueStatsItem[];
  receiveByCourse: TechniqueStatsItem[];
  receiveByCombo: TechniqueStatsItem[];

  // 3. ３球目攻撃詳細一覧 (打法×球種別、相手レシーブコース別、自分の打球コース別)
  thirdBallByType: TechniqueStatsItem[];
  thirdBallByRecCourse: TechniqueStatsItem[];
  thirdBallByTargetCourse: TechniqueStatsItem[];

  // 4. ラリー詳細一覧 (展開別)
  rallyByType: TechniqueStatsItem[];

  // 5. 技術大分類一覧 (サーブ、レシーブ、3球目、ラリー、サーブミス)
  byCategorySummary: TechniqueStatsItem[];
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

  // 各技術ごとの詳細得失点率サマリー
  techniqueSummary: DetailedTechniqueSummary;
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
  const emptyTechniqueSummary: DetailedTechniqueSummary = {
    serveBySpin: [],
    serveByCourse: [],
    serveByCombo: [],
    receiveByTech: [],
    receiveByCourse: [],
    receiveByCombo: [],
    thirdBallByType: [],
    thirdBallByRecCourse: [],
    thirdBallByTargetCourse: [],
    rallyByType: [],
    byCategorySummary: [],
  };

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
      techniqueSummary: emptyTechniqueSummary,
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

  // 技術詳細マップ
  // 1. サーブ
  const serveSpinMap = new Map<ServeSpin, { total: number; won: number; lost: number }>();
  const serveCourseMap = new Map<string, { total: number; won: number; lost: number; length: ServeLength; course: ServeCourse }>();
  const serveComboMap = new Map<string, { total: number; won: number; lost: number; spin: ServeSpin; length: ServeLength; course: ServeCourse }>();

  // 2. レシーブ
  const receiveTechMap = new Map<ReceiveTechnique, { total: number; won: number; lost: number }>();
  const receiveCourseMap = new Map<Course3Way, { total: number; won: number; lost: number }>();
  const receiveComboMap = new Map<string, { total: number; won: number; lost: number; tech: ReceiveTechnique; course: Course3Way }>();

  // 3. ３球目
  const thirdBallTypeMap = new Map<string, { total: number; won: number; lost: number; hand: ThirdBallHand; type: ThirdBallType }>();
  const thirdBallRecCourseMap = new Map<Course3Way, { total: number; won: number; lost: number }>();
  const thirdBallTargetCourseMap = new Map<Course3Way, { total: number; won: number; lost: number }>();

  // 4. ラリー
  const rallyTypeMap = new Map<RallyType, { total: number; won: number; lost: number }>();

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

    // ==========================================
    // 1. サーブ詳細集計 (サーブ ＆ サーブミス)
    // ==========================================
    if (r.actionCategory === 'serve' || r.actionCategory === 'serve_miss') {
      if (r.serveSpin) {
        const cur = serveSpinMap.get(r.serveSpin) || { total: 0, won: 0, lost: 0 };
        cur.total++;
        if (isWon) cur.won++;
        else cur.lost++;
        serveSpinMap.set(r.serveSpin, cur);
      }

      if (r.serveLength && r.serveCourse) {
        const cKey = `${r.serveLength}_${r.serveCourse}`;
        const cur = serveCourseMap.get(cKey) || {
          total: 0,
          won: 0,
          lost: 0,
          length: r.serveLength,
          course: r.serveCourse,
        };
        cur.total++;
        if (isWon) cur.won++;
        else cur.lost++;
        serveCourseMap.set(cKey, cur);

        if (r.serveSpin) {
          const comboKey = `${r.serveSpin}_${r.serveLength}_${r.serveCourse}`;
          const combo = serveComboMap.get(comboKey) || {
            total: 0,
            won: 0,
            lost: 0,
            spin: r.serveSpin,
            length: r.serveLength,
            course: r.serveCourse,
          };
          combo.total++;
          if (isWon) combo.won++;
          else combo.lost++;
          serveComboMap.set(comboKey, combo);
        }
      }
    }

    // ==========================================
    // 2. レシーブ詳細集計
    // ==========================================
    if (r.actionCategory === 'receive') {
      if (r.receiveTechnique) {
        const rec = receiveMap.get(r.receiveTechnique) || { total: 0, won: 0 };
        rec.total++;
        if (isWon) rec.won++;
        receiveMap.set(r.receiveTechnique, rec);

        const cur = receiveTechMap.get(r.receiveTechnique) || { total: 0, won: 0, lost: 0 };
        cur.total++;
        if (isWon) cur.won++;
        else cur.lost++;
        receiveTechMap.set(r.receiveTechnique, cur);
      }

      if (r.receiveCourse) {
        const cur = receiveCourseMap.get(r.receiveCourse) || { total: 0, won: 0, lost: 0 };
        cur.total++;
        if (isWon) cur.won++;
        else cur.lost++;
        receiveCourseMap.set(r.receiveCourse, cur);
      }

      if (r.receiveTechnique && r.receiveCourse) {
        const comboKey = `${r.receiveTechnique}_${r.receiveCourse}`;
        const combo = receiveComboMap.get(comboKey) || {
          total: 0,
          won: 0,
          lost: 0,
          tech: r.receiveTechnique,
          course: r.receiveCourse,
        };
        combo.total++;
        if (isWon) combo.won++;
        else combo.lost++;
        receiveComboMap.set(comboKey, combo);
      }
    }

    // ==========================================
    // 3. ３球目攻撃詳細集計
    // ==========================================
    if (r.actionCategory === 'third_ball') {
      if (r.thirdBallHand && r.thirdBallType) {
        const key = `${r.thirdBallHand}_${r.thirdBallType}`;
        const cur = thirdBallTypeMap.get(key) || {
          total: 0,
          won: 0,
          lost: 0,
          hand: r.thirdBallHand,
          type: r.thirdBallType,
        };
        cur.total++;
        if (isWon) cur.won++;
        else cur.lost++;
        thirdBallTypeMap.set(key, cur);
      }

      if (r.thirdBallReceiveCourse) {
        const cur = thirdBallRecCourseMap.get(r.thirdBallReceiveCourse) || { total: 0, won: 0, lost: 0 };
        cur.total++;
        if (isWon) cur.won++;
        else cur.lost++;
        thirdBallRecCourseMap.set(r.thirdBallReceiveCourse, cur);
      }

      if (r.thirdBallTargetCourse) {
        const cur = thirdBallTargetCourseMap.get(r.thirdBallTargetCourse) || { total: 0, won: 0, lost: 0 };
        cur.total++;
        if (isWon) cur.won++;
        else cur.lost++;
        thirdBallTargetCourseMap.set(r.thirdBallTargetCourse, cur);
      }
    }

    // ==========================================
    // 4. ラリー詳細集計
    // ==========================================
    if (r.actionCategory === 'rally') {
      if (r.rallyType) {
        const cur = rallyTypeMap.get(r.rallyType) || { total: 0, won: 0, lost: 0 };
        cur.total++;
        if (isWon) cur.won++;
        else cur.lost++;
        rallyTypeMap.set(r.rallyType, cur);
      }
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

  // ==========================================
  // DetailedTechniqueSummary の成型とソート
  // ==========================================
  const formatStats = (
    key: string,
    name: string,
    cat: ActionCategory | 'other',
    total: number,
    won: number,
    lost: number,
    subLabel?: string
  ): TechniqueStatsItem => ({
    key,
    name,
    subLabel,
    category: cat,
    total,
    won,
    lost,
    winRate: total > 0 ? Math.round((won / total) * 100) : 0,
    lossRate: total > 0 ? Math.round((lost / total) * 100) : 0,
  });

  // 1. サーブ詳細
  const serveBySpin: TechniqueStatsItem[] = Array.from(serveSpinMap.entries())
    .map(([spin, val]) => formatStats(spin, SERVE_SPIN_LABELS[spin] || spin, 'serve', val.total, val.won, val.lost, 'サーブ回転'))
    .sort((a, b) => b.total - a.total);

  const serveByCourse: TechniqueStatsItem[] = Array.from(serveCourseMap.entries())
    .map(([k, val]) => formatStats(k, getServe8WayLabel(val.length, val.course), 'serve', val.total, val.won, val.lost, 'コース・長さ'))
    .sort((a, b) => b.total - a.total);

  const serveByCombo: TechniqueStatsItem[] = Array.from(serveComboMap.entries())
    .map(([k, val]) => {
      const name = `${getServe8WayLabel(val.length, val.course)} (${SERVE_SPIN_LABELS[val.spin]})`;
      return formatStats(k, name, 'serve', val.total, val.won, val.lost, 'コース×回転詳細');
    })
    .sort((a, b) => b.total - a.total);

  // 2. レシーブ詳細
  const receiveByTech: TechniqueStatsItem[] = Array.from(receiveTechMap.entries())
    .map(([tech, val]) => formatStats(tech, RECEIVE_TECHNIQUE_LABELS[tech] || tech, 'receive', val.total, val.won, val.lost, 'レシーブ技術'))
    .sort((a, b) => b.total - a.total);

  const receiveByCourse: TechniqueStatsItem[] = Array.from(receiveCourseMap.entries())
    .map(([crs, val]) => formatStats(crs, `相手${COURSE_3WAY_LABELS[crs]}`, 'receive', val.total, val.won, val.lost, '狙ったコース'))
    .sort((a, b) => b.total - a.total);

  const receiveByCombo: TechniqueStatsItem[] = Array.from(receiveComboMap.entries())
    .map(([k, val]) => {
      const name = `${RECEIVE_TECHNIQUE_LABELS[val.tech]} → 相手${COURSE_3WAY_LABELS[val.course]}`;
      return formatStats(k, name, 'receive', val.total, val.won, val.lost, '技術×コース');
    })
    .sort((a, b) => b.total - a.total);

  // 3. ３球目詳細
  const thirdBallByType: TechniqueStatsItem[] = Array.from(thirdBallTypeMap.entries())
    .map(([k, val]) => {
      const name = `${THIRD_BALL_HAND_LABELS[val.hand]} ${THIRD_BALL_TYPE_LABELS[val.type]}`;
      return formatStats(k, name, 'third_ball', val.total, val.won, val.lost, '打法・球種');
    })
    .sort((a, b) => b.total - a.total);

  const thirdBallByRecCourse: TechniqueStatsItem[] = Array.from(thirdBallRecCourseMap.entries())
    .map(([crs, val]) => formatStats(crs, `${COURSE_3WAY_LABELS[crs]}に来た球`, 'third_ball', val.total, val.won, val.lost, '相手のレシーブコース'))
    .sort((a, b) => b.total - a.total);

  const thirdBallByTargetCourse: TechniqueStatsItem[] = Array.from(thirdBallTargetCourseMap.entries())
    .map(([crs, val]) => formatStats(crs, `相手${COURSE_3WAY_LABELS[crs]}へ攻撃`, 'third_ball', val.total, val.won, val.lost, '狙ったコース'))
    .sort((a, b) => b.total - a.total);

  // 4. ラリー詳細
  const rallyByType: TechniqueStatsItem[] = Array.from(rallyTypeMap.entries())
    .map(([rtype, val]) => formatStats(rtype, RALLY_TYPE_LABELS[rtype] || rtype, 'rally', val.total, val.won, val.lost, 'ラリー展開'))
    .sort((a, b) => b.total - a.total);

  // 5. 大分類サマリー
  const byCategorySummary: TechniqueStatsItem[] = Array.from(categoryMap.entries())
    .map(([cat, val]) => {
      const label = ACTION_CATEGORY_LABELS[cat] || cat;
      return formatStats(cat, label, cat, val.total, val.won, val.lost, '大分類');
    })
    .sort((a, b) => b.total - a.total);

  const techniqueSummary: DetailedTechniqueSummary = {
    serveBySpin,
    serveByCourse,
    serveByCombo,
    receiveByTech,
    receiveByCourse,
    receiveByCombo,
    thirdBallByType,
    thirdBallByRecCourse,
    thirdBallByTargetCourse,
    rallyByType,
    byCategorySummary,
  };

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
    techniqueSummary,
  };
}
