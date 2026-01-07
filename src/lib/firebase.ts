import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';

// Firebase 설정을 환경변수에서 가져옵니다
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// 환경변수 검증
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigured) {
  console.error('Firebase 환경변수가 설정되지 않았습니다.');
  console.error('필요한 환경변수:', {
    NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey ? '설정됨' : '미설정',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId ? '설정됨' : '미설정',
  });
  throw new Error('Firebase 환경변수가 올바르게 설정되지 않았습니다. Vercel 대시보드에서 환경변수를 확인해주세요.');
}

// Initialize Firebase
console.log('🔧 Initializing Firebase...');
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

console.log('✅ Firebase initialized');
console.log('🔐 Auth domain:', firebaseConfig.authDomain);

// Google Provider 설정 - 모바일 최적화
googleProvider.setCustomParameters({
  prompt: 'select_account', // 계정 선택 화면 표시
});

console.log('✅ Google Provider configured');

export { app, db, auth, googleProvider };
