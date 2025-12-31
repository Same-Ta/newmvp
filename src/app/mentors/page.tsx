'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface Mentor {
  id: number;
  name: string;
  age: number;
  field: string;
  company: string;
  experience: string;
  description: string;
  avatar: string;
  tags: string[];
}

const mentors: Mentor[] = [
  {
    id: 1,
    name: '김멘토',
    age: 32,
    field: '프론트엔드 개발',
    company: '네이버',
    experience: '10년',
    description: '네이버에서 10년간 프론트엔드 개발을 해왔습니다. React, Next.js 전문가입니다.',
    avatar: '👨‍💻',
    tags: ['React', 'Next.js', 'TypeScript'],
  },
  {
    id: 2,
    name: '이멘토',
    age: 29,
    field: 'UX/UI 디자인',
    company: '카카오',
    experience: '7년',
    description: '카카오에서 다양한 서비스의 UX/UI를 디자인했습니다. 사용자 중심 디자인을 추구합니다.',
    avatar: '👩‍🎨',
    tags: ['Figma', 'UX Research', 'Design System'],
  },
  {
    id: 3,
    name: '박멘토',
    age: 35,
    field: '백엔드 개발',
    company: '토스',
    experience: '12년',
    description: '토스에서 대규모 트래픽 처리 경험이 있습니다. 시스템 아키텍처 전문가입니다.',
    avatar: '👨‍💼',
    tags: ['Java', 'Spring', 'MSA'],
  },
  {
    id: 4,
    name: '최멘토',
    age: 28,
    field: '데이터 분석',
    company: '쿠팡',
    experience: '6년',
    description: '쿠팡에서 데이터 분석과 머신러닝 모델을 개발합니다. Python과 SQL 전문가입니다.',
    avatar: '👩‍💻',
    tags: ['Python', 'SQL', 'Machine Learning'],
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = useCallback((swipeDirection: 'left' | 'right') => {
    setDirection(swipeDirection);
    setTimeout(() => {
      if (currentIndex < mentors.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
      setDirection(null);
    }, 300);
  }, [currentIndex]);

  const handleLike = useCallback(() => {
    handleSwipe('right');
  }, [handleSwipe]);

  const handlePass = useCallback(() => {
    handleSwipe('left');
  }, [handleSwipe]);

  const currentMentor = mentors[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="p-6 bg-white shadow-sm flex-shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="뒤로">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">멘토 찾기</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="검색">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 멘토 카드 영역 - 전체 화면 */}
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="flex-1 relative px-6 py-6">
          <div className={`absolute inset-x-6 inset-y-6 transition-all duration-300 ${
            direction === 'left' ? '-translate-x-full rotate-12 opacity-0' :
            direction === 'right' ? 'translate-x-full -rotate-12 opacity-0' :
            'translate-x-0 rotate-0 opacity-100'
          }`}>
            <div className="bg-white rounded-3xl shadow-xl h-full flex flex-col overflow-hidden">
              {/* 프로필 상단 */}
              <div className="p-8 flex flex-col items-center border-b border-gray-100">
                <div className="w-28 h-28 bg-gray-800 rounded-full flex items-center justify-center text-6xl mb-4 shadow-lg">
                  {currentMentor.avatar}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{currentMentor.name}</h2>
                <p className="text-gray-500 mt-1">{currentMentor.field}</p>
                
                {/* SNS 아이콘들 */}
                <div className="flex gap-3 mt-4">
                  <button className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* 스킬 섹션 */}
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Skill</h3>
                <div className="flex gap-3">
                  {currentMentor.tags.slice(0, 4).map((tag, index) => (
                    <div key={index} className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-gray-700">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profession */}
              <div className="px-8 py-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Profession</h3>
                <p className="text-gray-900 font-medium">{currentMentor.company}</p>
              </div>

              {/* Experience */}
              <div className="px-8 py-6 flex-1">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Experience</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 font-medium">{currentMentor.field}</p>
                  <p className="text-xs text-gray-500 mt-1">경력 {currentMentor.experience}</p>
                </div>
              </div>

              {/* 하단 버튼 영역 */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex gap-3">
                  <button
                    onClick={handlePass}
                    className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all active:scale-95"
                    aria-label="패스"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <Link href={`/chat/${currentMentor.id}`} className="flex-1">
                    <button className="w-full h-14 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all active:scale-95">
                      채팅하기
                    </button>
                  </Link>

                  <button
                    onClick={handleLike}
                    className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center hover:scale-105 transition-all active:scale-95 shadow-lg"
                    aria-label="좋아요"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                
                <Link href={`/mentor/${currentMentor.id}`}>
                  <button className="w-full mt-3 py-3 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors">
                    프로필 자세히 보기
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="px-8 py-4 flex items-center justify-center gap-2 flex-shrink-0">
          {mentors.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-gray-800' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-1 py-2 px-6" aria-label="멘토">
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </Link>
          
          <Link href="/chats" className="flex flex-col items-center gap-1 py-2 px-6" aria-label="채팅">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>
          
          <Link href="/products" className="flex flex-col items-center gap-1 py-2 px-6" aria-label="스토어">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </Link>
        </div>
      </nav>
    </div>
  );
}
