'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

// 빌드 시 정적 생성 방지
export const dynamic = 'force-dynamic';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isOnline: boolean;
  field: string;
  company: string;
}

const chatInfo: { [key: string]: { name: string; avatar: string; field: string; company: string; status: string } } = {
  '1': { name: '마감히어로', avatar: '/magam-hero-logo.svg', field: '지역 기반 마감 할인 플랫폼', company: '주식회사 마히(MAHI)', status: '온라인' },
};

export default function ChatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Firebase가 설정되지 않은 경우 빈 배열 반환
        if (!db) {
          setChats([]);
          setIsLoading(false);
          return;
        }

        const chatIds: string[] = [];
        
        // 모든 채팅방 ID 확인
        for (const id of Object.keys(chatInfo)) {
          const messagesRef = collection(db!, 'chats', id, 'messages');
          const q = query(messagesRef);
          const snapshot = await getDocs(q);
          
          // 메시지가 있는 채팅방만 추가
          if (!snapshot.empty) {
            chatIds.push(id);
          }
        }

        // 채팅 목록 생성
        const chatList: Chat[] = chatIds.map(id => {
          const info = chatInfo[id];
          return {
            id,
            name: info.name,
            lastMessage: `${info.company} ${info.field}`,
            time: '최근',
            unread: 0,
            avatar: info.avatar,
            isOnline: info.status === '온라인',
            field: info.field,
            company: info.company,
          };
        });

        setChats(chatList);
      } catch (error) {
        console.error('채팅 목록 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = useMemo(() => {
    if (searchQuery === '') return chats;
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, chats]);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white p-4 sticky top-0 z-10 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">채팅</h1>
          </div>
          
          {/* 검색바 */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="채팅 검색..."
              className="w-full px-4 py-3 pl-11 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      {/* 채팅 리스트 */}
      <main className="max-w-4xl mx-auto pb-20">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-sm">로딩 중...</div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500 text-lg mb-2">아직 채팅이 없습니다</p>
            <p className="text-gray-400 text-sm mb-6">멘토와 대화를 시작해보세요!</p>
            <Link href="/chat" className="inline-block px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors">
              멘토 찾기
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 프로필 이미지 */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                        {chat.avatar}
                      </div>
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* 채팅 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-base">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {chat.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {chat.lastMessage}
                      </p>
                    </div>

                    {/* 읽지 않은 메시지 뱃지 */}
                    {chat.unread > 0 && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {chat.unread > 9 ? '9+' : chat.unread}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto flex">
          <Link href="/chat" className="flex-1 py-4 flex flex-col items-center text-green-600">
            <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs font-medium">멘토</span>
          </Link>
          
          <Link href="/chats" className="flex-1 py-4 flex flex-col items-center text-green-600">
            <svg className="w-7 h-7 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">채팅</span>
          </Link>
          
          <Link href="/products" className="flex-1 py-4 flex flex-col items-center text-gray-500 hover:text-green-600">
            <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs font-medium">스토어</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
