'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  '1': { name: '이원준', status: '온라인', avatar: '👨‍🍳', field: '마케팅/식품 기획', company: 'CJ제일제당', experience: '입사 2년차', description: '트렌드를 읽고 실행하는 식품 마케터입니다. "스펙보다 회사가 왜 나를 뽑아야 하는지" 설명할 수 있었던 게 합격의 킥이었습니다. 취준생 여러분의 솔직한 고민, 함께 나눠요!' },
  '2': { name: '김서현', status: '온라인', avatar: '👩‍💻', field: 'SW개발', company: '삼성전자', experience: '입사 3년차', description: '삼성전자 무선사업부에서 안드로이드 앱 개발을 담당하고 있습니다. SSAFY 출신으로 비전공자도 충분히 도전할 수 있다는 걸 보여드리고 싶어요.' },
  '3': { name: '박준혁', status: '오프라인', avatar: '👨‍💼', field: '경영기획', company: 'LG전자', experience: '입사 4년차', description: 'LG전자 경영기획팀에서 중장기 전략을 수립합니다. 인적성부터 임원면접까지, 대기업 채용 프로세스의 A to Z를 함께 나눠드릴게요.' },
  '4': { name: '정다은', status: '온라인', avatar: '👩‍🎨', field: 'UX/UI 디자인', company: '카카오', experience: '입사 2년차', description: '카카오톡 UI/UX를 디자인합니다. 포트폴리오 구성부터 디자인 직무 면접 꿀팁까지, 실무 디자이너의 시각으로 알려드릴게요.' },
  '5': { name: '최민수', status: '온라인', avatar: '👨‍🔬', field: 'R&D/연구개발', company: 'SK하이닉스', experience: '입사 3년차', description: '반도체 공정 연구를 하고 있습니다. 석사 출신으로 연구직 준비하시는 분들께 학위 vs 경력, 연구 포트폴리오 준비법 등을 공유합니다.' },
  '6': { name: '강유진', status: '온라인', avatar: '👩‍💼', field: '인사/HR', company: '현대자동차', experience: '입사 2년차', description: '현대자동차 인사팀에서 채용을 담당합니다. 면접관 입장에서 본 합격자들의 공통점, 면접 후 평가 기준 등 리얼한 이야기 들려드릴게요.' },
  '7': { name: '윤재석', status: '오프라인', avatar: '👨‍💻', field: '백엔드 개발', company: '네이버', experience: '입사 5년차', description: '네이버 검색 플랫폼 백엔드 개발자입니다. 코딩테스트 준비법, 기술 면접 단골 질문, 실무에서 쓰는 기술 스택 등을 알려드립니다.' },
  '8': { name: '송하늘', status: '온라인', avatar: '👩‍🏭', field: '생산관리', company: 'LG화학', experience: '입사 3년차', description: 'LG화학 배터리 생산라인을 관리합니다. 화학공학 전공자로서 제조업 취업 준비, 생산직 vs 사무직 차이 등 현장 이야기 나눠요.' },
  '9': { name: '임동현', status: '온라인', avatar: '👨‍💼', field: '재무/회계', company: 'SK이노베이션', experience: '입사 4년차', description: 'SK이노베이션 재무팀에서 투자분석을 담당합니다. CPA 준비하면서 취업했던 경험, 회계 직무 면접 준비법 공유합니다.' },
  '10': { name: '한서윤', status: '온라인', avatar: '👩‍🔬', field: '품질관리', company: 'CJ제일제당', experience: '입사 2년차', description: 'CJ제일제당 식품안전센터에서 품질관리를 합니다. 식품공학 전공으로 대기업 품질직 준비하시는 분들께 도움 드리고 싶어요.' },
  '11': { name: '오진우', status: '오프라인', avatar: '👨‍💻', field: '데이터 분석', company: '쿠팡', experience: '입사 3년차', description: '쿠팡 데이터 분석가로 고객 행동 분석을 합니다. SQL, Python 독학으로 비전공 취업 성공한 케이스입니다. 포트폴리오 만드는 법 알려드릴게요.' },
  '12': { name: '배수진', status: '온라인', avatar: '👩‍💼', field: '영업/Sales', company: '삼성전자', experience: '입사 4년차', description: '삼성전자 B2B 영업을 담당합니다. 영업직은 발로 뛰는 것만이 아닙니다. 전략적 세일즈, 대기업 영업의 리얼을 들려드릴게요.' },
  '13': { name: '서준호', status: '온라인', avatar: '👨‍🎓', field: '마케팅', company: '아모레퍼시픽', experience: '입사 2년차', description: '아모레퍼시픽 브랜드 마케터입니다. 뷰티 업계 트렌드, SNS 마케팅 전략, 브랜드 기획 면접 꿀팁 등을 나눠요.' },
  '14': { name: '안지혜', status: '온라인', avatar: '👩‍💻', field: 'AI/머신러닝', company: 'LG AI연구원', experience: '입사 2년차', description: 'LG AI연구원에서 자연어처리 연구를 합니다. AI 직무 포트폴리오 구성, 대학원 vs 취업 고민, 논문 작성법 등 공유합니다.' },
  '15': { name: '조민기', status: '오프라인', avatar: '👨‍🏭', field: '공정엔지니어', company: '현대제철', experience: '입사 5년차', description: '현대제철 제강공정 엔지니어입니다. 기계/금속 전공자로 제조업 취업 준비하시는 분들, 현장직 vs 연구직 고민 상담해드립니다.' },
  '16': { name: '홍민지', status: '온라인', avatar: '👩‍💼', field: '전략기획', company: '카카오뱅크', experience: '입사 3년차', description: '카카오뱅크 전략기획팀입니다. 핀테크 산업 전망, 금융권 취업 트렌드, 케이스 스터디 면접 준비법 등을 나눠드려요.' },
  '17': { name: '신동욱', status: '온라인', avatar: '👨‍💻', field: '보안/인프라', company: 'NHN', experience: '입사 4년차', description: 'NHN 보안팀에서 클라우드 인프라 보안을 담당합니다. 정보보호학과 출신으로 보안 직무 준비, 자격증 활용법 알려드립니다.' },
  '18': { name: '유채원', status: '온라인', avatar: '👩‍🎨', field: '콘텐츠 기획', company: 'HYBE', experience: '입사 2년차', description: 'HYBE 콘텐츠 기획자입니다. 엔터 업계 취업 준비, 포트폴리오 구성, 크리에이티브 면접 대비법 등 리얼한 정보 공유해요.' },
  '19': { name: '전승현', status: '오프라인', avatar: '👨‍🔧', field: '설비엔지니어', company: '삼성SDI', experience: '입사 3년차', description: '삼성SDI 배터리 설비 엔지니어입니다. 전기/전자 전공으로 설비직 준비하시는 분들, 기술직 면접 꿀팁 알려드릴게요.' },
  '20': { name: '권나연', status: '온라인', avatar: '👩‍💼', field: '구매/SCM', company: 'SK텔레콤', experience: '입사 4년차', description: 'SK텔레콤 구매팀에서 공급망 관리를 합니다. 협상력, 원가분석 능력 등 구매직에 필요한 역량과 준비법을 공유합니다.' },
};

