import { supabase, isSupabaseConfigured } from './supabase';
import { Match, Rally } from '@/types/table-tennis';
import { getMatches, getRallies, saveMatch, saveRally } from './storage';

// =============================================================================
// キャメルケース (JS) ⇄ スネークケース (DB) 変換ヘルパー
// =============================================================================

function matchToDbRow(m: Match) {
  return {
    id: m.id,
    date: m.date,
    match_type: m.matchType,
    tournament_name: m.tournamentName || null,
    opponent_name: m.opponentName || null,
    opponent_hand: m.opponentHand,
    opponent_style: m.opponentStyle,
    opponent_rubber_fore: m.opponentRubberFore,
    opponent_rubber_back: m.opponentRubberBack,
    game_format: m.gameFormat,
    my_score_games: m.myScoreGames,
    opp_score_games: m.oppScoreGames,
    is_completed: m.isCompleted,
    notes: m.notes || null,
    created_at: m.createdAt,
  };
}

function dbRowToMatch(row: any): Match {
  return {
    id: row.id,
    date: row.date,
    matchType: row.match_type,
    tournamentName: row.tournament_name || undefined,
    opponentName: row.opponent_name || undefined,
    opponentHand: row.opponent_hand,
    opponentStyle: row.opponent_style,
    opponentRubberFore: row.opponent_rubber_fore,
    opponentRubberBack: row.opponent_rubber_back,
    gameFormat: row.game_format,
    myScoreGames: row.my_score_games || 0,
    oppScoreGames: row.opp_score_games || 0,
    isCompleted: Boolean(row.is_completed),
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

function rallyToDbRow(r: Rally) {
  return {
    id: r.id,
    match_id: r.matchId,
    game_number: r.gameNumber,
    score_my: r.scoreMy,
    score_opp: r.scoreOpp,
    result: r.result,
    server: r.server,
    action_category: r.actionCategory,
    serve_length: r.serveLength || null,
    serve_course: r.serveCourse || null,
    serve_spin: r.serveSpin || null,
    receive_technique: r.receiveTechnique || null,
    receive_course: r.receiveCourse || null,
    third_ball_hand: r.thirdBallHand || null,
    third_ball_receive_course: r.thirdBallReceiveCourse || null,
    third_ball_target_course: r.thirdBallTargetCourse || null,
    third_ball_type: r.thirdBallType || null,
    rally_type: r.rallyType || null,
    miss_type: r.missType || null,
    memo: r.memo || null,
    created_at: r.createdAt,
  };
}

function dbRowToRally(row: any): Rally {
  return {
    id: row.id,
    matchId: row.match_id,
    gameNumber: row.game_number,
    scoreMy: row.score_my,
    scoreOpp: row.score_opp,
    result: row.result,
    server: row.server,
    actionCategory: row.action_category,
    serveLength: row.serve_length || undefined,
    serveCourse: row.serve_course || undefined,
    serveSpin: row.serve_spin || undefined,
    receiveTechnique: row.receive_technique || undefined,
    receiveCourse: row.receive_course || undefined,
    thirdBallHand: row.third_ball_hand || undefined,
    thirdBallReceiveCourse: row.third_ball_receive_course || undefined,
    thirdBallTargetCourse: row.third_ball_target_course || undefined,
    thirdBallType: row.third_ball_type || undefined,
    rallyType: row.rally_type || undefined,
    missType: row.miss_type || undefined,
    memo: row.memo || undefined,
    createdAt: row.created_at,
  };
}

// =============================================================================
// 1試合単位のクラウド同期 (試合終了時に呼び出し)
// =============================================================================

export async function syncMatchToCloud(matchId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabaseが設定されていません（LocalStorageのみに保存）' };
  }

  try {
    const allMatches = getMatches();
    const targetMatch = allMatches.find((m) => m.id === matchId);
    if (!targetMatch) {
      return { success: false, error: '該当の試合が見つかりません' };
    }

    const allRallies = getRallies();
    const targetRallies = allRallies.filter((r) => r.matchId === matchId);

    // 1. matchesテーブルへUpsert
    const matchRow = matchToDbRow(targetMatch);
    const { error: matchError } = await supabase
      .from('matches')
      .upsert(matchRow, { onConflict: 'id' });

    if (matchError) {
      console.error('[Supabase] Match sync error:', matchError);
      return { success: false, error: matchError.message };
    }

    // 2. ralliesテーブルへUpsert (一括)
    if (targetRallies.length > 0) {
      const rallyRows = targetRallies.map(rallyToDbRow);
      const { error: rallyError } = await supabase
        .from('rallies')
        .upsert(rallyRows, { onConflict: 'id' });

      if (rallyError) {
        console.error('[Supabase] Rallies sync error:', rallyError);
        return { success: false, error: rallyError.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Supabase] Unexpected error in syncMatchToCloud:', err);
    return { success: false, error: err?.message || '同期処理中に例外が発生しました' };
  }
}

// =============================================================================
// 分析用: クラウドDBから全データを取得 (分析タブを開いた時に呼び出し)
// =============================================================================

export async function fetchAnalyticsDataFromCloud(): Promise<{
  matches: Match[];
  rallies: Rally[];
  fromCloud: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    // Supabase未設定時はローカルのデータを返す
    return {
      matches: getMatches(),
      rallies: getRallies(),
      fromCloud: false,
    };
  }

  try {
    // 1. 全試合を取得
    const { data: matchRows, error: matchErr } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: false });

    if (matchErr) {
      console.warn('[Supabase] Failed to fetch matches, fallback to local:', matchErr);
      return {
        matches: getMatches(),
        rallies: getRallies(),
        fromCloud: false,
        error: matchErr.message,
      };
    }

    // 2. 全ラリーを取得
    const { data: rallyRows, error: rallyErr } = await supabase
      .from('rallies')
      .select('*')
      .order('created_at', { ascending: true });

    if (rallyErr) {
      console.warn('[Supabase] Failed to fetch rallies, fallback to local:', rallyErr);
      return {
        matches: getMatches(),
        rallies: getRallies(),
        fromCloud: false,
        error: rallyErr.message,
      };
    }

    const fetchedMatches = (matchRows || []).map(dbRowToMatch);
    const fetchedRallies = (rallyRows || []).map(dbRowToRally);

    // クラウドから取得した最新データをローカルキャッシュにも保存
    if (fetchedMatches.length > 0) {
      fetchedMatches.forEach((m) => saveMatch(m));
      fetchedRallies.forEach((r) => saveRally(r));
    }

    return {
      matches: fetchedMatches,
      rallies: fetchedRallies,
      fromCloud: true,
    };
  } catch (err: any) {
    console.error('[Supabase] Fetch error:', err);
    return {
      matches: getMatches(),
      rallies: getRallies(),
      fromCloud: false,
      error: err?.message,
    };
  }
}

