'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// 빌드 시 정적 생성 방지
export const dynamic = 'force-dynamic';

// 멘토 정보 가져오기 (chat/[id]/page.tsx에서 동일한 데이터 사용)
const chatInfo: { [key: string]: { name: string; status: string; avatar: string; field: string; company: string; experience: string; description: string } } = {
  '1': { name: '마감히어로', status: '온라인', avatar: '/magam-hero-logo.svg', field: '지역 기반 마감 할인 플랫폼', company: '주식회사 마히(MAHI)', experience: '소셜벤처', description: '마감히어로는 동네 상점의 마감 할인 정보를 실시간으로 제공하는 지역 기반 플랫폼입니다. 음식물 폐기를 줄여 환경을 보호하고, 소상공인에게는 추가 수익을, 소비자에게는 알뜰한 쇼핑 기회를 제공합니다. 중소벤처기업부 예비창업패키지 선정, 학생창업유망팀 300+ 최종 선발 등 검증된 소셜벤처입니다.' },
};

const recommendedQuestions: { [key: string]: string[] } = {
  '1': ['마감히어로는 어떤 서비스인가요?', '소상공인은 어떻게 참여할 수 있나요?', '탄소 감축 효과는 어떻게 측정하나요?'],
};

export default function ChatWelcomePage() {
  const router = useRouter();
  const [showMentorSelector, setShowMentorSelector] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const mentorList = Object.entries(chatInfo).map(([id, info]) => ({
    id,
    ...info
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="text-gray-800 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            aria-label="홈으로"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">취준로드</h1>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* 환영 메시지 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-green-500 rounded-full"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              취준로드에 오신 것을<br/>환영합니다!
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              마감히어로와 함께<br/>
              여러분의 성장을 시작하세요
            </p>
          </div>

          {/* 주요 기능 소개 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">비즈니스 솔루션</h3>
                <p className="text-sm text-gray-600">멘토링, 컨설팅, 교육 등 다양한 서비스</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">전문 멘토링</h3>
                <p className="text-sm text-gray-600">경험 많은 전문가의 1:1 맞춤 멘토링</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">목표 달성 지원</h3>
                <p className="text-sm text-gray-600">체계적인 프로세스로 목표를 향해 함께</p>
              </div>
            </div>
          </div>

          {/* CTA 버튼 */}
          <button
            onClick={() => setShowMentorSelector(true)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            멘토 프로필 리스트 보기
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            마감히어로 프로필을 확인하고<br/>
            대화를 시작하세요!
          </p>
        </div>
      </main>

      {/* 멘토 선택 모달 */}
      {showMentorSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">멘토 선택</h2>
                <button
                  onClick={() => setShowMentorSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">카드를 넘기며 멘토를 선택하세요</p>
            </div>

            {/* 카드 영역 */}
            <div className="relative h-[720px] overflow-hidden bg-green-50">
              {/* 이전 버튼 */}
              <button
                onClick={() => {
                  if (currentCardIndex > 0) {
                    setCurrentCardIndex(currentCardIndex - 1);
                  } else {
                    setCurrentCardIndex(mentorList.length - 1);
                  }
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
                aria-label="이전"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* 다음 버튼 */}
              <button
                onClick={() => {
                  if (currentCardIndex < mentorList.length - 1) {
                    setCurrentCardIndex(currentCardIndex + 1);
                  } else {
                    setCurrentCardIndex(0);
                  }
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95"
                aria-label="다음"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {mentorList.map((mentor, index) => {
                const offset = index - currentCardIndex;
                const isVisible = Math.abs(offset) <= 2;
                
                if (!isVisible) return null;

                return (
                  <div
                    key={mentor.id}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out px-16"
                    style={{
                      transform: `translateX(${offset * 100}%) scale(${1 - Math.abs(offset) * 0.05})`,
                      opacity: offset === 0 ? 1 : 0.3,
                      zIndex: 10 - Math.abs(offset),
                      pointerEvents: offset === 0 ? 'auto' : 'none',
                    }}
                  >
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden h-[680px] mx-auto flex flex-col">
                      {/* 프로필 상단 - 고정 */}
                      <div className="p-8 flex flex-col items-center border-b border-gray-100 flex-shrink-0">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden relative">
                          {mentor.avatar.startsWith('/') ? (
                            <Image
                              src={mentor.avatar}
                              alt={mentor.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-5xl">{mentor.avatar}</span>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">{mentor.field}</p>
                      </div>

                      {/* 스크롤 가능한 콘텐츠 영역 */}
                      <div className="flex-1 overflow-y-auto">
                        {/* 회사 및 경력 */}
                        <div className="px-8 py-4 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</h3>
                            {mentor.status === '온라인' && (
                              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                온라인
                              </span>
                            )}
                          </div>
                          <p className="text-gray-900 font-semibold text-lg">{mentor.company}</p>
                        </div>

                        {/* 경력 */}
                        <div className="px-8 py-4 border-b border-gray-100">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Experience</h3>
                          <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-sm text-gray-700 font-medium">{mentor.field}</p>
                            <p className="text-xs text-gray-500 mt-1">경력 {mentor.experience}</p>
                          </div>
                        </div>

                        {/* 자기소개 */}
                        <div className="px-8 py-4 border-b border-gray-100">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">About</h3>
                          <p className="text-sm text-gray-700 leading-relaxed">{mentor.description}</p>
                        </div>

                        {/* 추천 질문 */}
                        <div className="px-8 py-4 bg-green-50">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">추천 질문</h3>
                          <div className="space-y-1.5">
                            {recommendedQuestions[mentor.id]?.slice(0, 2).map((q, i) => (
                              <p key={i} className="text-xs text-gray-600 line-clamp-1 pl-3 relative before:content-['•'] before:absolute before:left-0">
                                {q}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 하단 버튼 영역 - 고정 */}
                      <div className="p-8 border-t border-gray-100 flex-shrink-0">
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              router.push(`/mentor/${mentor.id}`);
                            }}
                            className="flex-1 h-14 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all active:scale-95 text-sm"
                          >
                            프로필 자세히 보기
                          </button>

                          <button
                            onClick={() => {
                              router.push(`/chat/${mentor.id}`);
                            }}
                            className="flex-1 h-14 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all active:scale-95"
                          >
                            채팅하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 카드 인디케이터 */}
            <div className="p-4 flex items-center justify-center gap-2">
              {mentorList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCardIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentCardIndex 
                      ? 'w-8 bg-green-500' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`멘토 ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