const recommendedQuestions: { [key: string]: string[] } = {
  '1': ['CJ제일제당 면접에서 가장 중요하게 본 포인트가 뭐였나요?', '이력서를 어느 정도까지 준비하고 들어가셨나요? 외워야 할까요?', '취준할 때 실패했던 경험도 솔직하게 말하는 게 도움이 될까요?'],
  '2': ['삼성전자 SSAFY 출신으로 취업하셨는데, 부트캠프의 장점이 뭔가요?', '비전공자가 개발자 취업할 때 가장 큰 장벽은 무엇이었나요?', '안드로이드 개발 포트폴리오는 어떻게 준비하면 좋을까요?'],
  '3': ['LG전자 인적성 시험은 어떻게 준비하셨나요?', '경영기획직 면접에서 어떤 질문이 나왔나요?', '임원면접 분위기와 준비 꿀팁이 궁금합니다!'],
  '4': ['카카오 디자이너 포트폴리오 구성은 어떻게 해야 하나요?', 'UI/UX 직무 면접에서 실제로 어떤 과제가 나오나요?', '디자인 트렌드는 어떻게 공부하고 계신가요?'],
  '5': ['SK하이닉스 연구직은 석사가 필수인가요?', '연구 포트폴리오는 논문 위주로 구성해야 하나요?', '학위과정 중 취업 vs 박사 진학, 어떻게 결정하셨나요?'],
  '6': ['현대자동차 인사팀 면접관으로서, 합격자들의 공통점은 뭔가요?', '면접 후 평가 기준이 궁금합니다. 어떤 점을 중요하게 보시나요?', 'HR 직무는 어떤 역량이 가장 중요한가요?'],
  '7': ['네이버 코딩테스트는 어느 정도 수준까지 준비해야 하나요?', '백엔드 기술 면접에서 단골로 나오는 질문이 있나요?', '실무에서 쓰는 기술과 면접 준비 기술이 다른가요?'],
  '8': ['LG화학 생산관리직은 어떤 업무를 하나요?', '화학공학 전공으로 제조업 취업할 때 꿀팁이 있을까요?', '생산직과 사무직의 실제 차이가 궁금합니다!'],
  '9': ['CPA 준비하면서 취업도 병행 가능한가요?', 'SK이노베이션 재무직 면접에서 어떤 질문이 나왔나요?', '회계 직무 면접 준비는 어떻게 해야 하나요?'],
  '10': ['CJ제일제당 품질관리직은 어떤 일을 하나요?', '식품공학 전공자로 대기업 품질직 준비할 때 필요한 자격증이 있나요?', '품질관리 vs 연구개발, 어떤 차이가 있나요?'],
  '11': ['비전공자가 데이터 분석가로 취업하려면 어떤 공부를 해야 하나요?', 'SQL과 Python 중 뭘 먼저 배워야 할까요?', '데이터 분석 포트폴리오는 어떻게 만들면 좋을까요?'],
  '12': ['삼성전자 B2B 영업은 일반 영업과 어떻게 다른가요?', '대기업 영업직 면접에서 중요하게 보는 포인트가 뭔가요?', '영업 실적 압박은 실제로 어느 정도인가요?'],
  '13': ['아모레퍼시픽 브랜드 마케터는 어떤 일을 하나요?', '뷰티 업계 마케팅 트렌드가 궁금합니다!', '브랜드 기획 면접에서 어떤 과제가 나오나요?'],
  '14': ['AI 직무 포트폴리오는 어떻게 구성해야 하나요?', '대학원 진학 vs 바로 취업, 어떤 게 나을까요?', '논문 실적이 없어도 AI 연구직 지원 가능한가요?'],
  '15': ['현대제철 공정 엔지니어는 어떤 업무를 하나요?', '기계공학 전공으로 제조업 취업 준비 중인데 조언 부탁드립니다!', '현장직과 연구직 중 어떤 걸 선택해야 할까요?'],
  '16': ['카카오뱅크 전략기획팀은 어떤 일을 하나요?', '핀테크 산업 전망이 궁금합니다!', '케이스 스터디 면접은 어떻게 준비해야 하나요?'],
  '17': ['NHN 보안팀 취업 준비할 때 어떤 자격증이 도움 되나요?', '클라우드 인프라 보안은 어떤 기술을 다루나요?', '정보보안 vs 네트워크 보안, 어느 쪽이 전망이 좋을까요?'],
  '18': ['HYBE 콘텐츠 기획자는 어떤 일을 하나요?', '엔터 업계 취업 포트폴리오는 어떻게 준비해야 하나요?', '크리에이티브 면접에서 어떤 걸 평가하나요?'],
  '19': ['삼성SDI 설비 엔지니어 면접 준비 꿀팁이 있나요?', '전기공학 전공으로 배터리 업계 취업 가능한가요?', '기술직 면접에서 실무 지식을 어느 정도까지 물어보나요?'],
  '20': ['SK텔레콤 구매직은 어떤 역량이 중요한가요?', '협상 스킬은 어떻게 키워야 하나요?', 'SCM 관리 경험이 없어도 지원 가능한가요?'],
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
      if (user) {
        setUserId(user.uid);
        setAuthChecking(false);
      } else {
        setAuthChecking(false);
        // 로그인이 필요한 경우 로그인 모달을 띄우도록 랜딩페이지로 리다이렉트
        router.push('/?login=required');
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
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
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
