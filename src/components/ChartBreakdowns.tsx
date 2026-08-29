'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  AnalyticsSummary,
} from '@/lib/analytics';
import {
  OPPONENT_STYLE_LABELS,
  RECEIVE_TECHNIQUE_LABELS,
  ACTION_CATEGORY_LABELS,
  MISS_TYPE_LABELS,
} from '@/types/table-tennis';
import { BarChart2, PieChart as PieIcon, Award } from 'lucide-react';

interface ChartBreakdownsProps {
  summary: AnalyticsSummary;
}

const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#64748b'];

export const ChartBreakdowns: React.FC<ChartBreakdownsProps> = ({ summary }) => {
  // 戦型別データ成型
  const styleData = summary.byOpponentStyle.map((s) => ({
    name: OPPONENT_STYLE_LABELS[s.style] || s.style || '戦型',
    winRate: s.winRate,
    total: s.total,
    won: s.won,
  }));

  // レシーブ技術別データ成型
  const receiveData = summary.byReceiveTechnique.map((r) => ({
    name: RECEIVE_TECHNIQUE_LABELS[r.technique] || r.technique || 'レシーブ',
    winRate: r.winRate,
    total: r.total,
    won: r.won,
  }));

  // 技術大分類別データ成型
  const categoryData = summary.byActionCategory.map((c) => {
    const rawLabel = ACTION_CATEGORY_LABELS[c.category] || c.category || '技術';
    return {
      name: rawLabel.split(' ')[0],
      winRate: c.winRate,
      total: c.total,
      won: c.won,
    };
  });

  // ミス種別データ成型
  const missData = summary.byMissType.map((m) => ({
    name: MISS_TYPE_LABELS[m.missType] || m.missType || 'ミス',
    count: m.count,
    percentage: m.percentage,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-slate-800">
      {/* 1. 相手戦型別の得点率 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-4 pb-2 border-b border-slate-100">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>対戦相手の戦型別 得点率 (%)</span>
        </div>

        {styleData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            該当する戦型のデータがありません
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={styleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value}% (${props.payload.won}/${props.payload.total}本)`,
                    '得点率',
                  ]}
                />
                <Bar dataKey="winRate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. レシーブ技術別の得点率 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-4 pb-2 border-b border-slate-100">
          <BarChart2 className="w-4 h-4 text-teal-600" />
          <span>レシーブ技術別の得点率 (%)</span>
        </div>

        {receiveData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            レシーブデータがありません
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receiveData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={60} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value}% (${props.payload.won}/${props.payload.total}本)`,
                    '得点率',
                  ]}
                />
                <Bar dataKey="winRate" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. 技術大分類別の得点率 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-4 pb-2 border-b border-slate-100">
          <BarChart2 className="w-4 h-4 text-purple-600" />
          <span>技術大分類ごとの得点率・勝率 (%)</span>
        </div>

        {categoryData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            データがありません
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-20} textAnchor="end" interval={0} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value}% (${props.payload.won}/${props.payload.total}本)`,
                    '得点率',
                  ]}
                />
                <Bar dataKey="winRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. ミス要因の内訳 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-4 pb-2 border-b border-slate-100">
          <PieIcon className="w-4 h-4 text-rose-600" />
          <span>失点・ミスの内訳要因 (Miss Breakdown)</span>
        </div>

        {missData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            ミス・失点データがありません
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={missData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {missData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value}回 (${props.payload.percentage}%)`,
                    props.payload.name,
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
