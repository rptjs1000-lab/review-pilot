'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../../components/layout/Header';
import Button from '../../../components/common/Button';

// 설정 페이지 — API 설정 + 기본 톤 + Extension 토큰 관리 + 7일 체험 상태
export default function SettingsPage() {
  const [defaultTone, setDefaultTone] = useState('friendly');
  const [defaultSignature, setDefaultSignature] = useState('감사합니다! - 스토어팀 드림');
  const [extensionToken, setExtensionToken] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // API에서 설정 가져오기 + 토큰 자동 발급
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
        // 토큰 조회 — 없으면 자동 발급
        const tokenRes = await fetch('/api/auth/token');
        const tokenData = await tokenRes.json();
        if (tokenData.success && tokenData.data && tokenData.data.length > 0) {
          setExtensionToken(tokenData.data[0].token);
        } else {
          // 토큰이 없으면 자동 발급
          const newTokenRes = await fetch('/api/auth/token', { method: 'POST' });
          const newTokenData = await newTokenRes.json();
          if (newTokenData.success && newTokenData.data) {
            setExtensionToken(newTokenData.data.token);
          }
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

  // 토큰 복사
  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(extensionToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
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

          {/* Chrome Extension 연결 */}
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
            <h3 className="text-lg font-semibold text-txt mb-2">Chrome Extension 연결</h3>
            <p className="text-sm text-txt-sub mb-4">
              스마트스토어 관리자 페이지에서 자동응답을 사용하려면 Chrome Extension을 설치하세요.
            </p>

            {/* 연결 토큰 — 자동 발급됨 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-txt mb-1.5">연결 토큰</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={extensionToken || '발급 중...'}
                  className="flex-1 h-10 px-3 text-sm bg-bg border border-bdr rounded-lg font-grotesk select-all"
                />
                <Button variant="secondary" onClick={handleCopyToken} disabled={!extensionToken}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {tokenCopied ? '복사됨!' : '복사'}
                </Button>
              </div>
              <p className="text-xs text-txt-sub mt-1.5">이 토큰을 Extension 팝업에 붙여넣으면 자동으로 연결됩니다.</p>
            </div>

            {/* 설치 가이드 */}
            <div className="bg-bg rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-txt">Extension 설치 방법</p>
              <ol className="text-sm text-txt-sub space-y-1 list-decimal list-inside">
                <li>Chrome 주소창에 <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-bdr">chrome://extensions</code> 입력</li>
                <li>우측 상단 <strong>개발자 모드</strong> 활성화</li>
                <li><strong>압축해제된 확장 프로그램을 로드합니다</strong> 클릭</li>
                <li>프로젝트의 <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-bdr">extension/</code> 폴더 선택</li>
                <li>Extension 팝업에서 위 토큰을 붙여넣기</li>
              </ol>
            </div>
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
