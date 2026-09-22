'use client';

import React, { useRef, useState } from 'react';
import {
  exportToCSV,
  exportToJSON,
  importFromJSON,
  resetToMockData,
  clearAllData,
  getMatches,
  getRallies,
} from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { syncAllLocalToCloud, fetchAnalyticsDataFromCloud, deleteAllDataFromCloud } from '@/lib/sync-service';
import { Download, Upload, RotateCcw, Trash2, Database, FileSpreadsheet, ShieldAlert, Cloud, Check, RefreshCw, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface DataManagementProps {
  onDataChanged: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ onDataChanged }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 全データをクラウドへ一括送信
  const handleUploadAllToCloud = async () => {
    if (!isSupabaseConfigured) {
      showMsg('error', 'Supabaseが設定されていません。Vercelの環境変数を設定してください');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await syncAllLocalToCloud();
      if (res.success) {
        showMsg('success', `クラウドDBへ一括保存しました（試合: ${res.syncedMatches}件, プレー: ${res.syncedRallies}本）`);
      } else {
        showMsg('error', `同期に失敗しました: ${res.error}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // クラウドから最新データを全取得してローカルに同期
  const handleDownloadAllFromCloud = async () => {
    if (!isSupabaseConfigured) {
      showMsg('error', 'Supabaseが設定されていません。Vercelの環境変数を設定してください');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetchAnalyticsDataFromCloud();
      if (res.fromCloud) {
        onDataChanged();
        showMsg('success', `クラウドDBから最新データを取得・同期しました（試合: ${res.matches.length}件, プレー: ${res.rallies.length}本）`);
      } else {
        showMsg('error', `クラウドDBからの取得に失敗しました: ${res.error || '不明なエラー'}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // CSVダウンロード
  const handleDownloadCSV = () => {
    const csv = exportToCSV();
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tt_analytics_rallies_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('success', 'CSVファイルをダウンロードしました');
  };

  // JSONダウンロード
  const handleDownloadJSON = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tt_analytics_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('success', 'JSONバックアップをダウンロードしました');
  };

  // JSONインポート
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importFromJSON(content);
      if (ok) {
        onDataChanged();
        showMsg('success', 'データを正常にインポート・復元しました');
      } else {
        showMsg('error', 'データのインポートに失敗しました。JSONファイルの形式を確認してください');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // デモデータ再読み込み
  const handleResetMock = () => {
    if (confirm('初期サンプルデータにリセットしますか？ 現在のデータは上書きされます。')) {
      resetToMockData();
      onDataChanged();
      showMsg('success', 'サンプルデータにリセットしました');
    }
  };

  // 全消去
  const handleClearAll = async () => {
    if (confirm('すべての試合データとプレー記録を完全に削除しますか？この操作は取り消せません。')) {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured) {
          await deleteAllDataFromCloud();
        }
        clearAllData();
        onDataChanged();
        showMsg('success', 'すべてのデータを消去しました');
      } catch (e: any) {
        clearAllData();
        onDataChanged();
        showMsg('error', 'ローカルデータを消去しましたが、クラウドの削除でエラーが発生しました');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const matchesCount = getMatches().length;
  const ralliesCount = getRallies().length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      {/* 通知メッセージ */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border border-rose-300 text-rose-800'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* 現在のデータ概要 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 font-black text-base text-slate-800 mb-3 pb-2 border-b border-slate-100">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>端末内（LocalStorage）の保存状況</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1 font-medium">登録試合数</span>
            <span className="text-2xl font-black text-emerald-600">{matchesCount}</span> <span className="text-xs text-slate-500">試合</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1 font-medium">総プレー記録数</span>
            <span className="text-2xl font-black text-teal-600">{ralliesCount}</span> <span className="text-xs text-slate-500">本</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-500 block mb-1 font-medium">保存ステータス</span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              端末内に自動永続化中
            </span>
          </div>
        </div>
      </div>

      {/* エクスポート / インポート */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="font-black text-base text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-teal-600" />
          <span>データのエクスポート ＆ インポート</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* CSVエクスポート */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1 group-hover:text-emerald-800">
              <Download className="w-4 h-4" />
              CSV形式でエクスポート
            </div>
            <p className="text-xs text-slate-500">
              Excelやスプレッドシートで分析するためのUTF-8 CSVファイルをダウンロードします
            </p>
          </button>

          {/* JSONバックアップ */}
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-teal-500 text-left transition-all group"
          >
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm mb-1 group-hover:text-teal-800">
              <Download className="w-4 h-4" />
              JSONバックアップ保存
            </div>
            <p className="text-xs text-slate-500">
              全試合・プレー記録を完全バックアップファイル（.json）として保存します
            </p>
          </button>

          {/* JSONインポート */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Upload className="w-4 h-4" />
                バックアップの復元 (JSONインポート)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                id="json-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
              >
                ファイルを選択して復元
              </button>
            </div>
            <p className="text-xs text-slate-500">
              以前保存したJSONバックアップファイルを読み込み、データを復元します
            </p>
          </div>
        </div>
      </div>

      {/* クラウド・Supabase連携ステータス */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="font-black text-base text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <span>クラウド同期・デプロイ設定 (Supabase & Vercel)</span>
          </div>

          {isSupabaseConfigured && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              クラウド接続中
            </span>
          )}
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Supabase接続状態:</span>
            {isSupabaseConfigured ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                接続中 (Cloud Synchronized)
              </span>
            ) : (
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                ローカル完結モード (LocalStorage)
              </span>
            )}
          </div>
          <p className="text-slate-600 leading-relaxed">
            試合入力時は端末内で0秒高速保存され、試合完了時に自動的にクラウドへ同期されます。また、以下のボタンから手動でクラウドDBと双方向同期することも可能です。
          </p>

          {/* 手動同期ボタン */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleUploadAllToCloud}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>{isSyncing ? '同期中...' : 'ローカル全データをクラウドへ送信'}</span>
            </button>

            <button
              type="button"
              disabled={isSyncing}
              onClick={handleDownloadAllFromCloud}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>{isSyncing ? '取得中...' : 'クラウドから最新データを全取得'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* データリセット・消去 */}
      <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="font-black text-sm text-rose-700 pb-2 border-b border-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>データの初期化・リセット</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleResetMock}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            サンプル（デモ）データに戻す
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            すべてのデータを完全に消去
          </button>
        </div>
      </div>
    </div>
  );
};
