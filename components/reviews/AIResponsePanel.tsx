'use client';

import React, { useState } from 'react';

// AI 응답 생성 패널 — 톤 선택 + 생성 버튼 + 텍스트에디터 + 복사/재생성
interface AIResponsePanelProps {
  reviewId: string;
  initialResponse?: string;
}

export default function AIResponsePanel({ reviewId, initialResponse = '' }: AIResponsePanelProps) {
  const [tone, setTone] = useState('friendly');
  const [response, setResponse] = useState(initialResponse);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI 응답 생성 요청
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResponse(data.data.content);
      } else {
        alert(data.error || '응답 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('응답 생성 실패:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 클립보드 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      alert('클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 재생성
  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
      <h3 className="text-lg font-semibold text-txt mb-5">AI 응답 생성</h3>

      {/* 톤 선택 */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-txt mb-1.5">응답 톤</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="friendly">친절한 톤</option>
          <option value="formal">격식 있는 톤</option>
          <option value="casual">캐주얼한 톤</option>
          <option value="professional">전문적인 톤</option>
        </select>
      </div>

      {/* AI 응답 생성 버튼 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full px-6 py-3.5 bg-primary hover:bg-primary-dark text-white text-base font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mb-5 disabled:opacity-60"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {isGenerating ? '생성 중...' : 'AI 응답 생성'}
      </button>

      {/* 생성된 응답 영역 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-txt">생성된 응답</label>
          {response && (
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary-light text-primary">
              AI 생성
            </span>
          )}
        </div>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="w-full px-4 py-3 text-sm bg-bg border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none leading-[1.8]"
          rows={8}
          placeholder="AI 응답이 여기에 생성됩니다..."
        />
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          disabled={!response}
          className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          응답 복사
        </button>
        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="px-4 py-2.5 bg-white border border-bdr hover:bg-bg text-txt text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          재생성
        </button>
      </div>

      {/* Extension 안내 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-primary-light rounded-lg">
        <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-primary">Chrome Extension을 설치하면 스마트스토어에서 자동 입력됩니다.</p>
      </div>
    </div>
  );
}
