import {
  Rally,
  Match,
  ServeCourse,
  ServeLength,
  getServe8WayLabel,
  SERVE_COURSE_LABELS,
  RECEIVE_TECHNIQUE_LABELS,
  THIRD_BALL_TYPE_LABELS,
  RALLY_TYPE_LABELS,
  MISS_TYPE_LABELS,
  InitiativeType,
  BENCH_COURSE_LABELS,
  BENCH_WON_RECEIVE_LABELS,
  BENCH_WON_THIRDBALL_LABELS,
  BENCH_WON_RALLY_LABELS,
  BENCH_LOST_SELF_MISS_LABELS,
  BENCH_LOST_THIRDBALL_POS_LABELS,
  BENCH_LOST_THIRDBALL_SITUATION_LABELS,
  BENCH_LOST_RECEIVE_LABELS,
  BENCH_LOST_RECEIVE_QUALITY_LABELS,
  BENCH_LOST_RALLY_LABELS,
  BenchCourse,
} from '@/types/table-tennis';

export interface ActionImpactItem {
  id: string;
  name: string;
  detail: string;
  category: 'serve' | 'receive' | 'third_ball' | 'rally' | 'unforced' | 'other';
  total: number;
  won: number;
  lost: number;
  winRate: number; // %
  lossRate: number; // %
  adviceType: 'keep' | 'stop' | 'caution' | 'neutral';
  adviceMessage: string;
}

export interface SkillFailureItem {
  id: string;
  skillName: string;
  missCount: number;
  totalAttempts: number;
  failureRate: number; // %
  adviceMessage: string;
}

export interface InitiativeStats {
  total: number;
  won: number;
  lost: number;
  winRate: number; // %
  evaluation: string;
  advice: string;
}

export interface PointBreakdownItem {
  id: string;
  label: string;
  count: number;
  percentage: number; // %
  categoryColor: string;
}

export interface TrendChangeItem {
  id: string;
  actionName: string;
  earlyTotal: number;
  earlyWon: number;
  earlyWinRate: number;
  latestTotal: number;
  latestWon: number;
  latestWinRate: number;
  rateDiff: number; // latestWinRate - earlyWinRate (負の値)
  warningMessage: string;
}

export interface ClutchServeRecommendation {
  serveName: string;
  total: number;
  won: number;
  winRate: number;
  recommendationReason: string;
}

// レシーブ総合分析 (直接得点、直接失点、ラリー継続)
export interface ReceivePhaseSummary {
  total: number; // レシーブ総数 (相手サーブ時の全プレー)
  directWon: number; // 直接得点
  directLost: number; // 直接失点 (レシーブミス)
  rallyContinued: number; // ラリー継続 (相手3球目被弾含む)
  directWinRate: number; // % (directWon / total)
  directLossRate: number; // % (directLost / total)
  continueRate: number; // % (rallyContinued / total)
}

// 自サーブ総合分析
export interface ServePhaseSummary {
  total: number; // 自サーブ総数
  serviceAces: number; // サービスエース
  serveMisses: number; // サーブミス
  oppReceiveAttacks: number; // 相手にレシーブから攻められた
  thirdBallAttacks: number; // 3球目攻撃総数 (得点 + ミス)
  thirdBallWon: number; // 3球目攻撃得点
  thirdBallLost: number; // 3球目攻撃ミス
  rallyContinued: number; // その他ラリー継続
  serviceAceRate: number; // %
  serveMissRate: number; // %
  oppReceiveAttackRate: number; // %
  thirdBallWinRate: number; // % (3球目得点 / 3球目総数)
}

// ラリー総合分析
export interface RallyPhaseSummary {
  total: number; // ラリー総数 (得点 + 失点)
  won: number; // ラリー得点
  lost: number; // ラリー失点
  winRate: number; // %
  lossRate: number; // %
}

export interface SetBenchAnalysis {
  setNumber: number;
  totalPoints: number;
  wonPoints: number;
  lostPoints: number;
  winRate: number;

  // 大分類・展開別の母数集計
  receiveSummary: ReceivePhaseSummary;
  serveSummary: ServePhaseSummary;
  rallySummary: RallyPhaseSummary;

  // 1. 得点率が高い行動 (効いている・続けるべき) - 母数(won+lost)から算出
  topWinningActions: ActionImpactItem[];

  // 2. 失点率が高い行動 (やめる・意識して待つ・対処すべき) - 母数(won+lost)から算出
  topLosingActions: ActionImpactItem[];

  // 3. ミスが多い技術の失敗率
  topSkillFailures: SkillFailureItem[];

  // 4. 先手を取りに行った際の得点率
  selfInitiative: InitiativeStats;

  // 5. 先手を取られた際の得点率
  oppInitiative: InitiativeStats;

  // 6. 全得点の内訳
  wonBreakdown: PointBreakdownItem[];

  // 7. 全失点の内訳
  lostBreakdown: PointBreakdownItem[];

  // 1分間アドバイス用ハイライト
  quickAdvice: {
    keep: string;
    stop: string;
    clutch: string;
  };
}

export interface BenchCoachAnalysisSummary {
  hasData: boolean;
  totalSets: number;
  latestSetNumber: number;

  // 直前のセット分析 (最新セット)
  latestSet: SetBenchAnalysis | null;

  // 各セットごとの分析 (セット切り替え表示用)
  bySet: Record<number, SetBenchAnalysis>;

  // 試合全体の通算分析
  fullMatch: SetBenchAnalysis;

  // 序盤 vs 直前セットの変化・トレンド
  trendChanges: TrendChangeItem[];

  // ここぞで出すべき必勝サーブ
  clutchServe: ClutchServeRecommendation | null;
}

// =============================================================================
// ラリーからベンチコーチ用のアクション分類・先手判定を自動抽出するパーサー
// =============================================================================

