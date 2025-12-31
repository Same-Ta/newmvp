// 채팅 데이터 타입
export interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isOnline: boolean;
  category: 'all' | 'personal' | 'design' | 'work';
}

// 메시지 데이터 타입
export interface Message {
  id: number;
  text?: string;
  sender: 'me' | 'other';
  timestamp: Date;
  type: 'text' | 'audio' | 'date';
  duration?: number;
}

// 카테고리 타입
export type Category = 'all' | 'personal' | 'design' | 'work' | 'favorite';

// 유틸리티 함수들
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분`;
  if (hours < 24) return `${hours}시간`;
  if (days < 7) return `${days}일`;
  
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

// 검색 필터링 함수
export const filterChats = (
  chats: Chat[],
  searchQuery: string,
  category: Category
): Chat[] => {
  return chats.filter((chat) => {
    const matchesSearch = searchQuery === '' || 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || chat.category === category;
    return matchesSearch && matchesCategory;
  });
};
