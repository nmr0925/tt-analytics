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
  BENCH_LOST_RECEIVE_LABELS,
  BENCH_LOST_RECEIVE_QUALITY_LABELS,
  BENCH_LOST_RALLY_LABELS,
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

export interface SetBenchAnalysis {
  setNumber: number;
  totalPoints: number;
  wonPoints: number;
  lostPoints: number;
  winRate: number;

  // 1. 得点率が高い行動 (効いている・続けるべき)
  topWinningActions: ActionImpactItem[];

  // 2. 失点率が高い行動 (やめる・意識して待つ・対処すべき)
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
        actionLabel: `レシーブ (${techName} → ${cName})`,
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
      const isSelfAtk = r.benchWonRallyType === 'out_attack';
      const isOppAtk = r.benchWonRallyType === 'out_defend';
      return {
        actionLabel: `ラリー (${rallyName})`,
        actionCategory: 'rally',
        initiative: isSelfAtk ? 'self_attack' : isOppAtk ? 'opp_attack' : 'neutral',
        wonDetailLabel: `ラリー得点 (${rallyName})`,
        lostDetailLabel: 'ラリー失点',
        skillKey: `rally_${r.benchWonRallyType || 'general'}`,
        skillName: `${rallyName}ラリー`,
      };
    }
  }

  // 失点時の各カテゴリ
  if (!isWon && r.benchLostCategory) {
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
        lostDetailLabel: `${cName}へのレシーブミス (${fullSkill})`,
        skillKey: `receive_miss_${r.benchLostReceiveHand || ''}_${r.benchLostReceiveTech || ''}`,
        skillName: `${fullSkill}レシーブ`,
      };
    }

    if (r.benchLostCategory === 'third_ball_lost') {
      const priorName = r.benchLostPriorReceiveTech ? BENCH_LOST_RECEIVE_LABELS[r.benchLostPriorReceiveTech] : 'ツッツキ';
      const qualityName = r.benchLostReceiveQuality ? BENCH_LOST_RECEIVE_QUALITY_LABELS[r.benchLostReceiveQuality] : '';
      return {
        actionLabel: `相手の３球目強打 (${priorName}後 / ${qualityName})`,
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
      const isOppAtk = r.benchLostRallyType === 'out_defend_lost';
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
      actionLabel: 'サーブミス',
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
        lostDetailLabel: r.missType ? `３球目${typeText}ミス (無理攻め)` : '３球目攻撃の失点',
        skillKey: `third_ball_${r.thirdBallType || 'attack'}`,
        skillName: `３球目${typeText}`,
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
// 指定されたラリー配列からセット/通算のベンチ分析を算出する関数
// =============================================================================

function analyzeRallySubset(rallies: Rally[], setNumber: number): SetBenchAnalysis {
  const totalPoints = rallies.length;
  let wonPoints = 0;
  let lostPoints = 0;

  // アクションごとの集計
  const actionMap = new Map<string, {
    name: string;
    category: 'serve' | 'receive' | 'third_ball' | 'rally' | 'unforced' | 'other';
    total: number;
    won: number;
    lost: number;
  }>();

  // スキル失敗率の集計
  const skillAttempts = new Map<string, { name: string; total: number; miss: number }>();

  // 先手攻撃 / 先手被攻撃
  let selfInitTotal = 0;
  let selfInitWon = 0;
  let oppInitTotal = 0;
  let oppInitWon = 0;

  // 得点内訳マップ
  const wonMap = new Map<string, { count: number; color: string }>();
  // 失点内訳マップ
  const lostMap = new Map<string, { count: number; color: string }>();

  for (const r of rallies) {
    const isWon = r.result === 'won';
    if (isWon) wonPoints++;
    else lostPoints++;

    const parsed = parseRallyToBenchData(r);

    // アクション集計
    const act = actionMap.get(parsed.actionLabel) || {
      name: parsed.actionLabel,
      category: parsed.actionCategory,
      total: 0,
      won: 0,
      lost: 0,
    };
    act.total++;
    if (isWon) act.won++;
    else act.lost++;
    actionMap.set(parsed.actionLabel, act);

    // スキル失敗集計
    if (parsed.skillKey && parsed.skillName) {
      const sk = skillAttempts.get(parsed.skillKey) || { name: parsed.skillName, total: 0, miss: 0 };
      sk.total++;
      if (!isWon) sk.miss++;
      skillAttempts.set(parsed.skillKey, sk);
    }

    // 先手集計
    if (parsed.initiative === 'self_attack') {
      selfInitTotal++;
      if (isWon) selfInitWon++;
    } else if (parsed.initiative === 'opp_attack') {
      oppInitTotal++;
      if (isWon) oppInitWon++;
    }

    // 得点内訳集計
    if (isWon) {
      const label = parsed.wonDetailLabel;
      const color = parsed.actionCategory === 'serve' ? '#10b981' : parsed.actionCategory === 'third_ball' ? '#3b82f6' : parsed.actionCategory === 'receive' ? '#06b6d4' : '#8b5cf6';
      const cur = wonMap.get(label) || { count: 0, color };
      cur.count++;
      wonMap.set(label, cur);
    } else {
      // 失点内訳集計
      const label = parsed.lostDetailLabel;
      const color = parsed.actionCategory === 'serve' ? '#ef4444' : parsed.actionCategory === 'receive' ? '#f59e0b' : '#ec4899';
      const cur = lostMap.get(label) || { count: 0, color };
      cur.count++;
      lostMap.set(label, cur);
    }
  }

  // 1. 得点率が高い行動 (効いている・続けるべき)
  const topWinningActions: ActionImpactItem[] = Array.from(actionMap.values())
    .filter((a) => a.total >= 1 && (a.won / a.total) >= 0.5)
    .map((a) => {
      const winRate = Math.round((a.won / a.total) * 100);
      const lossRate = 100 - winRate;
      return {
        id: a.name,
        name: a.name,
        detail: `${a.total}本中 ${a.won}点獲得 (${winRate}%)`,
        category: a.category,
        total: a.total,
        won: a.won,
        lost: a.lost,
        winRate,
        lossRate,
        adviceType: 'keep' as const,
        adviceMessage: winRate >= 75 ? '非常に効果的！最優先で続けるべき' : '有効な戦術。迷わず使っていこう',
      };
    })
    .sort((a, b) => b.winRate !== a.winRate ? b.winRate - a.winRate : b.total - a.total);

  // 2. 失点率が高い行動 (やめる・意識して待つ・対処すべき)
  const topLosingActions: ActionImpactItem[] = Array.from(actionMap.values())
    .filter((a) => a.total >= 1 && (a.lost / a.total) >= 0.5)
    .map((a) => {
      const winRate = Math.round((a.won / a.total) * 100);
      const lossRate = Math.round((a.lost / a.total) * 100);
      let adviceMsg = '失点パターン。配球を変えるか、無理な強打を避ける';
      if (a.name.includes('レシーブ')) {
        adviceMsg = '相手サーブのコース・長さを待って確実に返球すること';
      } else if (a.name.includes('3球目') || a.name.includes('無理')) {
        adviceMsg = '強打で一発を狙いすぎず、回転をかけて安全に攻める';
      } else if (a.name.includes('サーブミス')) {
        adviceMsg = 'まずは台に入れることを徹底して失点を防ぐ';
      }

      return {
        id: a.name,
        name: a.name,
        detail: `${a.total}本中 ${a.lost}失点 (${lossRate}%)`,
        category: a.category,
        total: a.total,
        won: a.won,
        lost: a.lost,
        winRate,
        lossRate,
        adviceType: 'stop' as const,
        adviceMessage: adviceMsg,
      };
    })
    .sort((a, b) => b.lossRate !== a.lossRate ? b.lossRate - a.lossRate : b.total - a.total);

  // 3. 自分のミスが多い技術の失敗率
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
    .sort((a, b) => b.failureRate !== a.failureRate ? b.failureRate - a.failureRate : b.missCount - a.missCount);

  // 4. 先手を取りに行った際の得点率
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

  // 5. 先手を取られた際の得点率
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

  // 6. 全得点の内訳
  const wonBreakdown: PointBreakdownItem[] = Array.from(wonMap.entries())
    .map(([label, val]) => ({
      id: label,
      label,
      count: val.count,
      percentage: wonPoints > 0 ? Math.round((val.count / wonPoints) * 100) : 0,
      categoryColor: val.color,
    }))
    .sort((a, b) => b.count - a.count);

  // 7. 全失点の内訳
  const lostBreakdown: PointBreakdownItem[] = Array.from(lostMap.entries())
    .map(([label, val]) => ({
      id: label,
      label,
      count: val.count,
      percentage: lostPoints > 0 ? Math.round((val.count / lostPoints) * 100) : 0,
      categoryColor: val.color,
    }))
    .sort((a, b) => b.count - a.count);

  // 1分間アドバイス ハイライト作成
  const bestWinAct = topWinningActions[0]?.name || 'サーブ・レシーブを落ち着いて入れる';
  const worstLossAct = topLosingActions[0]?.name || 'イージーミスを減らす';
  const quickAdvice = {
    keep: topWinningActions.length > 0 ? `【継続】${bestWinAct} が非常に効いている！` : '【継続】丁寧なラリーで相手のミスを誘おう',
    stop: topLosingActions.length > 0 ? `【注意】${worstLossAct} での失点を防ぐこと！` : '【注意】甘い返球を避けて深く送ろう',
    clutch: selfInitWinRate >= 60 ? 'チャンスボールは自信を持って先手攻撃！' : '無理に打ち込まず、コースを突いてチャンスを待とう',
  };

  return {
    setNumber,
    totalPoints,
    wonPoints,
    lostPoints,
    winRate: totalPoints > 0 ? Math.round((wonPoints / totalPoints) * 100) : 0,
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
  const latestSetNum = activeSetNumber && setMap.has(activeSetNumber)
    ? activeSetNumber
    : maxSetNum;

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
    const earlyRallies = rallies.filter((r) => r.gameNumber === 1 || (maxSetNum >= 3 && r.gameNumber <= 2 && r.gameNumber < latestSetNum));
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
