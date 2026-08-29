-- 卓球プレー分析システム Supabase スキーマ定義
-- テーブル作成: matches (試合メタデータ)
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    match_type VARCHAR(32) NOT NULL DEFAULT 'official',
    tournament_name VARCHAR(255),
    opponent_name VARCHAR(255),
    opponent_hand VARCHAR(16) NOT NULL DEFAULT 'right',
    opponent_style VARCHAR(32) NOT NULL DEFAULT 'shake_attack',
    opponent_rubber_fore VARCHAR(32) NOT NULL DEFAULT 'inverted',
    opponent_rubber_back VARCHAR(32) NOT NULL DEFAULT 'inverted',
    game_format INT NOT NULL DEFAULT 5,
    my_score_games INT DEFAULT 0,
    opp_score_games INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- テーブル作成: rallies (1プレー詳細ログ)
CREATE TABLE IF NOT EXISTS rallies (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    game_number INT NOT NULL DEFAULT 1,
    score_my INT NOT NULL DEFAULT 0,
    score_opp INT NOT NULL DEFAULT 0,
    result VARCHAR(16) NOT NULL, -- 'won' | 'lost'
    server VARCHAR(16) NOT NULL, -- 'self' | 'opponent'
    action_category VARCHAR(32) NOT NULL, -- 'serve', 'receive', 'third_ball', 'rally'

    -- サーブ詳細
    serve_length VARCHAR(32),
    serve_course VARCHAR(32),
    serve_spin VARCHAR(32),

    -- レシーブ詳細
    receive_technique VARCHAR(32),
    receive_course VARCHAR(32),

    -- 3球目攻撃詳細
    third_ball_hand VARCHAR(32),
    third_ball_receive_course VARCHAR(32),
    third_ball_target_course VARCHAR(32),
    third_ball_type VARCHAR(32),

    -- ラリー詳細
    rally_type VARCHAR(32),

    -- ミス種別
    miss_type VARCHAR(32),

    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_rallies_match_id ON rallies(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_opponent_style ON matches(opponent_style);
CREATE INDEX IF NOT EXISTS idx_rallies_action_category ON rallies(action_category);

-- RLS (Row Level Security) の設定
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rallies ENABLE ROW LEVEL SECURITY;

-- 匿名キー(anon)でも読み書きを許可するポリシー
DROP POLICY IF EXISTS "Public access to matches" ON matches;
CREATE POLICY "Public access to matches" ON matches
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to rallies" ON rallies;
CREATE POLICY "Public access to rallies" ON rallies
    FOR ALL USING (true) WITH CHECK (true);

