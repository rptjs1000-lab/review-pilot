'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/layout/Header';
import ReviewFilters from '../../../components/reviews/ReviewFilters';
import ReviewTable from '../../../components/reviews/ReviewTable';
import Pagination from '../../../components/common/Pagination';
import { Review } from '../../../types';

// 리뷰 관리 페이지 — 필터 바 + 리뷰 테이블 + 페이지네이션 + 일괄 응답 생성
export default function ReviewsPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState('');
  const [rating, setRating] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // ReviewTable에서 사용하는 표시용 타입
  interface ReviewDisplayRow {
    id: string;
    platform: string;
    platformLabel: string;
    productName: string;
    rating: number;
    summary: string;
    status: 'pending' | 'responded' | 'hold';
    createdAt: string;
  }
  const [reviews, setReviews] = useState<ReviewDisplayRow[]>([]);
  const [totalItems, setTotalItems] = useState(1247);
  const itemsPerPage = 5;

  // API에서 리뷰 목록 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const params = new URLSearchParams();
        if (platform) params.set('platform', platform);
        if (rating) params.set('rating', rating);
        if (status) params.set('status', status);
        if (search) params.set('search', search);
        params.set('page', String(currentPage));
        params.set('limit', String(itemsPerPage));

        const res = await fetch(`/api/reviews?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.data) {
          setReviews(data.data);
          setTotalItems(data.pagination?.total || data.data.length);
        }
      } catch {
        // API 실패 시 기본 데이터 사용
        setReviews(defaultReviews);
      }
    };
    fetchReviews();
  }, [platform, rating, status, search, currentPage]);

  // 기본 데이터 (API 실패 시)
  const defaultReviews = [
    { id: '1', platform: 'naver', platformLabel: '네이버', productName: '프리미엄 무선 이어폰 Pro', rating: 5, summary: '음질이 정말 좋고 노이즈캔슬링이 완벽해요...', status: 'responded' as const, createdAt: '2026.03.23' },
    { id: '2', platform: 'coupang', platformLabel: '쿠팡', productName: '스마트 공기청정기 AX300', rating: 4, summary: '성능은 좋은데 소음이 좀 있어요...', status: 'pending' as const, createdAt: '2026.03.23' },
    { id: '3', platform: 'naver', platformLabel: '네이버', productName: '유기농 그래놀라 세트', rating: 5, summary: '건강한 맛이에요. 재구매 의사 있습니다...', status: 'responded' as const, createdAt: '2026.03.22' },
    { id: '4', platform: 'naver', platformLabel: '네이버', productName: '스테인리스 텀블러 500ml', rating: 2, summary: '뚜껑에서 물이 새요. 교환 요청합니다...', status: 'hold' as const, createdAt: '2026.03.22' },
    { id: '5', platform: 'coupang', platformLabel: '쿠팡', productName: '초경량 접이식 우산', rating: 3, summary: '가볍긴 한데 바람에 좀 약해요...', status: 'pending' as const, createdAt: '2026.03.21' },
  ];

  // 리뷰 데이터가 비어있으면 기본 데이터 사용
  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;

  // 전체 선택
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(displayReviews.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 개별 선택
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // 행 클릭 → 상세 페이지 이동
  const handleRowClick = (id: string) => {
    router.push(`/reviews/${id}`);
  };

  // 일괄 응답 생성
  const handleBulkGenerate = async () => {
    if (selectedIds.length === 0) {
      alert('리뷰를 선택해주세요.');
      return;
    }
    try {
      await fetch('/api/reviews/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewIds: selectedIds }),
      });
      alert(`${selectedIds.length}건의 응답 생성을 요청했습니다.`);
      setSelectedIds([]);
    } catch {
      alert('일괄 응답 생성에 실패했습니다.');
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <>
      <Header title="리뷰 관리" />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* 필터 바 */}
        <ReviewFilters
          platform={platform}
          rating={rating}
          status={status}
          search={search}
          onPlatformChange={setPlatform}
          onRatingChange={setRating}
          onStatusChange={setStatus}
          onSearchChange={setSearch}
          onBulkGenerate={handleBulkGenerate}
        />

        {/* 리뷰 테이블 */}
        <ReviewTable
          reviews={displayReviews}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onRowClick={handleRowClick}
        />

        {/* 페이지네이션 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </main>
    </>
  );
}
