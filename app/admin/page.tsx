'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  users: { email: string; name: string; role: string }[];
}

export default function AdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // 폼 상태
  const [form, setForm] = useState({
    tenantName: '',
    slug: '',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',
  });

  // 관리자 확인 + 업체 목록 로드
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'rptjs1000@gmail.com') {
        router.push('/dashboard');
        return;
      }

      try {
        const res = await fetch('/api/admin/tenants');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setTenants(json.data);
          }
        }
      } catch (err) {
        console.error('업체 목록 로드 실패:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  // 업체명 → slug 자동 생성
  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      tenantName: name,
      slug: name
        .toLowerCase()
        .replace(/[가-힣]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
    });
  };

  // 업체 추가
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    if (json.success) {
      setMessage(json.message);
      setForm({ tenantName: '', slug: '', ownerEmail: '', ownerName: '', ownerPassword: '' });
      setShowForm(false);
      // 목록 새로고침
      const listRes = await fetch('/api/admin/tenants');
      const listJson = await listRes.json();
      if (listJson.success) setTenants(listJson.data);
    } else {
      setError(json.error);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 헤더 */}
      <div className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">관리자 패널</h1>
          <p className="text-sm text-gray-400">업체 관리</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors"
          >
            대시보드로
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {showForm ? '취소' : '+ 업체 추가'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* 메시지 */}
        {message && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* 업체 추가 폼 */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold mb-2">새 업체 등록</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">업체명</label>
                <input
                  type="text"
                  value={form.tenantName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="예: 가람동물병원"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">슬러그 (URL용)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="예: garam-vet"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-300 pt-2">사장님 계정</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">사장님 이름</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  required
                  placeholder="예: 김가람"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">이메일</label>
                <input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  required
                  placeholder="예: garam@example.com"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">초기 비밀번호</label>
              <input
                type="text"
                value={form.ownerPassword}
                onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                required
                placeholder="6자 이상"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">사장님에게 전달할 초기 비밀번호입니다.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {submitting ? '생성 중...' : '업체 등록'}
            </button>
          </form>
        )}

        {/* 업체 목록 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">등록된 업체 ({tenants.length})</h2>

          {tenants.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border border-gray-800 rounded-xl">
              등록된 업체가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="p-5 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-white">{tenant.name}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-gray-400">
                      <span>slug: {tenant.slug}</span>
                      <span>플랜: {tenant.plan}</span>
                      <span>
                        가입일: {new Date(tenant.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {tenant.users && tenant.users.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        {tenant.users.map((u) => (
                          <span key={u.email} className="mr-3">
                            {u.name} ({u.email})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="px-3 py-1 text-xs bg-green-900/30 text-green-400 border border-green-800 rounded-full">
                    활성
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