// =============================================================================
// ローカル全データをクラウドへ一括アップロード同期
// =============================================================================

export async function syncAllLocalToCloud(): Promise<{ success: boolean; syncedMatches: number; syncedRallies: number; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, syncedMatches: 0, syncedRallies: 0, error: 'Supabaseが設定されていません' };
  }

  try {
    const localMatches = getMatches();
    const localRallies = getRallies();

    if (localMatches.length > 0) {
      const matchRows = localMatches.map(matchToDbRow);
      const { error: matchErr } = await supabase
        .from('matches')
        .upsert(matchRows, { onConflict: 'id' });

      if (matchErr) return { success: false, syncedMatches: 0, syncedRallies: 0, error: matchErr.message };
    }

    if (localRallies.length > 0) {
      const rallyRows = localRallies.map(rallyToDbRow);
      const { error: rallyErr } = await supabase
        .from('rallies')
        .upsert(rallyRows, { onConflict: 'id' });

      if (rallyErr) return { success: false, syncedMatches: 0, syncedRallies: 0, error: rallyErr.message };
    }

    return {
      success: true,
      syncedMatches: localMatches.length,
      syncedRallies: localRallies.length,
    };
  } catch (err: any) {
    return { success: false, syncedMatches: 0, syncedRallies: 0, error: err?.message || '一括同期に失敗しました' };
  }
}
