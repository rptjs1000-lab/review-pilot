'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../../components/layout/Header';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

// 응답 템플릿 페이지 — 톤 프리셋 목록 + 편집 + 미리보기
interface Template {
  id: string;
  name: string;
  tone: string;
  description: string;
  signature: string;
  isDefault: boolean;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editModal, setEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewContent, setPreviewContent] = useState('');

  // API에서 템플릿 목록 가져오기
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/templates');
        const data = await res.json();
        if (data.success && data.data) setTemplates(data.data);
      } catch {
        // 기본 데이터
        setTemplates(defaultTemplates);
      }
    };
    fetchTemplates();
  }, []);

  const defaultTemplates: Template[] = [
    { id: '1', name: '친절한 톤', tone: 'friendly', description: '따뜻하고 친근한 어조로 응답합니다. 이모지를 적절히 사용합니다.', signature: '감사합니다! - 스토어팀 드림', isDefault: true },
    { id: '2', name: '격식 있는 톤', tone: 'formal', description: '정중하고 격식 있는 어조로 응답합니다. 존대말을 철저히 사용합니다.', signature: '감사합니다. - 고객지원팀', isDefault: false },
    { id: '3', name: '캐주얼한 톤', tone: 'casual', description: '편안하고 가벼운 어조로 응답합니다. 친구같은 느낌을 줍니다.', signature: '항상 응원합니다! - 스토어', isDefault: false },
    { id: '4', name: '전문적인 톤', tone: 'professional', description: '전문성과 신뢰감이 느껴지는 어조로 응답합니다.', signature: '감사합니다. - 전문 상담팀', isDefault: false },
  ];

  const displayTemplates = templates.length > 0 ? templates : defaultTemplates;

  // 톤 뱃지 색상 매핑
  const toneBadge: Record<string, { bg: string; text: string }> = {
    friendly: { bg: 'bg-emerald-50', text: 'text-success' },
    formal: { bg: 'bg-primary-light', text: 'text-primary' },
    casual: { bg: 'bg-amber-50', text: 'text-warning' },
    professional: { bg: 'bg-purple-50', text: 'text-purple-500' },
    custom: { bg: 'bg-slate-100', text: 'text-txt-sub' },
  };

  // 편집 모달 열기
  const handleEdit = (template: Template) => {
    setEditingTemplate({ ...template });
    setEditModal(true);
  };

  // L-7: 미리보기 생성 — /api/extension/generate 엔드포인트를 재활용하여 샘플 리뷰에 대한 응답 생성
  const handlePreview = async (template: Template) => {
    try {
      const res = await fetch('/api/extension/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '정말 좋은 상품이에요. 품질이 기대 이상이고 배송도 빨랐습니다. 다음에도 구매할 예정입니다.',
          rating: 5,
          tone: template.tone,
          productName: '샘플 상품',
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.content) {
        setPreviewContent(data.data.content);
      } else {
        // API 실패 시 클라이언트 측 mock 미리보기
        setPreviewContent(getMockPreview(template));
      }
    } catch {
      // 네트워크 오류 시 클라이언트 측 mock 미리보기
      setPreviewContent(getMockPreview(template));
    }
  };

  // 클라이언트 측 mock 미리보기 생성
  const getMockPreview = (template: Template): string => {
    const toneMessages: Record<string, string> = {
      friendly: `고객님, 따뜻한 리뷰 남겨주셔서 정말 감사합니다! 상품에 만족하셨다니 저희도 큰 보람을 느낍니다. 앞으로도 최고의 품질로 보답하겠습니다. 다음에도 꼭 찾아주세요!\n\n${template.signature || '— 스토어팀 드림'}`,
      formal: `안녕하세요, 고객님. 소중한 리뷰를 남겨 주셔서 진심으로 감사드립니다. 저희 상품에 만족하셨다니 대단히 기쁩니다. 앞으로도 더 나은 서비스로 보답하겠습니다.\n\n${template.signature || '— 고객지원팀'}`,
      casual: `리뷰 감사해요! 마음에 드셨다니 정말 기쁘네요~ 다음에도 좋은 상품으로 찾아뵐게요! 😊\n\n${template.signature || '— 스토어'}`,
      professional: `귀중한 피드백에 감사드립니다. 고객님께서 만족하신 품질 기준을 지속적으로 유지하기 위해 최선을 다하겠습니다. 추가 문의 사항이 있으시면 언제든 연락 주시기 바랍니다.\n\n${template.signature || '— 전문 상담팀'}`,
    };
    return toneMessages[template.tone] || toneMessages.friendly;
  };

  // 저장
  const handleSave = async () => {
    if (!editingTemplate) return;
    try {
      await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
      });
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t))
      );
    } catch {
      // 로컬 업데이트
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t))
      );
    }
    setEditModal(false);
  };

  return (
    <>
      <Header title="응답 템플릿" />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* 템플릿 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {displayTemplates.map((template) => {
            const badge = toneBadge[template.tone] || toneBadge.custom;
            return (
              <div key={template.id} className="bg-white rounded-xl border border-bdr shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-txt">{template.name}</h3>
                    {template.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-light text-primary">기본</span>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                    {template.tone}
                  </span>
                </div>
                <p className="text-sm text-txt-sub leading-[1.6] mb-4">{template.description}</p>
                {template.signature && (
                  <div className="px-3 py-2 bg-bg rounded-lg mb-4">
                    <p className="text-xs text-txt-sub mb-0.5">브랜드 서명</p>
                    <p className="text-sm text-txt">{template.signature}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => handleEdit(template)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    편집
                  </Button>
                  <Button variant="ghost" onClick={() => handlePreview(template)}>
                    미리보기
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 미리보기 영역 */}
        {previewContent && (
          <div className="bg-white rounded-xl border border-bdr shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-txt">미리보기</h3>
              <button onClick={() => setPreviewContent('')} className="text-txt-sub hover:text-txt">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-txt leading-[1.8] whitespace-pre-line">{previewContent}</p>
          </div>
        )}

        {/* 편집 모달 */}
        <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="템플릿 편집">
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-txt mb-1.5">템플릿 이름</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-txt mb-1.5">톤 설명</label>
                <textarea
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-txt mb-1.5">브랜드 서명</label>
                <input
                  type="text"
                  value={editingTemplate.signature}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, signature: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-white border border-bdr rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave}>저장</Button>
                <Button variant="secondary" onClick={() => setEditModal(false)}>취소</Button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </>
  );
}
