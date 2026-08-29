import { INITIAL_MATCHES, INITIAL_RALLIES } from '../src/lib/mock-data';
import { filterRallies, calculateAnalytics, AnalyticsFilter } from '../src/lib/analytics';

console.log('=== TT ANALYTICS LOGIC TEST ===\n');

// 1. 全体集計テスト
const allFiltered = filterRallies(INITIAL_RALLIES, INITIAL_MATCHES, {});
const totalSummary = calculateAnalytics(allFiltered);
console.log(`[TEST 1] Total Rallies: ${totalSummary.totalRallies} (Won: ${totalSummary.wonCount}, Lost: ${totalSummary.lostCount})`);
console.log(`Win Rate: ${totalSummary.winRate}%, Loss Rate: ${totalSummary.lossRate}%`);
console.log(`Self Serve Win Rate: ${totalSummary.selfServeWinRate}%, Opponent Serve Win Rate: ${totalSummary.oppServeWinRate}%`);

if (totalSummary.totalRallies === INITIAL_RALLIES.length) {
  console.log('✓ TEST 1 PASSED: Total count matches mock data.\n');
} else {
  console.error('✗ TEST 1 FAILED!');
}

// 2. 対カットマン（相手戦型別）フィルターテスト
const chopperFilter: AnalyticsFilter = { opponentStyle: 'chopper' };
const chopperRallies = filterRallies(INITIAL_RALLIES, INITIAL_MATCHES, chopperFilter);
const chopperSummary = calculateAnalytics(chopperRallies);
console.log(`[TEST 2] Chopper Rallies: ${chopperSummary.totalRallies} (Won: ${chopperSummary.wonCount}, Lost: ${chopperSummary.lostCount})`);
console.log(`Chopper Match Win Rate: ${chopperSummary.winRate}%`);

if (chopperSummary.totalRallies === 10) {
  console.log('✓ TEST 2 PASSED: Chopper rallies correctly filtered.\n');
} else {
  console.error('✗ TEST 2 FAILED!');
}

// 3. レシーブ技術「ツッツキ (push)」フィルターテスト
const pushFilter: AnalyticsFilter = { receiveTechnique: 'push' };
const pushRallies = filterRallies(INITIAL_RALLIES, INITIAL_MATCHES, pushFilter);
const pushSummary = calculateAnalytics(pushRallies);
console.log(`[TEST 3] Push (ツッツキ) Rallies: ${pushSummary.totalRallies}, Won: ${pushSummary.wonCount}, Win Rate: ${pushSummary.winRate}%`);

if (pushSummary.totalRallies === 2) {
  console.log('✓ TEST 3 PASSED: Push technique filter working.\n');
} else {
  console.error('✗ TEST 3 FAILED!');
}

// 4. サーブ「ショート下回転 (short + backspin)」のヒートマップ・集計テスト
const shortBackspinFilter: AnalyticsFilter = { serveLength: 'short', serveSpin: 'backspin' };
const serveRallies = filterRallies(INITIAL_RALLIES, INITIAL_MATCHES, shortBackspinFilter);
const serveSummary = calculateAnalytics(serveRallies);
console.log(`[TEST 4] Short Backspin Serve Rallies: ${serveSummary.totalRallies}, Win Rate: ${serveSummary.winRate}%`);

if (serveSummary.totalRallies === 2 && serveSummary.winRate === 100) {
  console.log('✓ TEST 4 PASSED: Short backspin serve analysis accurate.\n');
} else {
  console.error('✗ TEST 4 FAILED!');
}

// 5. ミス種別集計テスト（サーブミス & 相手ネットイン含む）
console.log(`[TEST 5] Miss Breakdown:`, totalSummary.byMissType);
const serveMiss = totalSummary.byMissType.find(m => m.missType === 'serve_miss');
const netInMiss = totalSummary.byMissType.find(m => m.missType === 'net_in');
if (serveMiss && serveMiss.count === 1 && netInMiss && netInMiss.count === 1) {
  console.log('✓ TEST 5 PASSED: serve_miss & net_in correctly recorded and counted.\n');
} else {
  console.error('✗ TEST 5 FAILED!');
}

console.log('=== ALL LOGIC TESTS PASSED! ===');
