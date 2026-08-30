export type MatchType = 'official' | 'practice' | 'unofficial';

export type OpponentHand = 'right' | 'left';

export type OpponentStyle = 
  | 'shake_attack'    // シェーク攻撃
  | 'pen_attack'      // ペン攻撃
  | 'chopper'         // カットマン
  | 'pips_attack'     // 粒高（攻撃寄り）
  | 'pips_defense'    // 粒高（守備寄り）
  | 'short_pips'      // 表ソフト速攻
  | 'other';          // その他

export type RubberType = 'inverted' | 'short_pips' | 'long_pips' | 'anti';

export type PointResult = 'won' | 'lost'; // 得点 | 失点

export type ServerType = 'self' | 'opponent'; // 自分サーブ | 相手サーブ

export type ActionCategory = 
  | 'serve'       // サーブ
  | 'receive'     // レシーブ
  | 'third_ball'  // 3球目攻撃
  | 'rally'       // ラリー
  | 'serve_miss'; // サーブミス

// サーブ詳細 (8分割: 横4コース × 縦2長さ)
export type ServeLength = 'short' | 'long'; // 前 (ショート) | ロング
export type ServeCourse = 'fore' | 'fore_middle' | 'back_middle' | 'back'; // フォア | フォアミドル | バックミドル | バック
export type ServeSpin = 
  | 'backspin'          // 下
  | 'side_back'         // 横下
  | 'side_top'          // 横上
  | 'reverse_side_back' // 逆横下
  | 'reverse_side'      // 逆横
  | 'knuckle'           // ナックル
  | 'topspin'           // 上
  | 'unknown';          // 不明

// レシーブ詳細
export type ReceiveTechnique = 
  | 'push'       // ツッツキ
  | 'stop'       // ストップ
  | 'sink'       // 流し
  | 'flick'      // フリック
  | 'chiquita'   // チキータ
  | 'drive'      // ドライブ
  | 'light_hit'  // 軽打
  | 'high_ball'; // 浮き球

export type Course3Way = 'fore' | 'middle' | 'back';

// 3球目攻撃詳細
export type ThirdBallHand = 'forehand' | 'backhand';
export type ThirdBallType = 
  | 'loop_drive' // ループドライブ
  | 'drive'      // ドライブ
  | 'smash'      // スマッシュ
  | 'angle_shot'; // 角度打ち

// ラリー詳細
export type RallyType = 
  | 'on_table'    // 台上
  | 'connect'     // つなぎ
  | 'block'       // ブロック
  | 'attack'      // 攻撃
  | 'defense'     // しのぎ
  | 'chance_ball'; // チャンスボール

// ミス種別 / 失点理由
export type MissType = 
  | 'net'         // ネットミス
  | 'over'        // オーバーミス
  | 'no_touch'    // ノータッチ (抜かれた)
  | 'swing_miss'  // 空振り / 振り遅れ
  | 'edge'        // 相手エッジ
  | 'net_in'      // 相手ネットイン
  | 'other';      // その他ミス

// 1試合のメタデータ
export interface Match {
  id: string;
  date: string; // YYYY-MM-DD
  matchType: MatchType;
  tournamentName?: string;
  opponentName?: string;
  opponentHand: OpponentHand;
  opponentStyle: OpponentStyle;
  opponentRubberFore: RubberType;
  opponentRubberBack: RubberType;
  gameFormat: number; // 3, 5, 7
  myScoreGames?: number;
  oppScoreGames?: number;
  isCompleted?: boolean;
  notes?: string;
  createdAt: string;
}

// 1プレーの記録
export interface Rally {
  id: string;
  matchId: string;
  gameNumber: number;
  scoreMy: number;
  scoreOpp: number;
  result: PointResult;
  server: ServerType;
  actionCategory: ActionCategory;

  // サーブ/サーブミス
  serveLength?: ServeLength;
  serveCourse?: ServeCourse;
  serveSpin?: ServeSpin;

  // レシーブ/レシーブミス
  receiveTechnique?: ReceiveTechnique;
  receiveCourse?: Course3Way;

