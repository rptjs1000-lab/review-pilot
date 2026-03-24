'use client';

import React, { useState } from 'react';
import Header from '../../../components/layout/Header';
import Button from '../../../components/common/Button';

// 지원 플랫폼 목록
const platforms = [
  {
    id: 'naver',
    name: '네이버 스마트스토어',
    icon: '🟢',
    urlPlaceholder: 'https://smartstore.naver.com/내스토어명',
    status: 'available' as const,
    description: 'Extension으로 리뷰 자동응답 지원',
  },
  {
    id: 'coupang',
    name: '쿠팡',
    icon: '🟠',
    urlPlaceholder: 'https://www.coupang.com/vp/products/...',
    status: 'coming' as const,
    description: '2026년 상반기 지원 예정',
  },
  {
    id: '11st',
    name: '11번가',
    icon: '🔴',
    urlPlaceholder: 'https://www.11st.co.kr/products/...',
    status: 'coming' as const,
    description: '2026년 상반기 지원 예정',
  },
  {
    id: 'gmarket',
    name: 'G마켓/옥션',
    icon: '🟡',
    urlPlaceholder: 'https://www.gmarket.co.kr/...',
    status: 'coming' as const,
    description: '2026년 하반기 지원 예정',
  },
  {
    id: 'cafe24',
    name: '카페24 (자사몰)',
    icon: '🔵',
    urlPlaceholder: 'https://내브랜드.cafe24.com',
    status: 'coming' as const,
    description: 'API 연동 준비 중',
  },
  {
    id: 'imweb',
    name: '아임웹 (자사몰)',
    icon: '🟣',
    urlPlaceholder: 'https://내브랜드.imweb.me',
    status: 'coming' as const,
    description: 'API 연동 준비 중',
  },
  {
    id: 'custom',
    name: '기타 자사몰',
    icon: '⚪',
    urlPlaceholder: 'https://내브랜드.com',
    status: 'coming' as const,
    description: '직접 URL 입력 — 향후 지원',
  },
];

// 등록된 스토어 상태
interface RegisteredStore {
  platformId: string;
  storeName: string;
  url: string;
  enabled: boolean;
}

