'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function MentorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params?.id as string;

  // 임시 데이터 - 추후 실제 데이터로 교체
  const mentor = {
    id: mentorId,
    name: '이원준',
    avatar: '👨‍🍳',
    field: '마케팅/식품 기획',
    company: 'CJ제일제당',
    experience: '입사 2년차',
    status: '온라인',
    description: '트렌드를 읽고 실행하는 식품 마케터입니다. "스펙보다 회사가 왜 나를 뽑아야 하는지" 설명할 수 있었던 게 합격의 킥이었습니다.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">멘토 프로필</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-28 h-28 bg-gray-800 rounded-full flex items-center justify-center text-6xl shadow-xl flex-shrink-0">
              {mentor.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{mentor.name}</h2>
                {mentor.status === '온라인' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    온라인
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-lg mb-1">{mentor.field}</p>
              <p className="text-gray-500">{mentor.company} · {mentor.experience}</p>
            </div>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💬</span>
            자기소개
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">{mentor.description}</p>
        </div>

        {/* 채팅하기 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-t-3xl shadow-2xl">
          <button
            onClick={() => router.push(`/chat/${mentor.id}`)}
            className="w-full h-14 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
          >
            {mentor.name} 멘토님과 채팅하기
          </button>
        </div>
      </div>
    </div>
  );
}
