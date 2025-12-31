# 멘토-멘티 채팅 애플리케이션

Next.js, TypeScript, Tailwind CSS, Firebase로 구축된 반응형 멘토-멘티 매칭 및 채팅 플랫폼입니다.

## 🎯 주요 기능

- 🎯 **멘토 발견**: Tinder 스타일의 스와이프 인터페이스로 멘토 탐색
- 💬 **실시간 채팅**: Firebase Firestore 기반 실시간 메시지 송수신
- 🛍️ **스토어**: 멘토가 제작한 기업공략집 구매 기능
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원하는 미니멀 UI
- 🎨 **직관적인 UI/UX**: 깔끔하고 사용하기 쉬운 인터페이스
- ⚡ **성능 최적화**: React hooks를 활용한 최적화된 성능

## 🛠️ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore Database)
- **UI Components**: React
- **최적화**: useMemo, useCallback, React.memo

## 🔥 Firebase 설정

### 환경변수 설정
1. `.env.example` 파일을 복사하여 `.env.local` 파일을 생성합니다:
```bash
cp .env.example .env.local
```

2. `.env.local` 파일에 Firebase 프로젝트 정보를 입력합니다:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

> ⚠️ **보안 주의**: `.env.local` 파일은 절대 Git에 커밋하지 마세요! 이 파일은 `.gitignore`에 포함되어 있습니다.

### Firestore 데이터베이스 구조
```
chats (collection)
├── {chatId} (document)
│   └── messages (subcollection)
│       └── {messageId} (document)
│           ├── text: string
│           ├── sender: 'me' | 'other'
│           ├── timestamp: Firestore Timestamp
│           └── type: 'text' | 'audio' | 'date'
```

### 실시간 채팅 작동 방식
1. 사용자가 메시지를 입력하면 Firestore에 자동 저장
2. `onSnapshot` 리스너가 새 메시지를 실시간으로 감지
3. 모든 연결된 클라이언트에 즉시 동기화

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── chat/
│   │   └── [id]/
│   │       └── page.tsx    # 채팅 상세 페이지
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈 페이지 (채팅 목록)
│   └── globals.css         # 글로벌 스타일
└── lib/
    └── utils.ts            # 유틸리티 함수
```

## 🎨 주요 페이지

### 홈 페이지 (채팅 목록)
- 채팅 검색 기능
- 카테고리 필터 (전체, 개인, 디자인, 업무, 즐겨찾기)
- 온라인 상태 표시
- 읽지 않은 메시지 수 표시
- 다크 테마 네비게이션 바

### 채팅 페이지
- 1:1 실시간 채팅 UI
- 텍스트 메시지 전송/수신
- 오디오 메시지 UI (파형 시각화)
- 날짜 구분자
- 타임스탬프 표시
- 반응형 메시지 레이아웃
- 그라데이션 말풍선

## ⚡ 성능 최적화

### 적용된 최적화
- ✅ `useMemo`를 사용한 필터링 로직 메모이제이션
- ✅ `useCallback`을 사용한 이벤트 핸들러 최적화
- ✅ 불필요한 리렌더링 방지
- ✅ 컴포넌트 외부에 상수 데이터 이동
- ✅ 유틸리티 함수 분리

### 접근성 (a11y)
- ✅ 모든 인터랙티브 요소에 `aria-label` 추가
- ✅ 키보드 네비게이션 지원
- ✅ 시맨틱 HTML 사용

자세한 내용은 [OPTIMIZATION.md](./OPTIMIZATION.md)를 참고하세요.

## 📱 반응형 디자인

모바일, 태블릿, 데스크톱 모든 화면 크기에서 최적화된 경험을 제공합니다.

- **모바일**: 360px ~ 768px
- **태블릿**: 768px ~ 1024px
- **데스크톱**: 1024px 이상

## 🎯 향후 개발 계획

### 단기 (1-2주)
- [ ] React.memo를 사용한 채팅 아이템 메모이제이션
- [ ] 가상 스크롤링 구현
- [ ] 이미지 lazy loading
- [ ] 에러 바운더리 추가

### 중기 (1개월)
- [ ] PWA 지원 (오프라인 기능)
- [ ] WebSocket을 통한 실시간 채팅
- [ ] Firebase/Supabase 연동
- [ ] 사용자 인증 (로그인/회원가입)
- [ ] 푸시 알림 기능
- [ ] 파일 전송 기능

### 장기 (3개월)
- [ ] 상태 관리 라이브러리 도입 (Zustand/Jotai)
- [ ] 서버 사이드 렌더링 최적화
- [ ] 국제화 (i18n) 지원
- [ ] E2E 테스트 추가 (Playwright)
- [ ] 이모지 및 리액션 기능

## 🌐 브라우저 지원

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 📄 라이선스

MIT License