export function parseRallyToBenchData(r: Rally): {
  actionLabel: string;
  actionCategory: 'serve' | 'receive' | 'third_ball' | 'rally' | 'unforced' | 'other';
  initiative: InitiativeType;
  wonDetailLabel: string;
  lostDetailLabel: string;
  skillKey?: string;
  skillName?: string;
} {
  const isWon = r.result === 'won';
  const isSelfServe = r.server === 'self';

  // ===========================================================================
  // 1. 新しい 1~3 タップ ベンチコーチ入力からの明示的データ
  // ===========================================================================

  // 得点時の各カテゴリ
  if (isWon && r.benchWonCategory) {
    if (r.benchWonCategory === 'service_ace') {
      const cName = r.benchCourse ? BENCH_COURSE_LABELS[r.benchCourse] : 'コース不明';
      return {
        actionLabel: `サービスエース (${cName})`,
        actionCategory: 'serve',
        initiative: 'self_attack',
        wonDetailLabel: `自分のサービスエース (${cName})`,
        lostDetailLabel: 'サーブ後の失点',
        skillKey: `serve_${r.benchCourse || 'ace'}`,
        skillName: `${cName}サーブ`,
      };
    }

    if (r.benchWonCategory === 'receive') {
      const techName = r.benchWonReceiveTech ? BENCH_WON_RECEIVE_LABELS[r.benchWonReceiveTech] : 'レシーブ';
      const cName = r.benchCourse ? BENCH_COURSE_LABELS[r.benchCourse] : 'コース不明';
      const isAttacking = r.benchWonReceiveTech === 'flick' || r.benchWonReceiveTech === 'floated_opp_error';
      return {
        actionLabel: `レシーブ得点 (${techName} → ${cName})`,
        actionCategory: 'receive',
        initiative: isAttacking ? 'self_attack' : 'neutral',
        wonDetailLabel: `レシーブ得点 (${techName} → ${cName})`,
        lostDetailLabel: 'レシーブ後の失点',
        skillKey: `receive_${r.benchWonReceiveTech || 'tech'}`,
        skillName: `${techName}レシーブ`,
      };
    }

    if (r.benchWonCategory === 'third_ball') {
      const typeName = r.benchWonThirdBallType ? BENCH_WON_THIRDBALL_LABELS[r.benchWonThirdBallType] : '３球目攻撃';
      return {
        actionLabel: `３球目攻撃 (${typeName})`,
        actionCategory: 'third_ball',
        initiative: 'self_attack',
        wonDetailLabel: `３球目攻撃 (${typeName})`,
        lostDetailLabel: '３球目攻撃の失点',
        skillKey: `third_ball_${r.benchWonThirdBallType || 'attack'}`,
        skillName: `３球目攻撃 (${typeName})`,
      };
    }

    if (r.benchWonCategory === 'rally') {
      const rallyName = r.benchWonRallyType ? BENCH_WON_RALLY_LABELS[r.benchWonRallyType] : 'ラリー';
      const isSelfAtk = r.benchWonRallyType === 'out_attack' || r.benchWonRallyType === 'first_attack';
      const isOppAtk = r.benchWonRallyType === 'out_defend';
      return {
        actionLabel: `ラリー得点 (${rallyName})`,
        actionCategory: 'rally',
        initiative: isSelfAtk ? 'self_attack' : isOppAtk ? 'opp_attack' : 'neutral',
        wonDetailLabel: `ラリー得点 (${rallyName})`,
        lostDetailLabel: 'ラリー失点',
        skillKey: `rally_${r.benchWonRallyType || 'general'}`,
        skillName: `${rallyName}`,
      };
    }
  }

  // 失点時の各カテゴリ
  if (!isWon && r.benchLostCategory) {
    // 相手にレシーブから攻められた
    if (r.benchLostCategory === 'opp_receive_attack') {
      const cName = r.benchCourse ? BENCH_COURSE_LABELS[r.benchCourse] : '自サーブ';
      return {
        actionLabel: `相手にレシーブから攻められた (${cName}後)`,
        actionCategory: 'serve',
        initiative: 'opp_attack',
        wonDetailLabel: 'サーブからの得点',
        lostDetailLabel: `レシーブから攻められた (${cName}後)`,
        skillKey: `serve_rec_attack_${r.benchCourse || 'other'}`,
        skillName: `${cName}のコントロール`,
      };
    }

    // 自分のミス (サーブミス / レシーブミス / ３球目攻撃ミス)
    if (r.benchLostCategory === 'self_miss') {
      if (r.benchLostSelfMissType === 'serve_miss') {
        return {
          actionLabel: '自分のサーブミス',
          actionCategory: 'serve',
          initiative: 'neutral',
          wonDetailLabel: '相手サーブミス',
          lostDetailLabel: '自分のサーブミス',
          skillKey: 'serve_miss',
          skillName: 'サーブ',
        };
      }

      if (r.benchLostSelfMissType === 'receive_miss') {
        const cName = r.benchCourse ? BENCH_COURSE_LABELS[r.benchCourse] : 'コース不明';
        const techName = r.benchLostReceiveTech ? BENCH_LOST_RECEIVE_LABELS[r.benchLostReceiveTech] : 'レシーブ';
        const handName = r.benchLostReceiveHand === 'fore' ? 'フォア' : r.benchLostReceiveHand === 'back' ? 'バック' : '';
        const fullSkill = `${handName}${techName}`;
        return {
          actionLabel: `レシーブミス (${cName}への${fullSkill})`,
          actionCategory: 'receive',
          initiative: 'opp_attack',
          wonDetailLabel: 'レシーブからの得点',
          lostDetailLabel: `レシーブミス (${cName}への${fullSkill})`,
          skillKey: `receive_miss_${r.benchLostReceiveHand || ''}_${r.benchLostReceiveTech || ''}`,
          skillName: `${fullSkill}レシーブ`,
        };
      }

      if (r.benchLostSelfMissType === 'third_ball_miss') {
        const posName = r.benchLostThirdBallPosition ? BENCH_LOST_THIRDBALL_POS_LABELS[r.benchLostThirdBallPosition] : 'フォア';
        const sitName = r.benchLostThirdBallSituation ? BENCH_LOST_THIRDBALL_SITUATION_LABELS[r.benchLostThirdBallSituation] : '対ツッツキ';
        const recCourseName = r.benchLostThirdBallReceiveCourse ? BENCH_COURSE_LABELS[r.benchLostThirdBallReceiveCourse] : '';
        const detailCourse = recCourseName ? ` / 相手${recCourseName}` : '';
        return {
          actionLabel: `３球目攻撃ミス (${posName} / ${sitName}${detailCourse})`,
          actionCategory: 'third_ball',
          initiative: 'self_attack',
          wonDetailLabel: '３球目攻撃得点',
          lostDetailLabel: `３球目攻撃ミス (${posName} / ${sitName}${detailCourse})`,
          skillKey: `third_miss_${r.benchLostThirdBallPosition || 'fore'}_${r.benchLostThirdBallSituation || 'vs_push'}`,
          skillName: `３球目攻撃 (${posName} / ${sitName})`,
        };
      }
    }

    if (r.benchLostCategory === 'service_ace') {
      const cName = r.benchCourse ? BENCH_COURSE_LABELS[r.benchCourse] : 'コース不明';
      return {
        actionLabel: `相手サービスエース (${cName})`,
        actionCategory: 'receive',
        initiative: 'opp_attack',
        wonDetailLabel: 'サービスエース',
        lostDetailLabel: `相手のサービスエース (${cName})`,
        skillKey: `receive_ace_${r.benchCourse || 'other'}`,
        skillName: `${cName}へのレシーブ対応`,
      };
    }

    if (r.benchLostCategory === 'receive_miss') {
      const cName = r.benchCourse ? BENCH_COURSE_LABELS[r.benchCourse] : 'コース不明';
      const techName = r.benchLostReceiveTech ? BENCH_LOST_RECEIVE_LABELS[r.benchLostReceiveTech] : 'レシーブ';
      const handName = r.benchLostReceiveHand === 'fore' ? 'フォア' : r.benchLostReceiveHand === 'back' ? 'バック' : '';
      const fullSkill = `${handName}${techName}`;
      return {
        actionLabel: `レシーブミス (${cName}への${fullSkill})`,
        actionCategory: 'receive',
        initiative: 'opp_attack',
        wonDetailLabel: 'レシーブからの得点',
        lostDetailLabel: `レシーブミス (${cName}への${fullSkill})`,
        skillKey: `receive_miss_${r.benchLostReceiveHand || ''}_${r.benchLostReceiveTech || ''}`,
        skillName: `${fullSkill}レシーブ`,
      };
    }

    if (r.benchLostCategory === 'third_ball_lost') {
      const priorName = r.benchLostPriorReceiveTech ? BENCH_LOST_RECEIVE_LABELS[r.benchLostPriorReceiveTech] : 'ツッツキ';
      const qualityName = r.benchLostReceiveQuality ? BENCH_LOST_RECEIVE_QUALITY_LABELS[r.benchLostReceiveQuality] : '';
      return {
        actionLabel: `相手の３球目攻撃 (${priorName}後 / ${qualityName})`,
        actionCategory: 'receive',
        initiative: 'opp_attack',
        wonDetailLabel: '相手３球目を防いで得点',
        lostDetailLabel: `相手の３球目攻撃 (${priorName}後 / ${qualityName})`,
        skillKey: r.benchLostReceiveQuality === 'floated_chance' ? `floated_${r.benchLostPriorReceiveTech || 'rec'}` : `opp_3rd_${r.benchLostPriorReceiveTech || 'rec'}`,
        skillName: r.benchLostReceiveQuality === 'floated_chance' ? `${priorName}が浮いて被弾` : `${priorName}後の守備`,
      };
    }

    if (r.benchLostCategory === 'rally') {
      const rallyName = r.benchLostRallyType ? BENCH_LOST_RALLY_LABELS[r.benchLostRallyType] : 'ラリー';
      const isSelfAtk = r.benchLostRallyType === 'out_attack_lost' || r.benchLostRallyType === 'self_chance_miss';
      const isOppAtk = r.benchLostRallyType === 'out_defend_lost' || r.benchLostRallyType === 'first_attacked_lost';
      return {
        actionLabel: `ラリー失点 (${rallyName})`,
        actionCategory: 'rally',
        initiative: isSelfAtk ? 'self_attack' : isOppAtk ? 'opp_attack' : 'neutral',
        wonDetailLabel: 'ラリー得点',
        lostDetailLabel: `ラリー失点 (${rallyName})`,
        skillKey: `rally_lost_${r.benchLostRallyType || 'gen'}`,
        skillName: `${rallyName}`,
      };
    }
  }

  // ===========================================================================
  // 2. 過去バージョン または 詳細試合入力からの自動変換
  // ===========================================================================

  // A. サーブミス
  if (r.actionCategory === 'serve_miss') {
    return {
      actionLabel: '自分のサーブミス',
      actionCategory: 'serve',
      initiative: 'neutral',
      wonDetailLabel: '相手サーブミス',
      lostDetailLabel: '自分のサーブミス',
      skillKey: 'serve_miss',
      skillName: 'サーブ',
    };
  }

  // B. 自分のサーブ時
  if (isSelfServe) {
    const serveCourseText = r.serveCourse ? SERVE_COURSE_LABELS[r.serveCourse] : '';
    const serveLenText = r.serveLength === 'short' ? '前' : r.serveLength === 'long' ? 'ロング' : '';
    const serveLabel = serveCourseText ? `${serveCourseText}${serveLenText}サーブ` : '自サーブ';

    // サービスエース
    if (r.actionCategory === 'serve' && isWon) {
      return {
        actionLabel: `サービスエース (${serveLabel})`,
        actionCategory: 'serve',
        initiative: 'self_attack',
        wonDetailLabel: `自分のサービスエース (${serveLabel})`,
        lostDetailLabel: 'サーブ後の失点',
        skillKey: 'serve',
        skillName: serveLabel,
      };
    }

    // 3球目攻撃
    if (r.actionCategory === 'third_ball') {
      const typeText = r.thirdBallType ? THIRD_BALL_TYPE_LABELS[r.thirdBallType] : '3球目攻撃';
      return {
        actionLabel: `３球目攻撃 (${typeText})`,
        actionCategory: 'third_ball',
        initiative: 'self_attack',
        wonDetailLabel: `３球目攻撃 (${typeText})`,
        lostDetailLabel: r.missType ? `３球目攻撃ミス (${typeText})` : '３球目攻撃の失点',
        skillKey: `third_ball_${r.thirdBallType || 'attack'}`,
        skillName: `３球目攻撃 (${typeText})`,
      };
    }
  }

  // C. 相手のサーブ時 (レシーブ)
  if (!isSelfServe) {
    const recTech = r.receiveTechnique ? RECEIVE_TECHNIQUE_LABELS[r.receiveTechnique] : 'レシーブ';
    const sLen = r.serveLength;
    const sCourse = r.serveCourse;

    // レシーブミス判定
    if (r.actionCategory === 'receive' && !isWon) {
      if (sCourse === 'fore' && sLen === 'short') {
        return {
          actionLabel: 'フォア前サーブへのレシーブミス',
          actionCategory: 'receive',
          initiative: 'opp_attack',
          wonDetailLabel: 'フォア前サーブからの得点',
          lostDetailLabel: 'フォア前サーブへのレシーブミス',
          skillKey: 'receive_fore_short',
          skillName: 'フォア前レシーブ',
        };
      }
      if (sCourse === 'back' && sLen === 'long') {
        return {
          actionLabel: 'バックロングサーブへのレシーブミス',
          actionCategory: 'receive',
          initiative: 'opp_attack',
          wonDetailLabel: 'バックロングサーブからの得点',
          lostDetailLabel: 'バックロングサーブへのレシーブミス',
          skillKey: 'receive_back_long',
          skillName: 'バックロングレシーブ',
        };
      }
      return {
        actionLabel: `${recTech}レシーブミス`,
        actionCategory: 'receive',
        initiative: 'opp_attack',
        wonDetailLabel: `${recTech}からの得点`,
        lostDetailLabel: `${recTech}レシーブミス`,
        skillKey: `receive_${r.receiveTechnique || 'other'}`,
        skillName: `${recTech}レシーブ`,
      };
    }

    // レシーブから得点
    if (r.actionCategory === 'receive' && isWon) {
      if (r.receiveTechnique === 'chiquita' || r.receiveTechnique === 'flick' || r.receiveTechnique === 'drive') {
        return {
          actionLabel: `レシーブ攻撃 (${recTech})`,
          actionCategory: 'receive',
          initiative: 'self_attack',
          wonDetailLabel: `レシーブ攻撃 (${recTech})`,
          lostDetailLabel: 'レシーブ攻撃ミス',
          skillKey: `receive_${r.receiveTechnique}`,
          skillName: `${recTech}攻撃`,
        };
      }
      if (r.receiveTechnique === 'push' || r.receiveTechnique === 'stop') {
        return {
          actionLabel: `ツッツキ・ストップで崩す`,
          actionCategory: 'receive',
          initiative: 'neutral',
          wonDetailLabel: 'ツッツキ・ストップ後に相手ミス',
          lostDetailLabel: 'ツッツキ・ストップ後の失点',
          skillKey: 'push_stop',
          skillName: 'ツッツキ・ストップ',
        };
      }
      if (r.receiveTechnique === 'sink') {
        return {
          actionLabel: '流しレシーブで崩す',
          actionCategory: 'receive',
          initiative: 'neutral',
          wonDetailLabel: '流しレシーブで相手ミス誘発',
          lostDetailLabel: '流しレシーブ後の失点',
          skillKey: 'sink_receive',
          skillName: '流しレシーブ',
        };
      }
    }
  }

  // D. ラリー
  if (r.actionCategory === 'rally') {
    const rType = r.rallyType ? RALLY_TYPE_LABELS[r.rallyType] : 'ラリー';
    const isSelfAtk = r.rallyType === 'attack' || r.rallyType === 'chance_ball';
    const isOppAtk = r.rallyType === 'block' || r.rallyType === 'defense';

    return {
      actionLabel: `ラリー展開 (${rType})`,
      actionCategory: 'rally',
      initiative: isSelfAtk ? 'self_attack' : isOppAtk ? 'opp_attack' : 'neutral',
      wonDetailLabel: isWon ? `ラリー得点 (${rType})` : 'ラリー失点',
      lostDetailLabel: !isWon ? `ラリー失点 (${rType})` : 'ラリー得点',
      skillKey: `rally_${r.rallyType || 'general'}`,
      skillName: `${rType}ラリー`,
    };
  }

  // E. 凡ミス / 不明
  if (!isWon && r.missType) {
    return {
      actionLabel: '自滅・凡ミス',
      actionCategory: 'unforced',
      initiative: 'neutral',
      wonDetailLabel: '相手の凡ミス',
      lostDetailLabel: `自分の凡ミス (${MISS_TYPE_LABELS[r.missType] || 'ミス'})`,
      skillKey: 'unforced_error',
      skillName: 'イージーミス',
    };
  }

  return {
    actionLabel: isWon ? '相手の凡ミス・得点' : '失点',
    actionCategory: 'other',
    initiative: 'neutral',
    wonDetailLabel: '相手の凡ミス・得点',
    lostDetailLabel: '相手攻撃・その他失点',
  };
}

