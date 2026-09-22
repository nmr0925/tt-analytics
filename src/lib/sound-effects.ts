'use client';

// =========================================================================
// 卓球分析アプリ Web Audio API サウンドエフェクトエンジン
// 外部音声ファイル不要・完全オフライン動作・遅延ゼロ
// =========================================================================

const SOUND_STORAGE_KEY = 'tt_analytics_sound_enabled';

// オーディオコンテキストのシングルトン保持
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// サウンドの有効/無効設定取得
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(SOUND_STORAGE_KEY);
  return val === null ? true : val === 'true';
}

// サウンドの有効/無効切り替え
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
}

// ユーザー操作時にAudioContextをアンロックするハンドラ
export function unlockAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

// =========================================================================
// 1. 勝利ファンファーレ (VICTORY FANFARE)
// 輝かしいトランペット・ブラス風のコードとアルペジオ
// =========================================================================
export function playVictoryFanfare(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // ファンファーレのメロディ音符 (周波数, 開始オフセット, 長さ, 音量)
  const notes = [
    // 前奏アルペジオ
    { freq: 523.25, time: 0.00, dur: 0.12, vol: 0.25 }, // C5
    { freq: 659.25, time: 0.13, dur: 0.12, vol: 0.25 }, // E5
    { freq: 783.99, time: 0.26, dur: 0.12, vol: 0.28 }, // G5
    { freq: 1046.50, time: 0.39, dur: 0.22, vol: 0.35 }, // C6
    
    // ファンファーレ刻み
    { freq: 783.99, time: 0.65, dur: 0.10, vol: 0.25 }, // G5
    { freq: 1046.50, time: 0.78, dur: 0.60, vol: 0.35 }, // C6 (長め)
  ];

  // 和音（ラストのファンファーレ盛り上がり）
  const finalChord = [
    { freq: 523.25, time: 0.78, dur: 0.80, vol: 0.20 }, // C5
    { freq: 659.25, time: 0.78, dur: 0.80, vol: 0.22 }, // E5
    { freq: 783.99, time: 0.78, dur: 0.80, vol: 0.25 }, // G5
    { freq: 1046.50, time: 0.78, dur: 0.85, vol: 0.30 }, // C6
    { freq: 1318.51, time: 0.78, dur: 0.85, vol: 0.18 }, // E6 (高音の輝き)
  ];

  // 単音の生成
  notes.forEach((n) => {
    playBrassNote(ctx, n.freq, now + n.time, n.dur, n.vol);
  });

  // ラスト和音の生成
  finalChord.forEach((n) => {
    playBrassNote(ctx, n.freq, now + n.time, n.dur, n.vol);
  });

  // キラキラした装飾音 (チャイム)
  const sparkles = [1567.98, 1760.00, 2093.00, 2637.02];
  sparkles.forEach((freq, idx) => {
    playChimeNote(ctx, freq, now + 0.85 + idx * 0.08, 0.4, 0.08);
  });
}

// =========================================================================
// 2. 敗北時の「しゅん…」効果音 (DEFEAT SOUND)
// 少し哀愁とユーモアのある下降トーン（ワーワーワー…しゅん）
// =========================================================================
export function playDefeatSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 下降する3音 + 最後の脱力スライド音
  const notes = [
    { freq: 415.30, time: 0.00, dur: 0.28, vol: 0.22 }, // Ab4
    { freq: 392.00, time: 0.30, dur: 0.28, vol: 0.20 }, // G4
    { freq: 369.99, time: 0.60, dur: 0.30, vol: 0.18 }, // F#4
  ];

  notes.forEach((n) => {
    playSadTone(ctx, n.freq, now + n.time, n.dur, n.vol);
  });

  // 最後の「しゅ〜ん…」と下がるトーン
  playSlidingSadTone(ctx, 349.23, 220.00, now + 0.92, 0.9, 0.22);
}

// =========================================================================
// 3. プレー時の効果音
// =========================================================================

// 得点時 (ナイスボール！ピンポン打球＋爽快なピロリン音)
export function playPointWonSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // 打球アタック音
  playPopSound(ctx, 600, now, 0.04, 0.3);
  // 明るい高音ベル
  playBellNote(ctx, 880, now + 0.03, 0.15, 0.20);
  playBellNote(ctx, 1174.66, now + 0.10, 0.25, 0.22);
}

// 失点時 (控えめなボコッという低音タップ音)
export function playPointLostSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playPopSound(ctx, 280, now, 0.06, 0.2);
  playSadTone(ctx, 246.94, now + 0.02, 0.12, 0.12);
}

// ゲーム獲得時 (ミニファンファーレ)
export function playGameWonSound(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const gameNotes = [
    { freq: 523.25, time: 0.00, dur: 0.12, vol: 0.22 },
    { freq: 659.25, time: 0.12, dur: 0.12, vol: 0.24 },
    { freq: 783.99, time: 0.24, dur: 0.35, vol: 0.28 },
  ];
  gameNotes.forEach((n) => {
    playBrassNote(ctx, n.freq, now + n.time, n.dur, n.vol);
  });
}

// =========================================================================
// ヘルパー音源ジェネレーター（Web Audio API オシレーター）
// =========================================================================

// 金管ブラス風トーン (ノコギリ波＋矩形波＋ローパスフィルター)
function playBrassNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number
): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(freq, startTime);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 1.002, startTime); // 微小デチューンで太さ付加

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 3.5, startTime);
  filter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration);

  // エンベロープ (ADSR)
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.03); // Attack
  gain.gain.setValueAtTime(volume * 0.85, startTime + 0.06); // Decay
  gain.gain.setValueAtTime(volume * 0.75, startTime + duration * 0.7); // Sustain
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Release

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration + 0.05);
  osc2.stop(startTime + duration + 0.05);
}

// 哀愁のある柔らかいトーン (三角波＋正弦波)
function playSadTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, startTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 2, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// ピッチが滑らかに下降する「しゅ〜ん…」トーン
function playSlidingSadTone(
  ctx: AudioContext,
  startFreq: number,
  endFreq: number,
  startTime: number,
  duration: number,
  volume: number
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(startFreq * 2, startTime);
  filter.frequency.exponentialRampToValueAtTime(endFreq * 0.8, startTime + duration);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.08);
  gain.gain.setValueAtTime(volume * 0.8, startTime + duration * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// 卓球ボール打球ポップ音
function playPopSound(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.4, startTime + duration);

  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

// 澄んだベル音
function playBellNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// チャイム装飾音
function playChimeNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}
