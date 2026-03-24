'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../../components/layout/Header';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

// 스토어 관리 페이지 — 스토어 카드 목록 + 추가 모달
interface Store {
  id: string;
  name: string;
  platform: string;
  platformLabel: string;
  url: string;
  reviewCount: number;
  createdAt: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [addModal, setAddModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', platform: 'naver', url: '' });

  // API에서 스토어 목록 가져오기
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('/api/stores');
        const data = await res.json();
        if (data.success && data.data) setStores(data.data);
      } catch {
        setStores(defaultStores);
      }
    };
    fetchStores();
  }, []);

  const defaultStores: Store[] = [
    { id: '1', name: '프리미엄 전자샵', platform: 'naver', platformLabel: '네이버', url: 'https://smartstore.naver.com/premium-electronics', reviewCount: 523, createdAt: '2026.01.15' },
    { id: '2', name: '쿠팡 전자스토어', platform: 'coupang', platformLabel: '쿠팡', url: 'https://www.coupang.com/vp/products/premium', reviewCount: 412, createdAt: '2026.02.01' },
    { id: '3', name: '11번가 라이프샵', platform: '11st', platformLabel: '11번가', url: 'https://www.11st.co.kr/products/lifeshop', reviewCount: 312, createdAt: '2026.02.20' },
  ];

  const displayStores = stores.length > 0 ? stores : defaultStores;

  // 플랫폼 뱃지 색상
  const platformBadge: Record<string, { bg: string; text: string }> = {
    naver: { bg: 'bg-green-100', text: 'text-green-700' },
    coupang: { bg: 'bg-orange-100', text: 'text-orange-700' },
    '11st': { bg: 'bg-red-100', text: 'text-red-700' },
    other: { bg: 'bg-slate-100', text: 'text-txt-sub' },
  };

  // 플랫폼 라벨
  const platformLabels: Record<string, string> = {
    naver: '네이버',
    coupang: '쿠팡',
    '11st': '11번가',
    other: '기타',
  };

  // 스토어 추가
  const handleAdd = async () => {
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStores((prev) => [...prev, data.data]);
      }
    } catch {
      // 로컬 추가
      const store: Store = {
        id: String(Date.now()),
        name: newStore.name,
        platform: newStore.platform,
        platformLabel: platformLabels[newStore.platform] || '기타',
        url: newStore.url,
        reviewCount: 0,
        createdAt: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      };
      setStores((prev) => [...prev, store]);
    }
    setNewStore({ name: '', platform: 'naver', url: '' });
    setAddModal(false);
  };

  return (
    <>
      <Header title="스토어 관리" />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* 상단 액션 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-txt-sub">
            등록된 스토어 <span className="font-semibold text-txt font-grotesk">{displayStores.length}</span>개
          </p>
          <Button onClick={() => setAddModal(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" />
            </svg>
            스토어 추가
          </Button>
        </div>

        {/* 스토어 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStores.map((store) => {
            const badge = platformBadge[store.platform] || platformBadge.other;
            return (
              <div key={store.id} className="bg-white rounded-xl border border-bdr shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-txt">{store.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                    {store.platformLabel}
                  </span>
                </div>
                {store.url && (
                  <p className="text-xs text-txt-sub truncate mb-3">{store.url}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-txt-sub">리뷰 수</span>
                  <span className="font-semibold text-txt font-grotesk">{store.reviewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-txt-sub">등록일</span>
                  <span className="text-txt-sub font-grotesk">{store.createdAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 스토어 추가 모달 */}
        <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="스토어 추가">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-txt mb-1.5">스토어명</label>
              <input
                type="text"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="스토어 이름을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt mb-1.5">플랫폼</label>
              <select
                value={newStore.platform}
                onChange={(e) => setNewStore({ ...newStore, platform: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="naver">네이버</option>
                <option value="coupang">쿠팡</option>
                <option value="11st">11번가</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-txt mb-1.5">스토어 URL</label>
              <input
                type="url"
                value={newStore.url}
                onChange={(e) => setNewStore({ ...newStore, url: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="https://"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleAdd}>추가</Button>
              <Button variant="secondary" onClick={() => setAddModal(false)}>취소</Button>
            </div>
          </div>
        </Modal>
      </main>
    </>
  );
}
