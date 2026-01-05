'use client';

import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

/**
 * Firebase 데이터베이스의 모든 채팅 메시지를 삭제하는 유틸리티 컴포넌트
 * 사용법: 이 컴포넌트를 임시로 페이지에 추가하고 한 번 실행한 후 제거
 */
export default function CleanDatabase() {
  useEffect(() => {
    const cleanAllChats = async () => {
      if (!db) {
        console.error('Firebase가 초기화되지 않았습니다.');
        return;
      }

      try {
        // 모든 채팅방 ID (1~20)
        const chatIds = Array.from({ length: 20 }, (_, i) => String(i + 1));
        
        let totalDeleted = 0;

        for (const chatId of chatIds) {
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const snapshot = await getDocs(messagesRef);
          
          for (const docSnapshot of snapshot.docs) {
            await deleteDoc(doc(db, 'chats', chatId, 'messages', docSnapshot.id));
            totalDeleted++;
          }
        }

        console.log(`✅ 총 ${totalDeleted}개의 메시지를 삭제했습니다.`);
        alert(`데이터베이스 정리 완료! ${totalDeleted}개의 메시지를 삭제했습니다.`);
      } catch (error) {
        console.error('데이터베이스 정리 실패:', error);
        alert('데이터베이스 정리에 실패했습니다.');
      }
    };

    // 컴포넌트가 마운트되면 자동 실행
    cleanAllChats();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>데이터베이스 정리 중...</h1>
      <p>콘솔을 확인해주세요.</p>
    </div>
  );
}
