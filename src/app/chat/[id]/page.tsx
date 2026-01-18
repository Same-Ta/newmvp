'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// 빌드 시 정적 생성 방지
export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'other' | 'admin';
  timestamp: any;
  type: 'text' | 'audio' | 'date';
  duration?: number;
}

const chatInfo: { [key: string]: { name: string; status: string; avatar: string; field: string; company: string; experience: string; description: string } } = {
  '1': { name: '마감히어로', status: '온라인', avatar: '/magam-hero-logo.svg', field: '지역 기반 마감 할인 플랫폼', company: '주식회사 마히(MAHI)', experience: '소셜벤처', description: '마감히어로는 동네 상점의 마감 할인 정보를 실시간으로 제공하는 지역 기반 플랫폼입니다. 음식물 폐기를 줄여 환경을 보호하고, 소상공인에게는 추가 수익을, 소비자에게는 알뜰한 쇼핑 기회를 제공합니다. 중소벤처기업부 예비창업패키지 선정, 학생창업유망팀 300+ 최종 선발 등 검증된 소셜벤처입니다.' },
};

const recommendedQuestions: { [key: string]: string[] } = {
  '1': ['마감 할인은 어떻게 이용하나요?', '소상공인 가입 방법이 궁금합니다', '어떤 지역에서 서비스를 이용할 수 있나요?', '할인율은 평균 얼마나 되나요?', '환경보호 효과는 어떻게 측정하나요?', '픽업 시간은 언제까지인가요?', '마감히어로의 비전이 궁금합니다', '신규 방문 고객이 많다는데 실제 효과가 있나요?'],
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params?.id as string; // 멘토 ID
  const chat = chatInfo[mentorId] || { name: '사용자', status: '온라인', avatar: '👤' };

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showMentorSelector, setShowMentorSelector] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [authChecking, setAuthChecking] = useState(true); // 인증 확인 중 상태
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Firebase Auth 사용자 ID 초기화
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Chat page auth state:', user ? `✅ Logged in: ${user.email}` : '❌ Not logged in');
      
      if (user) {
        setUserId(user.uid);
        setAuthChecking(false);
      } else {
        // 약간의 지연 후 리다이렉트 (모바일에서 로그인 상태 로드 대기)
        setTimeout(() => {
          setAuthChecking(false);
          // 로그인이 필요한 경우 알림 후 랜딩페이지로 이동
          console.log('❌ No user found, redirecting to home...');
          alert('로그인 후 이용해주시기 바랍니다.');
          router.push('/');
        }, 500);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 멘토 목록 생성
  const mentorList = Object.entries(chatInfo).map(([id, info]) => ({
    id,
    ...info
  }));

  const handleShowProfile = useCallback(() => {
    if (!mentorId) return;
    const mentor = chatInfo[mentorId];
    if (!mentor) return;

    // 로컬 state에만 추가 (데이터베이스에 저장 안 함)
    const profileMessage: Message = {
      id: `local-${Date.now()}`,
      text: `📋 ${mentor.name} 멘토님의 프로필\n\n직무: ${mentor.field}\n회사: ${mentor.company}\n경력: ${mentor.experience}\n\n${mentor.description}`,
      sender: 'other',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, profileMessage]);
    setShowQuickActions(false);
  }, [mentorId]);

  const handleShowQuestions = useCallback(() => {
    if (!mentorId) return;
    const questions = recommendedQuestions[mentorId] || [];
    if (questions.length === 0) return;

    // 로컬 state에만 추가 (데이터베이스에 저장 안 함)
    const questionMessage: Message = {
      id: `local-${Date.now()}`,
      text: `💡 추천 질문 리스트\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}`,
      sender: 'other',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, questionMessage]);
    setShowQuickActions(false);
  }, [mentorId]);

  // Firebase에서 실시간 메시지 불러오기 (사용자별 채팅방)
  useEffect(() => {
    if (!mentorId || !db || !userId) return;

    // 경로: users/{userId}/chats/{mentorId}/messages
    const messagesRef = collection(db, 'users', userId, 'chats', mentorId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        loadedMessages.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });
      
      setMessages(loadedMessages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [mentorId, userId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (inputText.trim() === '' || !mentorId || !db || !userId) return;

    try {
      // 1. 채팅방 document 생성/업데이트 (관리자가 조회할 수 있도록)
      const chatRef = doc(db, 'users', userId, 'chats', mentorId);
      await setDoc(chatRef, {
        mentorId: mentorId,
        lastMessage: inputText,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // 2. 메시지 추가
      const messagesRef = collection(db, 'users', userId, 'chats', mentorId, 'messages');
      await addDoc(messagesRef, {
        text: inputText,
        sender: 'me',
        timestamp: serverTimestamp(),
        type: 'text',
      });
      
      setInputText('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  }, [inputText, mentorId, userId]);

  const formatTime = useCallback((timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 인증 확인 중일 때 로딩 화면 표시
  if (authChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Link 
              href="/chats" 
              className="text-gray-800 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              aria-label="뒤로 가기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            
            <Link 
              href="/" 
              className="text-gray-800 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              aria-label="홈으로"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {chat.avatar && chat.avatar.startsWith('/') ? (
                    <Image
                      src={chat.avatar}
                      alt={chat.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <h1 className="font-semibold text-base text-gray-900">{chat.name}</h1>
                <p className="text-xs text-gray-500">{chat.status}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowMentorSelector(true)}
              className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              멘토 변경
            </button>
            
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="메뉴"
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-md mx-auto space-y-3">
          {/* 빠른 액션 버튼 */}
          {showQuickActions && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">빠른 시작</p>
              <button
                onClick={handleShowQuestions}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
              >
                💡 질문 추천받기
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">메시지를 불러오는 중...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm">첫 메시지를 보내보세요!</div>
            </div>
          ) : (
          messages.map((message) => {
            // 날짜 구분자
            if (message.type === 'date') {
              return (
                <div key={message.id} className="flex justify-center my-6">
                  <div className="bg-gray-200 text-gray-600 text-xs px-4 py-1.5 rounded-full font-medium">
                    오늘
                  </div>
                </div>
              );
            }

            // 오디오 메시지
            if (message.type === 'audio') {
              return (
                <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[280px] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'me'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button 
                          className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                          aria-label="음성 메시지 재생"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-0.5 rounded-full ${message.sender === 'me' ? 'bg-white' : 'bg-orange-400'}`}
                                style={{ height: `${Math.random() * 20 + 10}px` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs opacity-90">{message.duration}:45</span>
                      </div>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            }

            // 텍스트 메시지
            return (
              <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.sender === 'me'
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : message.sender === 'admin'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    {message.sender === 'admin' && (
                      <div className="text-xs opacity-90 mb-1 font-medium">멘토 답변</div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${message.sender === 'me' ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          }))
          }
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="첨부파일 추가"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지 보내기..."
              aria-label="메시지 입력"
              className="flex-1 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={handleSend}
            aria-label="메시지 전송"
            className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={inputText.trim() === ''}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
      {/* 멘토 선택 모달 */}
      {showMentorSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-visible relative">
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
            <div className="relative h-[550px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {/* 왼쪽 화살표 버튼 */}
              <button
                onClick={() => {
                  if (currentCardIndex > 0) {
                    setCurrentCardIndex(currentCardIndex - 1);
                  } else {
                    setCurrentCardIndex(mentorList.length - 1);
                  }
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="이전 멘토"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* 오른쪽 화살표 버튼 */}
              <button
                onClick={() => {
                  if (currentCardIndex < mentorList.length - 1) {
                    setCurrentCardIndex(currentCardIndex + 1);
                  } else {
                    setCurrentCardIndex(0);
                  }
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label="다음 멘토"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div className="h-full px-16 overflow-hidden">

              {mentorList.map((mentor, index) => {
                const offset = index - currentCardIndex;
                const isVisible = Math.abs(offset) <= 2;
                
                if (!isVisible) return null;

                return (
                  <div
                    key={mentor.id}
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out px-4"
                    style={{
                      transform: `translateX(${offset * 100}%) scale(${1 - Math.abs(offset) * 0.05})`,
                      opacity: offset === 0 ? 1 : 0.3,
                      zIndex: 10 - Math.abs(offset),
                      pointerEvents: offset === 0 ? 'auto' : 'none',
                    }}
                  >
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl" style={{ overflow: 'hidden' }}>
                      {/* 카드 상단 - 회사/직무 */}
                      <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                            {mentor.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold">{mentor.name}</h3>
                            <p className="text-green-100 text-sm">{mentor.experience}</p>
                          </div>
                          {mentor.status === '온라인' && (
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">{mentor.company}</span>
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">{mentor.field}</span>
                        </div>
                      </div>

                      {/* 카드 본문 - 자기소개 */}
                      <div className="p-6" style={{ overflow: 'hidden' }}>
                        <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">{mentor.description}</p>
                        
                        {/* 추천 질문 미리보기 */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 mb-2">💡 추천 질문</p>
                          <div className="space-y-2">
                            {recommendedQuestions[mentor.id]?.slice(0, 2).map((q, i) => (
                              <p key={i} className="text-xs text-gray-600 line-clamp-1">• {q}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 카드 하단 - 선택 버튼 */}
                      <div className="p-6 pt-0 flex gap-3">
                        <button
                          onClick={() => {
                            window.location.href = `/mentor/${mentor.id}`;
                          }}
                          className="flex-1 py-3 border-2 border-green-500 text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors"
                        >
                          프로필 자세히 보기
                        </button>
                        <button
                          onClick={() => {
                            window.location.href = `/chat/${mentor.id}`;
                          }}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                        >
                          채팅하기
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
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
      )}    </div>
  );
}