export default function StoresPage() {
  const [registeredStores, setRegisteredStores] = useState<RegisteredStore[]>([
    // 기본값: 네이버 스토어 1개 등록된 상태
    { platformId: 'naver', storeName: '프리미엄 전자샵', url: 'https://smartstore.naver.com/premium-electronics', enabled: true },
  ]);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ storeName: '', url: '' });
  const [saved, setSaved] = useState(false);

  // 플랫폼이 등록되어 있는지 확인
  const getRegistered = (platformId: string) =>
    registeredStores.find((s) => s.platformId === platformId);

  // 플랫폼 등록/수정 시작
  const handleStartEdit = (platformId: string) => {
    const existing = getRegistered(platformId);
    setEditForm({
      storeName: existing?.storeName || '',
      url: existing?.url || '',
    });
    setEditingPlatform(platformId);
  };

  // 저장
  const handleSave = (platformId: string) => {
    if (!editForm.storeName.trim()) return;

    setRegisteredStores((prev) => {
      const exists = prev.find((s) => s.platformId === platformId);
      if (exists) {
        return prev.map((s) =>
          s.platformId === platformId
            ? { ...s, storeName: editForm.storeName, url: editForm.url, enabled: true }
            : s
        );
      }
      return [...prev, { platformId, storeName: editForm.storeName, url: editForm.url, enabled: true }];
    });
    setEditingPlatform(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 등록 해제
  const handleRemove = (platformId: string) => {
    setRegisteredStores((prev) => prev.filter((s) => s.platformId !== platformId));
    setEditingPlatform(null);
  };

  // 토글
  const handleToggle = (platformId: string) => {
    setRegisteredStores((prev) =>
      prev.map((s) =>
        s.platformId === platformId ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  return (
    <>
      <Header title="내 스토어 관리" />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl">
          {/* 안내 */}
          <div className="mb-6">
            <p className="text-sm text-txt-sub">
              운영 중인 쇼핑몰을 등록하면 해당 플랫폼의 리뷰를 수집하고 자동응답을 관리할 수 있습니다.
            </p>
          </div>

          {/* 저장 완료 토스트 */}
          {saved && (
            <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-success/20 rounded-lg text-sm text-success">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              스토어 정보가 저장되었습니다.
            </div>
          )}

          {/* 플랫폼 목록 */}
          <div className="space-y-3">
            {platforms.map((platform) => {
              const registered = getRegistered(platform.id);
              const isEditing = editingPlatform === platform.id;
              const isAvailable = platform.status === 'available';

              return (
                <div
                  key={platform.id}
                  className={`bg-white rounded-xl border shadow-sm transition-all ${
                    registered?.enabled
                      ? 'border-primary/30'
                      : 'border-bdr'
                  }`}
                >
                  {/* 헤더 행 */}
                  <div className="flex items-center gap-4 p-5">
                    {/* 아이콘 */}
                    <span className="text-2xl">{platform.icon}</span>

                    {/* 플랫폼 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-txt">{platform.name}</h3>
                        {isAvailable ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-success rounded">연동 가능</span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-txt-sub rounded">준비 중</span>
                        )}
                      </div>
                      <p className="text-xs text-txt-sub mt-0.5">{platform.description}</p>

                      {/* 등록된 스토어 정보 표시 */}
                      {registered && !isEditing && (
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="text-txt font-medium">{registered.storeName}</span>
                          {registered.url && (
                            <span className="text-txt-sub truncate max-w-[200px]">{registered.url}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 우측 액션 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {registered && !isEditing && (
                        <>
                          {/* 활성/비활성 토글 */}
                          <button
                            onClick={() => handleToggle(platform.id)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              registered.enabled ? 'bg-primary' : 'bg-slate-200'
                            }`}
                            aria-label={registered.enabled ? '비활성화' : '활성화'}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                registered.enabled ? 'left-[22px]' : 'left-0.5'
                              }`}
                            />
                          </button>
                          {/* 수정 버튼 */}
                          <button
                            onClick={() => handleStartEdit(platform.id)}
                            className="px-2.5 py-1.5 text-xs text-txt-sub hover:text-txt border border-bdr rounded-lg hover:bg-bg transition-colors"
                          >
                            수정
                          </button>
                        </>
                      )}
                      {!registered && !isEditing && (
                        <Button
                          variant={isAvailable ? 'primary' : 'secondary'}
                          onClick={() => handleStartEdit(platform.id)}
                        >
                          {isAvailable ? '등록' : '사전 등록'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 편집 폼 — 펼침 */}
                  {isEditing && (
                    <div className="px-5 pb-5 pt-0 border-t border-bdr/50">
                      <div className="pt-4 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-txt mb-1">스토어명</label>
                          <input
                            type="text"
                            value={editForm.storeName}
                            onChange={(e) => setEditForm({ ...editForm, storeName: e.target.value })}
                            className="w-full h-9 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="내 스토어 이름"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-txt mb-1">스토어 URL</label>
                          <input
                            type="url"
                            value={editForm.url}
                            onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                            className="w-full h-9 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder={platform.urlPlaceholder}
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button onClick={() => handleSave(platform.id)}>저장</Button>
                          <Button variant="secondary" onClick={() => setEditingPlatform(null)}>취소</Button>
                          {registered && (
                            <button
                              onClick={() => handleRemove(platform.id)}
                              className="ml-auto text-xs text-danger hover:underline"
                            >
                              등록 해제
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 하단 안내 */}
          <div className="mt-6 flex items-start gap-2 px-4 py-3 bg-primary-light rounded-lg">
            <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-primary leading-relaxed">
              현재 네이버 스마트스토어만 Extension을 통한 자동응답이 지원됩니다. 다른 플랫폼은 사전 등록해두시면 지원 시작 시 알려드립니다.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
