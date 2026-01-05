'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'other' | 'admin';
  timestamp: any;
  type: 'text' | 'audio' | 'date';
}

const mentorNames: { [key: string]: string } = {
  '1': '이원준 (CJ제일제당)',
  '2': '김서현 (삼성전자)',
  '3': '박준혁 (LG전자)',
  '4': '정다은 (카카오)',
  '5': '최민수 (SK하이닉스)',
  '6': '강유진 (현대자동차)',
  '7': '윤재석 (네이버)',
  '8': '송하늘 (LG화학)',
  '9': '임동현 (SK이노베이션)',
  '10': '한서윤 (CJ제일제당)',
  '11': '오진우 (쿠팡)',
  '12': '배수진 (삼성전자)',
  '13': '서준호 (아모레퍼시픽)',
  '14': '안지혜 (LG AI연구원)',
  '15': '조민기 (현대제철)',
  '16': '홍민지 (카카오뱅크)',
  '17': '신동욱 (NHN)',
  '18': '유채원 (HYBE)',
  '19': '전승현 (삼성SDI)',
  '20': '권나연 (SK텔레콤)',
};

export default function AdminChatPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  const mentorId = params?.mentorId as string;
  const mentorName = mentorNames[mentorId] || `멘토 ${mentorId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 관리자 인증 확인
    const isAdmin = localStorage.getItem('adminAuth');
    if (isAdmin !== 'true') {
      router.push('/admin');
      return;
    }
  }, [router]);

  // Firebase에서 실시간 메시지 불러오기
  useEffect(() => {
    if (!userId || !mentorId || !db) return;

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
  }, [userId, mentorId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (inputText.trim() === '' || !userId || !mentorId || !db) return;

    try {
      const messagesRef = collection(db, 'users', userId, 'chats', mentorId, 'messages');
      await addDoc(messagesRef, {
        text: inputText,
        sender: 'admin', // 관리자가 보낸 메시지
        timestamp: serverTimestamp(),
        type: 'text',
      });
      setInputText('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  }, [inputText, userId, mentorId]);

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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← 뒤로
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{mentorName}</h1>
                <p className="text-sm text-gray-500">사용자: {userId.substring(0, 20)}...</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
              관리자 모드
            </div>
          </div>
        </div>
      </header>

      {/* 메시지 영역 */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'me' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.sender === 'me'
                    ? 'bg-white text-gray-900'
                    : message.sender === 'admin'
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
                }`}
              >
                {message.sender === 'admin' && (
                  <div className="text-xs opacity-90 mb-1">관리자</div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'me' ? 'text-gray-500' : 'text-white/70'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 입력 영역 */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="답변을 입력하세요..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
