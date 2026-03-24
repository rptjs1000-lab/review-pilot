'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../../components/layout/Header';
import Button from '../../../components/common/Button';

// 설정 페이지 — API 설정 + 기본 톤 + Extension 토큰 관리 + 7일 체험 상태
export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [defaultTone, setDefaultTone] = useState('friendly');
  const [defaultSignature, setDefaultSignature] = useState('감사합니다! - 스토어팀 드림');
  const [extensionToken, setExtensionToken] = useState('');
  const [trialDaysLeft, setTrialDaysLeft] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // API에서 설정 가져오기
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // 기본 톤 조회
        const toneRes = await fetch('/api/settings/tone');
        const toneData = await toneRes.json();
        if (toneData.success && toneData.data) {
          setDefaultTone(toneData.data.tone || 'friendly');
          setDefaultSignature(toneData.data.signature || '');
        }
        // 토큰 목록 조회
        const tokenRes = await fetch('/api/auth/token');
        const tokenData = await tokenRes.json();
        if (tokenData.success && tokenData.data && tokenData.data.length > 0) {
          setExtensionToken(tokenData.data[0].token);
        }
      } catch {
        // 기본값 유지
      }
    };
    fetchSettings();
  }, []);

  // 설정 저장
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 기본 톤에 해당하는 템플릿을 기본으로 설정
      const templatesRes = await fetch('/api/templates');
      const templatesData = await templatesRes.json();
      if (templatesData.success && templatesData.data) {
        const matchingTemplate = templatesData.data.find((t: any) => t.tone === defaultTone);
        if (matchingTemplate) {
          await fetch(`/api/templates/${matchingTemplate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDefault: true, signature: defaultSignature }),
          });
        }
      }
      alert('설정이 저장되었습니다.');
    } catch {
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // Extension 토큰 발급
  const handleGenerateToken = async () => {
    try {
      const res = await fetch('/api/auth/token', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setExtensionToken(data.data.token);
      }
    } catch {
      alert('토큰 발급에 실패했습니다.');
    }
  };

  // 토큰 복사
  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(extensionToken);
      alert('토큰이 클립보드에 복사되었습니다!');
    } catch {
      alert('복사에 실패했습니다.');
    }
  };

  return (
    <>
      <Header title="설정" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          {/* 7일 체험 상태 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
            <h3 className="text-lg font-semibold text-txt mb-3">체험 상태</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-txt-sub">무료 체험 기간</span>
                  <span className="text-sm font-semibold text-primary font-grotesk">{trialDaysLeft}일 남음</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${((7 - trialDaysLeft) / 7) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-txt-sub mt-2">체험 기간 동안 모든 기능을 제한 없이 사용할 수 있습니다.</p>
          </div>

          {/* API 설정 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
            <h3 className="text-lg font-semibold text-txt mb-4">AI API 설정</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-txt mb-1.5">Claude API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="sk-ant-..."
              />
              <p className="text-xs text-txt-sub mt-1">미설정 시 데모 응답이 생성됩니다.</p>
            </div>
          </div>

          {/* 기본 톤 설정 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
            <h3 className="text-lg font-semibold text-txt mb-4">기본 응답 설정</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-txt mb-1.5">기본 톤</label>
              <select
                value={defaultTone}
                onChange={(e) => setDefaultTone(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="friendly">친절한 톤</option>
                <option value="formal">격식 있는 톤</option>
                <option value="casual">캐주얼한 톤</option>
                <option value="professional">전문적인 톤</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-txt mb-1.5">기본 브랜드 서명</label>
              <input
                type="text"
                value={defaultSignature}
                onChange={(e) => setDefaultSignature(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="응답 끝에 자동 삽입될 서명 문구"
              />
            </div>
          </div>

          {/* Extension 토큰 관리 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
            <h3 className="text-lg font-semibold text-txt mb-4">Chrome Extension 토큰</h3>
            <p className="text-sm text-txt-sub mb-4">Chrome Extension에서 웹앱에 연결하기 위한 인증 토큰입니다.</p>
            {extensionToken ? (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={extensionToken}
                    className="flex-1 h-10 px-3 text-sm bg-bg border border-bdr rounded-lg font-grotesk"
                  />
                  <Button variant="secondary" onClick={handleCopyToken}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    복사
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={handleGenerateToken}>
                토큰 발급
              </Button>
            )}
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '저장 중...' : '설정 저장'}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
