import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

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

// 환경변수 검증 - 빌드 시에는 경고만 출력
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigured && typeof window !== 'undefined') {
  console.warn('Firebase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
}

export { app, db };