// =============================================================================
// 指定されたラリー配列からセット/通算のベンチ分析を算出する関数 (母数集計)
// =============================================================================

function analyzeRallySubset(rallies: Rally[], setNumber: number): SetBenchAnalysis {
  const totalPoints = rallies.length;
  let wonPoints = 0;
  let lostPoints = 0;

  // 1. 大分類・展開別の集計バッファ
  let recTotal = 0;
  let recDirectWon = 0;
  let recDirectLost = 0;

  let serveTotal = 0;
  let serveAces = 0;
  let serveMisses = 0;
  let oppRecAttacks = 0;
  let thirdBallWonCount = 0;
  let thirdBallLostCount = 0;

  let rallyWonCount = 0;
  let rallyLostCount = 0;

  // 2. 対をなす戦術行動マップ (得点と失点の合計を母数として算出)
  const tacticalMap = new Map<
    string,
    {
      id: string;
      name: string;
      category: 'serve' | 'receive' | 'third_ball' | 'rally' | 'unforced' | 'other';
      won: number;
      lost: number;
      winAdvice: string;
      lossAdvice: string;
    }
  >();

  const addTactical = (
    id: string,
    name: string,
    category: 'serve' | 'receive' | 'third_ball' | 'rally' | 'unforced' | 'other',
    isWon: boolean,
    winAdvice: string,
    lossAdvice: string
  ) => {
    const cur = tacticalMap.get(id) || {
      id,
      name,
      category,
      won: 0,
      lost: 0,
      winAdvice,
      lossAdvice,
    };
    if (isWon) cur.won++;
    else cur.lost++;
    tacticalMap.set(id, cur);
  };

  // 3. スキル失敗率の集計
  const skillAttempts = new Map<string, { name: string; total: number; miss: number }>();

  // 4. 先手攻撃 / 先手被攻撃
  let selfInitTotal = 0;
  let selfInitWon = 0;
  let oppInitTotal = 0;
  let oppInitWon = 0;

  // 5. 内訳マップ
  const wonMap = new Map<string, { count: number; color: string }>();
  const lostMap = new Map<string, { count: number; color: string }>();

  for (const r of rallies) {
    const isWon = r.result === 'won';
    const isSelfServe = r.server === 'self';

    if (isWon) wonPoints++;
    else lostPoints++;

    const parsed = parseRallyToBenchData(r);

    // -------------------------------------------------------------------------
    // A. 展開別 (Receive, Serve, Rally) の母数集計
    // -------------------------------------------------------------------------
    if (!isSelfServe || r.benchWonCategory === 'receive' || r.benchLostCategory === 'receive_miss' || r.benchLostCategory === 'third_ball_lost') {
      recTotal++;
      if (r.benchWonCategory === 'receive' || (r.actionCategory === 'receive' && isWon)) {
        recDirectWon++;
      } else if (
        r.benchLostCategory === 'receive_miss' ||
        (r.benchLostCategory === 'self_miss' && r.benchLostSelfMissType === 'receive_miss') ||
        (r.actionCategory === 'receive' && !isWon)
      ) {
        recDirectLost++;
      }
    }

    if (isSelfServe || r.benchWonCategory === 'service_ace' || r.benchLostCategory === 'opp_receive_attack' || (r.benchLostCategory === 'self_miss' && r.benchLostSelfMissType === 'serve_miss')) {
      serveTotal++;
      if (r.benchWonCategory === 'service_ace' || (r.actionCategory === 'serve' && isWon)) {
        serveAces++;
      } else if (
        r.benchLostCategory === 'serve_miss' ||
        (r.benchLostCategory === 'self_miss' && r.benchLostSelfMissType === 'serve_miss') ||
        r.actionCategory === 'serve_miss'
      ) {
        serveMisses++;
      } else if (r.benchLostCategory === 'opp_receive_attack') {
        oppRecAttacks++;
      }

      if (r.benchWonCategory === 'third_ball' || (r.actionCategory === 'third_ball' && isWon)) {
        thirdBallWonCount++;
      } else if (
        (r.benchLostCategory === 'self_miss' && r.benchLostSelfMissType === 'third_ball_miss') ||
        (r.actionCategory === 'third_ball' && !isWon)
      ) {
        thirdBallLostCount++;
      }
    }

    if (r.benchWonCategory === 'rally' || r.actionCategory === 'rally') {
      if (isWon) rallyWonCount++;
    }
    if (r.benchLostCategory === 'rally' || (!isWon && r.actionCategory === 'rally')) {
      rallyLostCount++;
    }

    // -------------------------------------------------------------------------
    // B. 対をなす戦術行動 (Tactical Action Pairs) の集計
    // -------------------------------------------------------------------------

    // 1. ラリー戦術ペア
    if (r.benchWonCategory === 'rally' || r.benchLostCategory === 'rally' || r.actionCategory === 'rally') {
      // ラリー全体
      addTactical(
        'rally_phase_all',
        'ラリー戦全体',
        'rally',
        isWon,
        'ラリー戦で優勢に得点できている！ラリーに持ち込もう',
        'ラリー戦での失点が多い。コース配球と繋ぎを意識しよう'
      );

      // 強打・打ち合い
      if (r.benchWonRallyType === 'out_attack' || r.benchLostRallyType === 'out_attack_lost') {
        addTactical(
          'rally_out_attack',
          'ラリー（強打・打ち合い）',
          'rally',
          isWon,
          '強打の打ち合いで打ち勝てている！自信を持って振り抜こう',
          '強打の打ち合いで打ち負けている。打点を落として繋ぐかコースを突こう'
        );
      }

      // 先手攻撃争い
      if (r.benchWonRallyType === 'first_attack' || r.benchLostRallyType === 'first_attacked_lost') {
        addTactical(
          'rally_first_attack',
          'ラリー（先手攻撃争い）',
          'rally',
          isWon,
          '先に攻めて高確率で得点できている！積極的に先手を取ろう',
          '先に攻められて失点している。台上で短く止めるか厳しく送ろう'
        );
      }

      // ブロック・守備
      if (r.benchWonRallyType === 'out_defend' || r.benchLostRallyType === 'out_defend_lost') {
        addTactical(
          'rally_out_defend',
          'ラリー（ブロック・守備）',
          'rally',
          isWon,
          '相手の攻撃をブロック・守備から得点できている！',
          '相手の攻撃を守りきれず失点している。コースを突いてブロックしよう'
        );
      }

      // 入れあい・繋ぎ
      if (r.benchWonRallyType === 'out_rally' || r.benchLostRallyType === 'out_rally_lost') {
        addTactical(
          'rally_out_rally',
          'ラリー（入れあい・繋ぎ）',
          'rally',
          isWon,
          'ラリーの粘り・入れあいで優位に立っている！',
          'ラリーの入れあいでミスが出ている。焦らず台に入れよう'
        );
      }

      // 台上ラリー
      if (r.benchWonRallyType === 'on_table' || r.benchLostRallyType === 'on_table') {
        addTactical(
          'rally_on_table',
          '台上ラリー戦',
          'rally',
          isWon,
          '台上戦で主導権を握れている！',
          '台上戦での失点に注意。無理せず深く送ろう'
        );
      }

      // チャンスボール
      if (r.benchWonRallyType === 'opp_chance_miss' || r.benchLostRallyType === 'self_chance_miss') {
        addTactical(
          'rally_chance_ball',
          'チャンスボール処理',
          'rally',
          isWon,
          'チャンスボールで確実に得点できている！',
          'チャンスボールでのミスが出ている！確実にコースへ決めよう'
        );
      }
    }

    // 2. ３球目攻撃ペア
    if (
      r.benchWonCategory === 'third_ball' ||
      (r.benchLostCategory === 'self_miss' && r.benchLostSelfMissType === 'third_ball_miss') ||
      r.actionCategory === 'third_ball'
    ) {
      addTactical(
        'third_ball_all',
        '３球目攻撃全体',
        'third_ball',
        isWon,
        '３球目攻撃が効果的！積極的に自発先手を仕掛けよう',
        '３球目攻撃のミスが出ている。無理な強打を控え回転をかけよう'
      );

      // 対ツッツキ
      if (r.benchWonThirdBallType === 'vs_push' || r.benchLostThirdBallSituation === 'vs_push') {
        addTactical(
          '3rd_vs_push',
          '３球目攻撃（対ツッツキ）',
          'third_ball',
          isWon,
          '下回転に対する3球目ドライブが抜群に効いている！',
          '対ツッツキの3球目ドライブでミスが出ている。回転をかけて安全に攻めよう'
        );
      }

      // 対上回転
      if (r.benchWonThirdBallType === 'vs_topspin' || r.benchLostThirdBallSituation === 'vs_topspin') {
        addTactical(
          '3rd_vs_topspin',
          '３球目攻撃（対上回転）',
          'third_ball',
          isWon,
          '上回転レシーブへのカウンター・叩きが冴えている！',
          '上回転レシーブに振り遅れている。打点を前で捉えよう'
        );
      }

      // サーブでチャンス
      if (r.benchWonThirdBallType === 'chance_from_serve' || r.benchLostThirdBallSituation === 'chance_from_serve') {
        addTactical(
          '3rd_chance',
          '３球目攻撃（浮き球チャンス）',
          'third_ball',
          isWon,
          'サーブで崩してのスマッシュ・強打が確実に決まっている！',
          '浮いたチャンスボールでのミスに注意。コースを狙おう'
        );
      }
    }

    // 3. レシーブ技術ペア
    if (r.benchWonReceiveTech || r.benchLostReceiveTech || r.benchLostPriorReceiveTech || (!isSelfServe && r.actionCategory === 'receive')) {
      // ツッツキ
      const isPushWon = r.benchWonReceiveTech === 'push';
      const isPushLost =
        (r.benchLostCategory === 'self_miss' && r.benchLostReceiveTech === 'push') ||
        r.benchLostPriorReceiveTech === 'push';
      if (isPushWon || isPushLost) {
        addTactical(
          'rec_push',
          'レシーブ（ツッツキ）',
          'receive',
          isWon,
          'ツッツキレシーブで相手を崩せている！深く送ろう',
          'ツッツキレシーブが甘くなって打たれている・ミスが出ている'
        );
      }

      // ストップ
      const isStopWon = r.benchWonReceiveTech === 'stop';
      const isStopLost =
        (r.benchLostCategory === 'self_miss' && r.benchLostReceiveTech === 'stop') ||
        r.benchLostPriorReceiveTech === 'stop';
      if (isStopWon || isStopLost) {
        addTactical(
          'rec_stop',
          'レシーブ（ストップ）',
          'receive',
          isWon,
          'ストップで相手の先手を封じられている！',
          'ストップが浮いて打たれている・ネットミスに注意'
        );
      }

      // フリック
      const isFlickWon = r.benchWonReceiveTech === 'flick';
      const isFlickLost =
        (r.benchLostCategory === 'self_miss' && r.benchLostReceiveTech === 'flick') ||
        r.benchLostPriorReceiveTech === 'flick';
      if (isFlickWon || isFlickLost) {
        addTactical(
          'rec_flick',
          'レシーブ（フリック攻撃）',
          'receive',
          isWon,
          'フリックレシーブから主導権を握れている！迷わず振ろう',
          'フリックレシーブでのミス・被弾が多い。コースを突こう'
        );
      }

      // 流し
      const isSinkWon = r.benchWonReceiveTech === 'sink';
      const isSinkLost =
        (r.benchLostCategory === 'self_miss' && r.benchLostReceiveTech === 'sink') ||
        r.benchLostPriorReceiveTech === 'sink';
      if (isSinkWon || isSinkLost) {
        addTactical(
          'rec_sink',
          'レシーブ（流し）',
          'receive',
          isWon,
          '流しレシーブで相手の逆を突けている！',
          '流しレシーブが読まれている。配球を散らそう'
        );
      }

      // ドライブ / 強打 / 軽打
      const isDvrWon = r.benchWonReceiveTech === 'floated_opp_error';
      const isDvrLost =
        (r.benchLostCategory === 'self_miss' && (r.benchLostReceiveTech === 'drive' || r.benchLostReceiveTech === 'smash' || r.benchLostReceiveTech === 'light_hit')) ||
        r.benchLostPriorReceiveTech === 'drive' ||
        r.benchLostPriorReceiveTech === 'light_hit';
      if (isDvrWon || isDvrLost) {
        addTactical(
          'rec_attack',
          'レシーブ（強打・ドライブ）',
          'receive',
          isWon,
          'レシーブからの強打が決まっている！',
          'レシーブ強打でのミスが多い。まずは台に入れよう'
        );
      }
    }

    // 4. 自サーブのコース別得失点
    if (isSelfServe && r.benchCourse && r.benchCourse !== 'unknown') {
      const cName = BENCH_COURSE_LABELS[r.benchCourse];
      addTactical(
        `serve_course_${r.benchCourse}`,
        `自サーブ（${cName}）`,
        'serve',
        isWon,
        `${cName}サーブからの展開で高得点率！勝負所で使おう`,
        `${cName}サーブが狙われている・レシーブから攻められている`
      );
    }

    // 5. 相手サーブのコース別対応得失点
    if (!isSelfServe && r.benchCourse && r.benchCourse !== 'unknown') {
      const cName = BENCH_COURSE_LABELS[r.benchCourse];
      addTactical(
        `opp_serve_course_${r.benchCourse}`,
        `相手${cName}サーブへの対応`,
        'receive',
        isWon,
        `相手の${cName}サーブを攻略できている！`,
        `相手の${cName}サーブに苦戦している。待ちを意識しよう`
      );
    }

    // -------------------------------------------------------------------------
    // C. スキル失敗集計
    // -------------------------------------------------------------------------
    if (parsed.skillKey && parsed.skillName) {
      const sk = skillAttempts.get(parsed.skillKey) || { name: parsed.skillName, total: 0, miss: 0 };
      sk.total++;
      if (!isWon) sk.miss++;
      skillAttempts.set(parsed.skillKey, sk);
    }

    // -------------------------------------------------------------------------
    // D. 先手集計
    // -------------------------------------------------------------------------
    if (parsed.initiative === 'self_attack') {
      selfInitTotal++;
      if (isWon) selfInitWon++;
    } else if (parsed.initiative === 'opp_attack') {
      oppInitTotal++;
      if (isWon) oppInitWon++;
    }

    // -------------------------------------------------------------------------
    // E. 内訳集計
    // -------------------------------------------------------------------------
    if (isWon) {
      const label = parsed.wonDetailLabel;
      const color =
        parsed.actionCategory === 'serve'
          ? '#10b981'
          : parsed.actionCategory === 'third_ball'
          ? '#3b82f6'
          : parsed.actionCategory === 'receive'
          ? '#06b6d4'
          : '#8b5cf6';
      const cur = wonMap.get(label) || { count: 0, color };
      cur.count++;
      wonMap.set(label, cur);
    } else {
      const label = parsed.lostDetailLabel;
      const color =
        parsed.actionCategory === 'serve'
          ? '#ef4444'
          : parsed.actionCategory === 'third_ball'
          ? '#f43f5e'
          : parsed.actionCategory === 'receive'
          ? '#f59e0b'
          : '#ec4899';
      const cur = lostMap.get(label) || { count: 0, color };
      cur.count++;
      lostMap.set(label, cur);
    }
  }

  // ===========================================================================
  // 大分類・展開別のサマリー生成
  // ===========================================================================
  const receiveSummary: ReceivePhaseSummary = {
    total: recTotal,
    directWon: recDirectWon,
    directLost: recDirectLost,
    rallyContinued: Math.max(0, recTotal - recDirectWon - recDirectLost),
    directWinRate: recTotal > 0 ? Math.round((recDirectWon / recTotal) * 100) : 0,
    directLossRate: recTotal > 0 ? Math.round((recDirectLost / recTotal) * 100) : 0,
    continueRate: recTotal > 0 ? Math.round((Math.max(0, recTotal - recDirectWon - recDirectLost) / recTotal) * 100) : 0,
  };

  const thirdBallAttacksTotal = thirdBallWonCount + thirdBallLostCount;
  const serveSummary: ServePhaseSummary = {
    total: serveTotal,
    serviceAces: serveAces,
    serveMisses,
    oppReceiveAttacks: oppRecAttacks,
    thirdBallAttacks: thirdBallAttacksTotal,
    thirdBallWon: thirdBallWonCount,
    thirdBallLost: thirdBallLostCount,
    rallyContinued: Math.max(0, serveTotal - serveAces - serveMisses - oppRecAttacks - thirdBallAttacksTotal),
    serviceAceRate: serveTotal > 0 ? Math.round((serveAces / serveTotal) * 100) : 0,
    serveMissRate: serveTotal > 0 ? Math.round((serveMisses / serveTotal) * 100) : 0,
    oppReceiveAttackRate: serveTotal > 0 ? Math.round((oppRecAttacks / serveTotal) * 100) : 0,
    thirdBallWinRate: thirdBallAttacksTotal > 0 ? Math.round((thirdBallWonCount / thirdBallAttacksTotal) * 100) : 0,
  };

  const rallyTotal = rallyWonCount + rallyLostCount;
  const rallySummary: RallyPhaseSummary = {
    total: rallyTotal,
    won: rallyWonCount,
    lost: rallyLostCount,
    winRate: rallyTotal > 0 ? Math.round((rallyWonCount / rallyTotal) * 100) : 0,
    lossRate: rallyTotal > 0 ? Math.round((rallyLostCount / rallyTotal) * 100) : 0,
  };

  // ===========================================================================
  // 1. 得点率が高い行動 (母数 = 得点 + 失点)
  // ===========================================================================
  const topWinningActions: ActionImpactItem[] = Array.from(tacticalMap.values())
    .map((item) => {
      const total = item.won + item.lost;
      const winRate = total > 0 ? Math.round((item.won / total) * 100) : 0;
      const lossRate = 100 - winRate;
      return {
        id: item.id,
        name: item.name,
        detail: `${total}本中 ${item.won}点獲得 (${winRate}%) [得点 ${item.won} / 失点 ${item.lost}]`,
        category: item.category,
        total,
        won: item.won,
        lost: item.lost,
        winRate,
        lossRate,
        adviceType: 'keep' as const,
        adviceMessage: winRate >= 70 ? '非常に効果的！最優先で続けるべき' : item.winAdvice,
      };
    })
    .filter((a) => a.total >= 1 && a.winRate >= 50)
    .sort((a, b) => (b.winRate !== a.winRate ? b.winRate - a.winRate : b.total - a.total));

  // ===========================================================================
  // 2. 失点率が高い行動 (母数 = 得点 + 失点)
  // ===========================================================================
  const topLosingActions: ActionImpactItem[] = Array.from(tacticalMap.values())
    .map((item) => {
      const total = item.won + item.lost;
      const winRate = total > 0 ? Math.round((item.won / total) * 100) : 0;
      const lossRate = total > 0 ? Math.round((item.lost / total) * 100) : 0;
      return {
        id: item.id,
        name: item.name,
        detail: `${total}本中 ${item.lost}失点 (${lossRate}%) [失点 ${item.lost} / 得点 ${item.won}]`,
        category: item.category,
        total,
        won: item.won,
        lost: item.lost,
        winRate,
        lossRate,
        adviceType: 'stop' as const,
        adviceMessage: item.lossAdvice,
      };
    })
    .filter((a) => a.total >= 1 && a.lossRate >= 50)
    .sort((a, b) => (b.lossRate !== a.lossRate ? b.lossRate - a.lossRate : b.total - a.total));

  // ===========================================================================
  // 3. ミスが多い技術の失敗率
  // ===========================================================================
  const topSkillFailures: SkillFailureItem[] = Array.from(skillAttempts.values())
    .filter((s) => s.miss >= 1)
    .map((s) => {
      const failureRate = Math.round((s.miss / s.total) * 100);
      let advice = '無理に入れにいかず、打点を落として回転をかける';
      if (failureRate >= 60) advice = '失敗率が高い！このセットは無理に打たず繋ぐ意識を持つ';
      else if (s.name.includes('レシーブ')) advice = 'レシーブを深く送るかストップで短く止める';

      return {
        id: s.name,
        skillName: s.name,
        missCount: s.miss,
        totalAttempts: s.total,
        failureRate,
        adviceMessage: advice,
      };
    })
    .sort((a, b) => (b.failureRate !== a.failureRate ? b.failureRate - a.failureRate : b.missCount - a.missCount));

  // ===========================================================================
  // 4. 先手を取りに行った際の得点率
  // ===========================================================================
  const selfInitWinRate = selfInitTotal > 0 ? Math.round((selfInitWon / selfInitTotal) * 100) : 0;
  let selfEval = '自発攻撃機会なし';
  let selfAdvice = '攻められるボールは積極的に先手を取ろう';
  if (selfInitTotal > 0) {
    if (selfInitWinRate >= 65) {
      selfEval = '攻めが圧倒的に優勢！';
      selfAdvice = '先手を取れば高確率で点になる。迷わず自分から攻め続けよう！';
    } else if (selfInitWinRate >= 45) {
      selfEval = '攻防拮抗';
      selfAdvice = '無理な強打を控え、厳しいコースへ安全に先手を取ろう。';
    } else {
      selfEval = '無理攻めによる自滅注意';
      selfAdvice = '攻め急いでミスが出ている。ツッツキやストップで崩してから仕掛けよう。';
    }
  }

  const selfInitiative: InitiativeStats = {
    total: selfInitTotal,
    won: selfInitWon,
    lost: selfInitTotal - selfInitWon,
    winRate: selfInitWinRate,
    evaluation: selfEval,
    advice: selfAdvice,
  };

  // ===========================================================================
  // 5. 先手を取られた際の得点率
  // ===========================================================================
  const oppInitWinRate = oppInitTotal > 0 ? Math.round((oppInitWon / oppInitTotal) * 100) : 0;
  let oppEval = '相手の先手機会なし';
  let oppAdvice = '相手に攻めさせない配球をキープしよう';
  if (oppInitTotal > 0) {
    if (oppInitWinRate >= 50) {
      oppEval = 'ブロック・カウンターで粘れている';
      oppAdvice = '相手に打たせても守備から得点できている。落ち着いてコースを突こう。';
    } else {
      oppEval = '相手先手からの失点が多い';
      oppAdvice = '相手に甘い球を打たれている。ツッツキを深く切るか、先手を渡さない工夫を！';
    }
  }

  const oppInitiative: InitiativeStats = {
    total: oppInitTotal,
    won: oppInitWon,
    lost: oppInitTotal - oppInitWon,
    winRate: oppInitWinRate,
    evaluation: oppEval,
    advice: oppAdvice,
  };

  // ===========================================================================
  // 6. 全得点の内訳
  // ===========================================================================
  const wonBreakdown: PointBreakdownItem[] = Array.from(wonMap.entries())
    .map(([label, val]) => ({
      id: label,
      label,
      count: val.count,
      percentage: wonPoints > 0 ? Math.round((val.count / wonPoints) * 100) : 0,
      categoryColor: val.color,
    }))
    .sort((a, b) => b.count - a.count);

  // ===========================================================================
  // 7. 全失点の内訳
  // ===========================================================================
  const lostBreakdown: PointBreakdownItem[] = Array.from(lostMap.entries())
    .map(([label, val]) => ({
      id: label,
      label,
      count: val.count,
      percentage: lostPoints > 0 ? Math.round((val.count / lostPoints) * 100) : 0,
      categoryColor: val.color,
    }))
    .sort((a, b) => b.count - a.count);

  // ===========================================================================
  // 1分間アドバイス ハイライト作成
  // ===========================================================================
  const bestWinAct = topWinningActions[0];
  const worstLossAct = topLosingActions[0];
  const quickAdvice = {
    keep: bestWinAct
      ? `【継続】${bestWinAct.name} が効いている！（得点率 ${bestWinAct.winRate}%: ${bestWinAct.won}/${bestWinAct.total}本）`
      : '【継続】丁寧なラリーで相手のミスを誘おう',
    stop: worstLossAct
      ? `【注意】${worstLossAct.name} での失点を防ぐ！（失点率 ${worstLossAct.lossRate}%: ${worstLossAct.lost}/${worstLossAct.total}本）`
      : '【注意】甘い返球を避けて深く送ろう',
    clutch:
      selfInitWinRate >= 60
        ? 'チャンスボールは自信を持って先手攻撃！'
        : '無理に打ち込まず、コースを突いてチャンスを待とう',
  };

  return {
    setNumber,
    totalPoints,
    wonPoints,
    lostPoints,
    winRate: totalPoints > 0 ? Math.round((wonPoints / totalPoints) * 100) : 0,
    receiveSummary,
    serveSummary,
    rallySummary,
    topWinningActions,
    topLosingActions,
    topSkillFailures,
    selfInitiative,
    oppInitiative,
    wonBreakdown,
    lostBreakdown,
    quickAdvice,
  };
}