  // 3球目攻撃/3球目攻撃ミス
  thirdBallHand?: ThirdBallHand;
  thirdBallReceiveCourse?: Course3Way;
  thirdBallTargetCourse?: Course3Way;
  thirdBallType?: ThirdBallType;

  // ラリー
  rallyType?: RallyType;

  // ミス種別
  missType?: MissType;

  memo?: string;
  createdAt: string;
}

// UI表示用の日本語ラベルマッピング
export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  official: '公式大会',
  practice: '練習',
  unofficial: '非公式大会',
};

export const OPPONENT_HAND_LABELS: Record<OpponentHand, string> = {
  right: '右利き',
  left: '左利き',
};

export const OPPONENT_STYLE_LABELS: Record<OpponentStyle, string> = {
  shake_attack: 'シェーク攻撃',
  pen_attack: 'ペン攻撃',
  chopper: 'カットマン',
  pips_attack: '粒高（攻撃寄り）',
  pips_defense: '粒高（守備寄り）',
  short_pips: '表ソフト速攻',
  other: 'その他',
};

export const RUBBER_LABELS: Record<RubberType, string> = {
  inverted: '裏ソフト',
  short_pips: '表ソフト',
  long_pips: '粒高',
  anti: 'アンチ',
};

export const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
  serve: 'サーブ',
  receive: 'レシーブ',
  third_ball: '３球目攻撃',
  rally: 'ラリー',
  serve_miss: 'サーブミス',
};

export const SERVE_LENGTH_LABELS: Record<ServeLength, string> = {
  short: '前',
  long: 'ロング',
};

export const SERVE_COURSE_LABELS: Record<ServeCourse, string> = {
  fore: 'フォア',
  fore_middle: 'フォアミドル',
  back_middle: 'バックミドル',
  back: 'バック',
};

// 8分割表記ヘルパー (例: フォアロング、フォア前、バックミドル前)
export function getServe8WayLabel(length: ServeLength, course: ServeCourse): string {
  const courseText = SERVE_COURSE_LABELS[course];
  const lengthText = length === 'short' ? '前' : 'ロング';
  return `${courseText}${lengthText}`;
}

export const SERVE_SPIN_LABELS: Record<ServeSpin, string> = {
  backspin: '下回転',
  side_back: '横下回転',
  side_top: '横上回転',
  reverse_side_back: '逆横下回転',
  reverse_side: '逆横回転',
  knuckle: 'ナックル',
  topspin: '上回転',
  unknown: '不明',
};

export const RECEIVE_TECHNIQUE_LABELS: Record<ReceiveTechnique, string> = {
  push: 'ツッツキ',
  stop: 'ストップ',
  sink: '流し',
  flick: 'フリック',
  chiquita: 'チキータ',
  drive: 'ドライブ',
  light_hit: '軽打',
  high_ball: '浮き球',
};

export const COURSE_3WAY_LABELS: Record<Course3Way, string> = {
  fore: 'フォア',
  middle: 'ミドル',
  back: 'バック',
};

export const THIRD_BALL_HAND_LABELS: Record<ThirdBallHand, string> = {
  forehand: 'フォアハンド',
  backhand: 'バックハンド',
};

export const THIRD_BALL_TYPE_LABELS: Record<ThirdBallType, string> = {
  loop_drive: 'ループドライブ',
  drive: 'ドライブ',
  smash: 'スマッシュ',
  angle_shot: '角度打ち',
};

export const RALLY_TYPE_LABELS: Record<RallyType, string> = {
  on_table: '台上',
  connect: 'つなぎ',
  block: 'ブロック',
  attack: '攻撃',
  defense: 'しのぎ',
  chance_ball: 'チャンスボール',
};

export const MISS_TYPE_LABELS: Record<MissType, string> = {
  net: 'ネットミス',
  over: 'オーバーミス',
  no_touch: 'ノータッチ (抜かれた)',
  swing_miss: '空振り / 振り遅れ',
  edge: '相手エッジ',
  net_in: '相手ネットイン',
  other: 'その他ミス',
};
