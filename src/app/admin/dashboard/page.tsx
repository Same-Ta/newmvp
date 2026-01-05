'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, collectionGroup, query, orderBy, getDocs, limit } from 'firebase/firestore';

interface ChatPreview {
  userId: string;
  mentorId: string;
  mentorName: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
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

export default function AdminDashboard() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 관리자 인증 확인
    const isAdmin = localStorage.getItem('adminAuth');
    if (isAdmin !== 'true') {
      router.push('/admin');
      return;
    }

    loadAllChats();
  }, [router]);

  const loadAllChats = async () => {
    if (!db) return;

    try {
      // 모든 사용자의 채팅을 가져오기
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const chatMap = new Map<string, ChatPreview>();

      // 각 사용자별로 채팅방 확인
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const chatsRef = collection(db, 'users', userId, 'chats');
        const chatsSnapshot = await getDocs(chatsRef);

        // 각 채팅방의 메시지 확인
        for (const chatDoc of chatsSnapshot.docs) {
          const mentorId = chatDoc.id;
          const messagesRef = collection(db, 'users', userId, 'chats', mentorId, 'messages');
          const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const messagesSnapshot = await getDocs(messagesQuery);

          if (!messagesSnapshot.empty) {
            const lastMessageDoc = messagesSnapshot.docs[0];
            const lastMessageData = lastMessageDoc.data();
            const chatKey = `${userId}_${mentorId}`;

            chatMap.set(chatKey, {
              userId,
              mentorId,
              mentorName: mentorNames[mentorId] || `멘토 ${mentorId}`,
              lastMessage: lastMessageData.text || '',
              lastMessageTime: lastMessageData.timestamp,
              unreadCount: 0,
            });
          }
        }
      }

      // 최신 메시지 순으로 정렬
      const sortedChats = Array.from(chatMap.values()).sort((a, b) => {
        if (!a.lastMessageTime || !b.lastMessageTime) return 0;
        const timeA = a.lastMessageTime.toMillis ? a.lastMessageTime.toMillis() : 0;
        const timeB = b.lastMessageTime.toMillis ? b.lastMessageTime.toMillis() : 0;
        return timeB - timeA;
      });

      setChats(sortedChats);
      setIsLoading(false);
    } catch (error) {
      console.error('채팅 목록 로딩 실패:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin');
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <div className="flex gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                홈으로
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 채팅 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              전체 채팅 목록 ({chats.length}개)
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {chats.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">
                아직 채팅 내역이 없습니다.
              </li>
            ) : (
              chats.map((chat) => (
                <li key={`${chat.userId}_${chat.mentorId}`}>
                  <Link
                    href={`/admin/chat/${chat.userId}/${chat.mentorId}`}
                    className="block hover:bg-gray-50 transition"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chat.mentorName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            사용자 ID: {chat.userId.substring(0, 20)}...
                          </p>
                          <p className="text-sm text-gray-600 mt-2 truncate">
                            {chat.lastMessage}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <p className="text-xs text-gray-500">
                            {formatTime(chat.lastMessageTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