// =============================================================================
// 全体のベンチコーチ分析サマリーを計算するメインエクスポート
// =============================================================================

export function calculateBenchAnalytics(
  rallies: Rally[],
  activeSetNumber?: number
): BenchCoachAnalysisSummary {
  if (!rallies || rallies.length === 0) {
    const emptySet = analyzeRallySubset([], 1);
    return {
      hasData: false,
      totalSets: 0,
      latestSetNumber: 1,
      latestSet: null,
      bySet: {},
      fullMatch: emptySet,
      trendChanges: [],
      clutchServe: null,
    };
  }

  // ゲームごとにグループ化
  const setMap = new Map<number, Rally[]>();
  let maxSetNum = 1;

  for (const r of rallies) {
    const g = r.gameNumber || 1;
    if (g > maxSetNum) maxSetNum = g;
    const list = setMap.get(g) || [];
    list.push(r);
    setMap.set(g, list);
  }

  // 直前のセット番号
  const latestSetNum = activeSetNumber && setMap.has(activeSetNumber) ? activeSetNumber : maxSetNum;

  // 各セットの分析
  const bySet: Record<number, SetBenchAnalysis> = {};
  setMap.forEach((rList, setNum) => {
    bySet[setNum] = analyzeRallySubset(rList, setNum);
  });

  const latestSet = bySet[latestSetNum] || analyzeRallySubset(rallies, latestSetNum);
  const fullMatch = analyzeRallySubset(rallies, 0);

  // ===========================================================================
  // 序盤 vs 直前セットの変化・トレンド (Trend Changes)
  // ===========================================================================
  const trendChanges: TrendChangeItem[] = [];

  if (maxSetNum >= 2) {
    const earlyRallies = rallies.filter(
      (r) => r.gameNumber === 1 || (maxSetNum >= 3 && r.gameNumber <= 2 && r.gameNumber < latestSetNum)
    );
    const latestRallies = setMap.get(latestSetNum) || [];

    const earlyActs = new Map<string, { total: number; won: number }>();
    for (const r of earlyRallies) {
      const p = parseRallyToBenchData(r);
      const cur = earlyActs.get(p.actionLabel) || { total: 0, won: 0 };
      cur.total++;
      if (r.result === 'won') cur.won++;
      earlyActs.set(p.actionLabel, cur);
    }

    const latestActs = new Map<string, { total: number; won: number }>();
    for (const r of latestRallies) {
      const p = parseRallyToBenchData(r);
      const cur = latestActs.get(p.actionLabel) || { total: 0, won: 0 };
      cur.total++;
      if (r.result === 'won') cur.won++;
      latestActs.set(p.actionLabel, cur);
    }

    earlyActs.forEach((early, actName) => {
      const latest = latestActs.get(actName);
      if (early.total >= 2 && latest && latest.total >= 1) {
        const earlyRate = Math.round((early.won / early.total) * 100);
        const latestRate = Math.round((latest.won / latest.total) * 100);
        const diff = latestRate - earlyRate;

        if (earlyRate >= 60 && latestRate <= 40 && diff <= -25) {
          trendChanges.push({
            id: actName,
            actionName: actName,
            earlyTotal: early.total,
            earlyWon: early.won,
            earlyWinRate: earlyRate,
            latestTotal: latest.total,
            latestWon: latest.won,
            latestWinRate: latestRate,
            rateDiff: diff,
            warningMessage: `序盤は得点率${earlyRate}%と有効でしたが、第${latestSetNum}セットでは${latestRate}%に低下。相手が読んでいるためコースや緩急を変えましょう！`,
          });
        }
      }
    });
  }

  // ===========================================================================
  // 1番得点率の高いサーブ (Clutch Serve Recommendation)
  // ===========================================================================
  let clutchServe: ClutchServeRecommendation | null = null;
  const selfServeRallies = rallies.filter((r) => r.server === 'self');

  if (selfServeRallies.length > 0) {
    const serveMap = new Map<string, { total: number; won: number }>();

    for (const r of selfServeRallies) {
      let key = '';
      if (r.benchCourse && r.benchCourse !== 'unknown') {
        key = `${BENCH_COURSE_LABELS[r.benchCourse]}サーブ`;
      } else if (r.serveCourse && r.serveLength) {
        key = `${getServe8WayLabel(r.serveLength, r.serveCourse)}サーブ`;
      } else if (r.serveCourse) {
        key = `${SERVE_COURSE_LABELS[r.serveCourse]}サーブ`;
      } else if (r.benchActionDetail && r.benchActionDetail.includes('サーブ')) {
        key = r.benchActionDetail;
      }

      if (key) {
        const cur = serveMap.get(key) || { total: 0, won: 0 };
        cur.total++;
        if (r.result === 'won') cur.won++;
        serveMap.set(key, cur);
      }
    }

    const validServes = Array.from(serveMap.entries())
      .map(([name, val]) => ({
        serveName: name,
        total: val.total,
        won: val.won,
        winRate: Math.round((val.won / val.total) * 100),
      }))
      .filter((s) => s.total >= 1)
      .sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.total - a.total;
      });

    if (validServes.length > 0 && validServes[0].winRate >= 50) {
      const best = validServes[0];
      clutchServe = {
        serveName: best.serveName,
        total: best.total,
        won: best.won,
        winRate: best.winRate,
        recommendationReason: `試合通算で ${best.total}本中 ${best.won}本得点（得点率 ${best.winRate}%）。デュースや勝負所で迷わず出すべき必勝サーブ！`,
      };
    }
  }

  return {
    hasData: true,
    totalSets: maxSetNum,
    latestSetNumber: latestSetNum,
    latestSet,
    bySet,
    fullMatch,
    trendChanges,
    clutchServe,
  };
}
