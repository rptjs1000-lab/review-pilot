'use client';

import React from 'react';
import { WeeklyRatingTrend } from '../../types';

// 주간 별점 추이 SVG 라인 차트
interface RatingTrendChartProps {
  data: WeeklyRatingTrend[];
}

export default function RatingTrendChart({ data }: RatingTrendChartProps) {
  // 차트 치수
  const chartWidth = 400;
  const chartHeight = 200;
  const paddingX = 50;
  const paddingY = 30;
  const innerW = chartWidth - paddingX * 2;
  const innerH = chartHeight - paddingY * 2;

  // Y축 범위 (별점 1 ~ 5)
  const minY = 1;
  const maxY = 5;

  // 데이터 포인트 좌표 계산
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * innerW;
    const y =
      paddingY + innerH - ((d.avg - minY) / (maxY - minY)) * innerH;
    return { x, y, ...d };
  });

  // SVG polyline 문자열
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // 그라데이션 area (라인 아래 영역 채우기)
  const areaPath =
    points.length > 0
      ? `M ${points[0].x},${paddingY + innerH} ` +
        points.map((p) => `L ${p.x},${p.y}`).join(' ') +
        ` L ${points[points.length - 1].x},${paddingY + innerH} Z`
      : '';

  // 전체 변화율 계산
  const first = data[0]?.avg || 0;
  const last = data[data.length - 1]?.avg || 0;
  const changeRate = first > 0 ? ((last - first) / first) * 100 : 0;
  const isUp = changeRate > 0;
  const isDown = changeRate < 0;

  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-txt leading-[1.4]">
          주간 별점 추이
        </h3>
        {/* 변화율 뱃지 */}
        <div className="flex items-center gap-1.5">
          {isUp && (
            <span className="text-sm font-medium text-success font-grotesk flex items-center gap-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
              +{changeRate.toFixed(1)}%
            </span>
          )}
          {isDown && (
            <span className="text-sm font-medium text-danger font-grotesk flex items-center gap-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
              {changeRate.toFixed(1)}%
            </span>
          )}
          {!isUp && !isDown && (
            <span className="text-sm font-medium text-txt-sub font-grotesk">변동 없음</span>
          )}
        </div>
      </div>

      {/* SVG 라인 차트 */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* 그라데이션 영역 */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Y축 가이드라인 */}
          {[1, 2, 3, 4, 5].map((val) => {
            const y = paddingY + innerH - ((val - minY) / (maxY - minY)) * innerH;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={val === 1 || val === 5 ? '0' : '4 4'}
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-txt-sub"
                  fontSize="11"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* 면적 채우기 */}
          {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

          {/* 라인 */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 + 라벨 */}
          {points.map((p, i) => (
            <g key={i}>
              {/* 포인트 외곽 */}
              <circle cx={p.x} cy={p.y} r="6" fill="white" stroke="#2563EB" strokeWidth="2.5" />
              {/* 포인트 내부 */}
              <circle cx={p.x} cy={p.y} r="3" fill="#2563EB" />
              {/* 별점 값 */}
              <text
                x={p.x}
                y={p.y - 14}
                textAnchor="middle"
                className="fill-txt"
                fontSize="12"
                fontWeight="600"
                fontFamily="Space Grotesk, sans-serif"
              >
                {p.avg.toFixed(1)}
              </text>
              {/* 주 라벨 (X축) */}
              <text
                x={p.x}
                y={chartHeight - 6}
                textAnchor="middle"
                className="fill-txt-sub"
                fontSize="11"
                fontFamily="Pretendard, sans-serif"
              >
                {p.week}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 하단 요약 */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-bdr">
        <span className="text-xs text-txt-sub">최근 4주간 추이</span>
        <div className="flex items-center gap-3 text-xs text-txt-sub">
          {data.map((d, i) => (
            <span key={i} className="font-grotesk">
              {d.week}: <span className="font-semibold text-txt">{d.count}건</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
