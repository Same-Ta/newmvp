# Vercel 배포 설정 가이드

## 문제 원인
localhost에서는 작동하지만 Vercel에서 채팅/질문 추천 기능이 작동하지 않는 이유는 **Firebase 환경변수가 Vercel에 설정되지 않았기 때문**입니다.

## 해결 방법

### 1. Vercel 환경변수 설정

1. [Vercel 대시보드](https://vercel.com/dashboard)에 접속
2. 해당 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴로 이동
4. 다음 환경변수들을 추가:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

5. 각 변수의 값은 로컬의 `.env.local` 파일에서 확인 가능
6. **Production**, **Preview**, **Development** 모두 체크
7. **Save** 클릭

### 2. 재배포

환경변수 설정 후 반드시 재배포해야 합니다:

```bash
# Git push로 자동 배포
git add .
git commit -m "Fix Firebase configuration"
git push

# 또는 Vercel 대시보드에서 Redeploy
```

### 3. 확인사항

배포 후 다음을 확인:
- ✅ 채팅 메시지 전송
- ✅ 프로필 보기 버튼
- ✅ 질문 추천받기 버튼
- ✅ 실시간 메시지 동기화

## 주요 변경사항

### 개선된 코드
1. **Firebase 초기화 검증 강화**: 환경변수 누락 시 명확한 에러 메시지
2. **에러 처리 추가**: 사용자에게 친화적인 에러 메시지 표시
3. **null 체크 개선**: `db`가 null일 경우 적절한 처리

### 로컬 환경변수 예시
`.env.local` 파일 형식은 [.env.local.example](.env.local.example) 참고

## 문제 해결

### 배포 후에도 작동하지 않을 경우

1. **환경변수 확인**
   - Vercel 대시보드에서 모든 환경변수가 정확히 설정되었는지 확인
   - 오타나 공백이 없는지 체크

2. **빌드 로그 확인**
   - Vercel 대시보드 → Deployments → 최신 배포 클릭
   - 빌드 로그에서 Firebase 관련 에러 확인

3. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - Firebase 연결 에러 메시지 확인

4. **Firebase 설정 확인**
   - Firebase Console에서 프로젝트 설정 확인
   - 도메인 권한 부여 확인 (Authentication → Settings → Authorized domains)
   - Vercel 도메인 추가: `your-app.vercel.app`

## 참고

- Vercel 환경변수는 빌드 시점에 적용되므로 변경 후 반드시 재배포 필요
- `NEXT_PUBLIC_` 접두사가 있는 환경변수만 클라이언트 사이드에서 접근 가능
- Firebase Firestore 규칙이 너무 제한적이지 않은지 확인
