'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';

// 빌드 시 정적 생성 방지
export const dynamic = 'force-dynamic';

// useSearchParams를 사용하는 내부 컴포넌트
function LandingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [menteeModalOpen, setMenteeModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mentorForm, setMentorForm] = useState({ name: '', email: '', field: '' });
  const [menteeForm, setMenteeForm] = useState({ email: '', question: '' })
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const [checkingRedirect, setCheckingRedirect] = useState(true); // 리디렉트 확인 중

  // URL 파라미터로 로그인 모달 표시
  useEffect(() => {
    const loginRequired = searchParams.get('login') === 'required';
    const redirectTo = searchParams.get('redirect');
    if (loginRequired && !user) {
      setShowLoginModal(true);
      if (redirectTo) {
        setRedirectAfterLogin(redirectTo);
      }
      document.body.style.overflow = 'hidden';
      // URL에서 파라미터 제거 (새로고침 시 다시 안 뜨도록)
      router.replace('/', { scroll: false });
    }
  }, [searchParams, user, router]);

  useEffect(() => {
    // Scroll reveal animation
    const scrollReveal = () => {
      const reveals = document.querySelectorAll('.scroll-reveal');
      
      reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', scrollReveal);
    window.addEventListener('load', scrollReveal);
    scrollReveal(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', scrollReveal);
      window.removeEventListener('load', scrollReveal);
    };
  }, []);

  // Firebase Auth persistence 설정 (앱 로드 시 한 번만)
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔧 Initializing Firebase Auth...');
        // localStorage persistence 설정 (모바일 포함)
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Auth persistence set to LOCAL (browserLocalPersistence)');
        
        // 현재 사용자 확인
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log('👤 Current user on init:', currentUser.email);
        } else {
          console.log('👤 No current user on init');
        }
      } catch (error) {
        console.error('❌ Persistence 설정 실패:', error);
        // localStorage가 안 되면 메모리만 사용
        try {
          await setPersistence(auth, inMemoryPersistence);
          console.log('⚠️ Auth persistence set to MEMORY (localStorage unavailable)');
        } catch (e) {
          console.error('❌ Memory persistence도 실패:', e);
        }
      }
    };
    initAuth();
  }, []);

  // 리디렉트 로그인 결과 처리 (signInWithRedirect 사용 시)
  useEffect(() => {
    let mounted = true;
    const checkRedirectResult = async () => {
      try {
        console.log('🔍 Checking redirect result...');
        const result = await getRedirectResult(auth);
        
        if (!mounted) {
          console.log('⚠️ Component unmounted, skipping redirect result');
          return;
        }
        
        if (result && result.user) {
          console.log('✅ Redirect login success!');
          console.log('📧 User email:', result.user.email);
          console.log('🆔 User UID:', result.user.uid);
          
          // localStorage에서 리다이렉트 경로 확인
          const savedRedirect = localStorage.getItem('loginRedirect');
          console.log('💾 Saved redirect path:', savedRedirect);
          
          if (savedRedirect) {
            console.log('🔄 Redirecting to:', savedRedirect);
            localStorage.removeItem('loginRedirect');
            // 약간의 지연 후 리다이렉트 (상태 업데이트 대기)
            setTimeout(() => {
              router.push(savedRedirect);
            }, 500);
          } else {
            setShowLoginModal(false);
            document.body.style.overflow = 'auto';
          }
        } else {
          console.log('ℹ️ No redirect result (normal page load)');
        }
      } catch (err: any) {
        if (!mounted) return;
        console.error('❌ Redirect login error:', err);
        console.error('Error code:', err?.code);
        console.error('Error message:', err?.message);
        
        // 에러 발생 시 저장된 리다이렉트 제거
        localStorage.removeItem('loginRedirect');
        
        if (err?.code === 'auth/unauthorized-domain') {
          alert('이 도메인은 Firebase 인증이 허용되지 않았습니다. Firebase Console에서 도메인을 추가해주세요.');
        } else if (err?.code) {
          alert(`로그인 실패 (Redirect): ${err?.code}\n메시지: ${err?.message}`);
        }
      } finally {
        if (mounted) {
          setCheckingRedirect(false);
          console.log('✅ Redirect check completed');
        }
      }
    };
    
    checkRedirectResult();
    return () => { 
      mounted = false;
      console.log('🧹 Redirect check cleanup');
    };
  }, [router]);

  // 로그인 상태 감지
  useEffect(() => {
    let unsubscribed = false;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribed) return;
      
      if (currentUser) {
        console.log('✅ Auth state changed - Logged in');
        console.log('📧 Email:', currentUser.email);
        console.log('🆔 UID:', currentUser.uid);
        
        // 로그인 후 리다이렉트 처리 (팝업 로그인용)
        if (redirectAfterLogin) {
          console.log('🔄 Popup login redirect to:', redirectAfterLogin);
          const redirectPath = redirectAfterLogin;
          setRedirectAfterLogin(null);
          router.push(redirectPath);
          return; // 닉네임 체크 건너뛰기
        }
      } else {
        console.log('❌ Auth state changed - Not logged in');
      }
      setUser(currentUser);
      if (currentUser && db) {
        // 닉네임 확인
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserNickname(userDoc.data().nickname || '');
        } else {
          // 닉네임이 없으면 설정 모달 표시
          setShowNicknameModal(true);
        }
      }
    });
    
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, [redirectAfterLogin, router]);

  useEffect(() => {
    // Lucide icons initialization
    if (typeof window !== 'undefined' && (window as any).lucide) {
      (window as any).lucide.createIcons();
      
      // Reinitialize after dynamic content changes
      setTimeout(() => {
        (window as any).lucide.createIcons();
      }, 500);
    }
  }, [mentorModalOpen, menteeModalOpen, emailModalOpen]);

  const openMentorForm = () => {
    setMentorModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMentorForm = () => {
    setMentorModalOpen(false);
    setMentorForm({ name: '', email: '', field: '' });
    document.body.style.overflow = 'auto';
  };

  // 멘토 신청 제출
  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorForm.name || !mentorForm.email || !mentorForm.field || !db) return;

    try {
      await addDoc(collection(db, 'mentor_applications'), {
        name: mentorForm.name,
        email: mentorForm.email,
        field: mentorForm.field,
        timestamp: serverTimestamp(),
      });
      alert('멘토 신청이 완료되었습니다!');
      closeMentorForm();
    } catch (error) {
      console.error('멘토 신청 실패:', error);
      alert('신청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const openMenteeForm = () => {
    setMenteeModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMenteeForm = () => {
    setMenteeModalOpen(false);
    setMenteeForm({ email: '', question: '' });
    document.body.style.overflow = 'auto';
  };

  // 질문 제출
  const handleMenteeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menteeForm.email || !menteeForm.question || !db) return;

    try {
      await addDoc(collection(db, 'questions'), {
        email: menteeForm.email,
        question: menteeForm.question,
        timestamp: serverTimestamp(),
      });
      alert('질문이 전송되었습니다!');
      closeMenteeForm();
    } catch (error) {
      console.error('질문 전송 실패:', error);
      alert('전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    document.body.style.overflow = 'auto';
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    if (isLoggingIn) return; // 이미 로그인 중이면 중복 호출 방지
    
    setIsLoggingIn(true);
    console.log('🚀 Starting Google login process...');
    
    try {
      // Persistence 확인 및 설정 (중요!)
      console.log('🔧 Setting persistence...');
      await setPersistence(auth, browserLocalPersistence);
      console.log('✅ Persistence set to browserLocalPersistence');

      const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
      console.log('📱 Device:', isMobile ? 'Mobile' : 'Desktop', isIOS ? '(iOS)' : '');
      console.log('🌐 User Agent:', navigator.userAgent);
      
      let loginSuccess = false;
      
      // 모바일(특히 iOS)에서는 바로 리디렉트 사용
      if (isMobile) {
        console.log('📱 Using redirect login for mobile...');
        
        // 리다이렉트 경로를 localStorage에 저장
        if (redirectAfterLogin) {
          console.log('💾 Saving redirect:', redirectAfterLogin);
          localStorage.setItem('loginRedirect', redirectAfterLogin);
        } else {
          console.log('ℹ️ No redirect path to save');
        }
        
        console.log('🔄 Calling signInWithRedirect...');
        await signInWithRedirect(auth, googleProvider);
        console.log('✅ signInWithRedirect called (redirecting...)');
        // 리디렉트가 발생하므로 여기서 종료
        return;
      }
      
      // 데스크탑에서는 팝업 시도
      try {
        console.log('🪟 Starting popup login...');
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('✅ Popup login success:', user.email);
        loginSuccess = true;
      } catch (popupError: any) {
        console.log('❌ Popup failed, trying redirect...', popupError?.code);
        
        // 팝업이 실패하면 리디렉트 시도
        if (popupError?.code === 'auth/popup-blocked' || 
            popupError?.code === 'auth/popup-closed-by-user' ||
            popupError?.code === 'auth/cancelled-popup-request') {
          
          // 팝업 닫기는 사용자의 의도이므로 아무것도 하지 않음
          if (popupError?.code === 'auth/popup-closed-by-user' || 
              popupError?.code === 'auth/cancelled-popup-request') {
            return;
          }
          
          // 팝업 차단은 리디렉트로 재시도
          try {
            console.log('🔄 Popup blocked, trying redirect login...');
            
            // 리다이렉트 경로를 localStorage에 저장
            if (redirectAfterLogin) {
              console.log('💾 Saving redirect path to localStorage:', redirectAfterLogin);
              localStorage.setItem('loginRedirect', redirectAfterLogin);
            }
            
            await signInWithRedirect(auth, googleProvider);
            // 리디렉트가 발생하므로 여기서 종료
            return;
          } catch (redirectError: any) {
            console.error('❌ Redirect login failed:', redirectError);
            localStorage.removeItem('loginRedirect');
            throw redirectError;
          }
        } else {
          throw popupError;
        }
      }
      
      if (loginSuccess) {
        // 로그인 성공 시 모달 닫기
        setShowLoginModal(false);
        document.body.style.overflow = 'auto';
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      console.error('에러 코드:', error?.code);
      console.error('에러 메시지:', error?.message);
      
      // 사용자가 팝업을 닫은 경우
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        // 아무것도 하지 않음
      } 
      // 승인되지 않은 도메인
      else if (error?.code === 'auth/unauthorized-domain') {
        alert('이 도메인은 Firebase 인증이 허용되지 않았습니다.\n\nFirebase Console > Authentication > Settings > Authorized domains에서\n현재 도메인을 추가해주세요.');
      }
      // 기타 에러
      else {
        alert(`로그인 실패: ${error?.code || '알 수 없는 오류'}\n\n문제가 계속되면 관리자에게 문의해주세요.`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserNickname('');
      setShowUserMenu(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 닉네임 설정
  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !user || !db) return;

    try {
      await setDoc(doc(db, 'users', user.uid), {
        nickname: nickname.trim(),
        email: user.email,
        createdAt: serverTimestamp(),
      });
      setUserNickname(nickname.trim());
      setShowNicknameModal(false);
      setNickname('');
    } catch (error) {
      console.error('닉네임 저장 실패:', error);
      alert('닉네임 저장에 실패했습니다.');
    }
  };

  // 이메일 모달 열기/닫기
  const openEmailModal = () => {
    setEmailModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false);
    setEmail('');
    setSubmitMessage('');
    document.body.style.overflow = 'auto';
  };

  // 이메일 제출
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !db) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'waitlist'), {
        email,
        timestamp: serverTimestamp(),
        source: 'landing_page'
      });
      setSubmitMessage('감사합니다! 출시 시 알려드리겠습니다.');
      setEmail('');
      setTimeout(() => {
        closeEmailModal();
      }, 2000);
    } catch (error) {
      console.error('이메일 저장 실패:', error);
      setSubmitMessage('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 리디렉트 확인 중 로딩 표시
  if (checkingRedirect) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://unpkg.com/lucide@latest" strategy="beforeInteractive" />
      
      <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden selection:bg-green-500 selection:text-white">
        {/* Global Background */}
        <div className="fixed inset-0 bg-grid z-0 pointer-events-none"></div>
        <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-green-400/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 font-extrabold text-2xl tracking-tight">
              <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <i data-lucide="play" className="w-4 h-4 text-white fill-white ml-0.5"></i>
              </div>
              취준로드
            </div>
            <div className="hidden md:flex items-center gap-8 font-medium text-gray-600 text-sm">
              <a href="#features" className="hover:text-green-600 transition-colors">기능 소개</a>
              <a href="#mission" className="hover:text-green-600 transition-colors">우리의 미션</a>
              <a href="#community" className="hover:text-green-600 transition-colors">커뮤니티</a>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {userNickname.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden md:block">
                      {userNickname || user.email?.split('@')[0]}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setShowNicknameModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        닉네임 변경
                      </button>
                      <Link
                        href="/admin"
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        관리자
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setShowLoginModal(true);
                      document.body.style.overflow = 'hidden';
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-green-600 cursor-pointer"
                  >
                    로그인
                  </button>
                  <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-red-600 hidden md:block">관리자</Link>
                </>
              )}
              <button 
                onClick={openEmailModal}
                className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-full hover:bg-green-700 transition-colors cursor-pointer"
              >
                앱 다운로드
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16 md:gap-24 relative z-10">
            
            {/* Left: Copy */}
            <div className="flex-1 text-center md:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-green-400 mb-4 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>취업 준비의 새로운 기준</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.2] tracking-tight">
                직무를 <span className="bg-gradient-to-r from-green-400 to-blue-500 text-gradient bg-clip-text text-transparent">영상</span>으로,<br/>
                커리어를 <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-gradient bg-clip-text text-transparent">대화</span>로
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto md:mx-0">
                1분 숏폼으로 보는 현직자의 리얼 일상,<br/>
                1:1 채팅으로 나누는 진짜 커리어 이야기
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                <Link href="/chat" className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full hover:bg-green-700 hover:scale-105 transition-all shadow-lg">
                  지금 시작하기
                </Link>
                <button className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-full hover:border-green-600 hover:text-green-600 transition-all">
                  더 알아보기
                </button>
              </div>
            </div>

            {/* Right: 3D Mockup */}
            <div className="relative w-[300px] md:w-[380px] h-[640px] flex-shrink-0">
              {/* Phone Frame */}
              <div className="absolute inset-0 bg-[#000] rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden z-20">
                <div className="relative w-full h-full bg-gray-900 flex flex-col">
                  {/* Header */}
                  <div className="absolute top-0 w-full p-6 flex justify-between text-white z-20">
                    <span className="font-bold drop-shadow-md">취준로드</span>
                    <i data-lucide="menu" className="w-6 h-6 drop-shadow-md"></i>
                  </div>

                  {/* Video Background (Real Image) */}
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop" 
                      alt="Startup Meeting"
                      fill
                      className="object-cover opacity-90"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10"></div>

                  {/* Floating Question Bubble */}
                  <div className="absolute top-20 right-4 z-30 bg-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[180px] shadow-lg">
                    <p className="text-[10px] text-gray-500 font-bold mb-1">취준생 A</p>
                    <p className="text-xs text-gray-900 font-semibold leading-tight">창업하려면 개발을 꼭 알아야 하나요? 🤔</p>
                  </div>
                  
                  {/* Floating UI inside phone */}
                  <div className="absolute bottom-0 w-full p-6 text-white pb-8 z-20 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold border-2 border-white">M</div>
                      <div>
                        <h3 className="font-bold text-shadow">@스타트업_대표</h3>
                        <p className="text-xs text-gray-300">CEO • 5년차</p>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2 drop-shadow-md">투자 미팅 3개 연속... 그래도 달린다 🏃‍♂️ 스타트업 대표의 하루 VLOG</p>
                    <button className="w-full py-3 bg-[#fee500] text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform">
                      <i data-lucide="message-circle" className="w-5 h-5"></i>
                      대화하기
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Chat Bubbles */}
              <div className="absolute top-[25%] right-[-60px] md:right-[-100px] z-30 floating">
                <div className="glass-panel bg-white/90 backdrop-blur text-black px-5 py-4 rounded-2xl rounded-bl-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 max-w-[260px]">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><i data-lucide="user" className="w-5 h-5"></i></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold mb-1">취준생 A</p>
                    <p className="text-xs font-bold leading-tight">창업하려면 개발을 꼭 알아야 하나요? 🤔</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-[42%] left-[-60px] md:left-[-100px] z-30 floating-delay">
                <div className="glass-panel bg-[#fee500] text-black px-5 py-4 rounded-2xl rounded-br-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 max-w-[260px]">
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-gray-700 font-bold mb-1">@스타트업_대표</p>
                    <p className="text-xs font-bold leading-tight">몰라도 되지만, 알면 소통이 200% 편해집니다! 팁 알려드릴게요 💪</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-black text-yellow-400 flex items-center justify-center shrink-0"><i data-lucide="check" className="w-5 h-5"></i></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: Reels Browsing */}
        <section className="content-step bg-gradient-to-b from-white via-green-50/30 to-white py-12 scroll-reveal" data-step="1">
          <div className="container mx-auto px-4">
            {/* Section Title */}
            <div className="text-center mb-12 scroll-reveal">
              <h2 className="text-3xl md:text-5xl font-bold mb-3 text-gray-900 leading-tight">이렇게<br/><span className="text-green-600">간편하게</span></h2>
              <p className="text-gray-700 text-lg">3단계로 멘토와 연결되는 방법</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Phone Mockup for Step 1 */}
              <div className="order-2 lg:order-1 scroll-reveal scroll-reveal-delay-100">
                <div className="relative w-[320px] h-[640px] mx-auto">
                  <div className="absolute inset-0 bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden">
                    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
                      {/* Reels Slider */}
                      <div className="reels-slider absolute inset-0">
                        {/* Reel 1 - Marketing */}
                        <div className="reel-item">
                          <div className="absolute top-0 w-full p-4 flex justify-between text-white z-20">
                            <span className="font-bold">취준로드</span>
                            <i data-lucide="menu" className="w-5 h-5"></i>
                          </div>
                          
                          {/* Background Image */}
                          <div className="absolute inset-0">
                            <Image 
                              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop" 
                              alt="Team Meeting"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
                          </div>
                          
                          {/* Floating Question Bubble */}
                          <div className="absolute top-20 right-4 z-20 bg-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[200px] shadow-lg">
                            <p className="text-xs text-gray-500 font-bold mb-1">취준생 A</p>
                            <p className="text-sm text-gray-900 font-semibold">창업하려면 개발을 꼭 알아야 하나요? 🤔</p>
                          </div>

                          {/* Bottom Content */}
                          <div className="absolute bottom-0 w-full p-6 text-white z-20">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-bold border-2 border-white">M</div>
                              <div>
                                <h3 className="font-bold text-shadow">@스타트업_대표</h3>
                                <p className="text-xs text-gray-300">CEO • 5년차</p>
                              </div>
                            </div>
                            <p className="text-sm mb-4 drop-shadow-md">투자 미팅 3개 연속... 그래도 달린다 ✨ 스타트업 대표의 하루 VLOG</p>
                            
                            <button className="w-full py-3 bg-[#fee500] text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
                              <i data-lucide="message-circle" className="w-5 h-5"></i>
                              대화하기
                            </button>
                          </div>
                        </div>

                        {/* Reel 2 - Developer */}
                        <div className="reel-item">
                          <div className="absolute top-0 w-full p-4 flex justify-between text-white z-20">
                            <span className="font-bold">취준로드</span>
                            <i data-lucide="menu" className="w-5 h-5"></i>
                          </div>
                          
                          {/* Background Image */}
                          <div className="absolute inset-0">
                            <Image 
                              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop" 
                              alt="Developer Working"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
                          </div>

                          {/* Floating Question Bubble */}
                          <div className="absolute top-20 right-4 z-20 bg-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[200px] shadow-lg">
                            <p className="text-xs text-gray-500 font-bold mb-1">취준생 B</p>
                            <p className="text-sm text-gray-900 font-semibold">개발자는 주로 어떤 툴을 쓰나요? 💻</p>
                          </div>
                          
                          {/* Bottom Content */}
                          <div className="absolute bottom-0 w-full p-6 text-white z-20">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center font-bold border-2 border-white">D</div>
                              <div>
                                <h3 className="font-bold text-shadow">@프론트엔드_개발자</h3>
                                <p className="text-xs text-gray-300">Developer • 3년차</p>
                              </div>
                            </div>
                            <p className="text-sm mb-4 drop-shadow-md">코드 리뷰하고 배포하는 하루 🚀 개발자의 실제 일상</p>
                            
                            <button className="w-full py-3 bg-[#fee500] text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
                              <i data-lucide="message-circle" className="w-5 h-5"></i>
                              대화하기
                            </button>
                          </div>
                        </div>

                        {/* Reel 3 - Designer */}
                        <div className="reel-item">
                          <div className="absolute top-0 w-full p-4 flex justify-between text-white z-20">
                            <span className="font-bold">취준로드</span>
                            <i data-lucide="menu" className="w-5 h-5"></i>
                          </div>
                          
                          {/* Background Image */}
                          <div className="absolute inset-0">
                            <Image 
                              src="https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=800&auto=format&fit=crop" 
                              alt="Designer Workspace"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
                          </div>

                          {/* Floating Question Bubble */}
                          <div className="absolute top-20 right-4 z-20 bg-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[200px] shadow-lg">
                            <p className="text-xs text-gray-500 font-bold mb-1">취준생 C</p>
                            <p className="text-sm text-gray-900 font-semibold">디자이너는 포트폴리오가 중요한가요? 🎨</p>
                          </div>
                          
                          {/* Bottom Content */}
                          <div className="absolute bottom-0 w-full p-6 text-white z-20">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center font-bold border-2 border-white">U</div>
                              <div>
                                <h3 className="font-bold text-shadow">@UX디자이너</h3>
                                <p className="text-xs text-gray-300">Designer • 4년차</p>
                              </div>
                            </div>
                            <p className="text-sm mb-4 drop-shadow-md">사용자 리서치부터 프로토타입까지 🎯 디자이너의 하루</p>
                            
                            <button className="w-full py-3 bg-[#fee500] text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg">
                              <i data-lucide="message-circle" className="w-5 h-5"></i>
                              대화하기
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Swipe Indicator */}
                      <div className="swipe-indicator absolute bottom-32 left-1/2 -translate-x-1/2 text-white text-center z-30">
                        <i data-lucide="chevron-down" className="w-8 h-8 mx-auto"></i>
                        <p className="text-xs mt-2">스와이프하여 탐색</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description for Step 1 */}
              <div className="order-1 lg:order-2 max-w-md mx-auto lg:mx-0 scroll-reveal scroll-reveal-delay-200">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">릴스를 탐색하세요</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  스와이프하여 다양한 직무의 현직자들이 올린 짧은 브이로그를 탐색합니다. 
                  궁금한 직무, 회사, 분야의 리얼한 일상을 확인하세요.
                </p>
                <div className="flex items-center gap-3 text-green-600">
                  <i data-lucide="sparkles" className="w-5 h-5"></i>
                  <span className="font-semibold">1분 안에 직무 파악</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Chat Button */}
        <section className="content-step bg-gradient-to-b from-white to-green-50/30 py-20 scroll-reveal" data-step="2">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Description for Step 2 */}
              <div className="max-w-md mx-auto lg:mx-0 scroll-reveal">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">채팅하기를 눌러보세요</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  마음에 드는 멘토를 발견했다면 &apos;채팅하기&apos; 버튼을 클릭하세요. 
                  영상만으로는 알 수 없었던 궁금증을 바로 해결할 수 있습니다.
                </p>
                <div className="flex items-center gap-3 text-green-600">
                  <i data-lucide="zap" className="w-5 h-5"></i>
                  <span className="font-semibold">즉시 연결 가능</span>
                </div>
              </div>

              {/* Phone Mockup for Step 2 */}
              <div className="scroll-reveal scroll-reveal-delay-200">
                <div className="relative w-[320px] h-[640px] mx-auto">
                  <div className="absolute inset-0 bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden">
                    <div className="relative w-full h-full bg-gray-900">
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <Image 
                          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" 
                          alt="Startup Team"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
                      </div>

                      {/* Floating Question Bubble */}
                      <div className="absolute top-20 right-4 z-20 bg-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[200px] shadow-lg">
                        <p className="text-xs text-gray-500 font-bold mb-1">취준생 A</p>
                        <p className="text-sm text-gray-900 font-semibold">창업하려면 개발을 꼭 알아야 하나요? 🤔</p>
                      </div>
                      
                      <div className="absolute bottom-0 w-full p-6 text-white z-20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-bold border-2 border-white">S</div>
                          <div>
                            <h3 className="font-bold">@스타트업_대표</h3>
                            <p className="text-xs text-gray-300">CEO • 5년차</p>
                          </div>
                        </div>
                        <p className="text-sm mb-4 drop-shadow-md">창업 전 꼭 알아야 할 것들 💡</p>
                        
                        <div className="bg-[#fee500]/90 backdrop-blur-sm rounded-xl p-3 text-center">
                          <p className="text-xs mb-2 text-gray-800">궁금한 점이 있으신가요?</p>
                          <div className="flex items-center justify-center gap-2 text-gray-900">
                            <i data-lucide="message-circle" className="w-4 h-4"></i>
                            <span className="font-bold">채팅하기 버튼 클릭</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: 1:1 Chat */}
        <section className="content-step bg-gradient-to-b from-green-50/30 to-white py-20 scroll-reveal" data-step="3">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Phone Mockup for Step 3 */}
              <div className="order-2 lg:order-1 scroll-reveal scroll-reveal-delay-100">
                <div className="relative w-[320px] h-[640px] mx-auto">
                  <div className="absolute inset-0 bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden">
                    <div className="relative w-full h-full bg-white">
                      <div className="absolute top-0 w-full p-4 bg-green-600 text-white flex items-center gap-3">
                        <i data-lucide="arrow-left" className="w-5 h-5"></i>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">S</div>
                        <span className="font-bold">@스타트업_대표</span>
                      </div>

                      <div className="absolute inset-0 top-16 bottom-16 p-4 overflow-hidden">
                        <div className="mb-3">
                          <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-2xl rounded-tl-none inline-block max-w-[80%]">
                            <p className="text-sm">안녕하세요! 영상 잘 봤습니다 😊</p>
                          </div>
                        </div>
                        <div className="mb-3 text-right">
                          <div className="bg-green-600 text-white px-4 py-2 rounded-2xl rounded-tr-none inline-block max-w-[80%]">
                            <p className="text-sm">창업 시 개발자가 꼭 필요한가요?</p>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-2xl rounded-tl-none inline-block max-w-[80%]">
                            <p className="text-sm">좋은 질문이에요! 자세히 알려드릴게요 💪</p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-200">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                          <input type="text" placeholder="메시지를 입력하세요..." className="flex-1 bg-transparent text-sm outline-none text-gray-900" disabled />
                          <i data-lucide="send" className="w-5 h-5 text-green-600"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description for Step 3 */}
              <div className="order-1 lg:order-2 max-w-md mx-auto lg:mx-0 scroll-reveal scroll-reveal-delay-200">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">1:1 대화를 시작하세요</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  현직자와 직접 대화하며 진짜 정보를 얻으세요. 
                  회사 분위기, 업무 강도, 커리어 팁까지 솔직하게 물어볼 수 있습니다.
                </p>
                <div className="flex items-center gap-3 text-green-600">
                  <i data-lucide="heart" className="w-5 h-5"></i>
                  <span className="font-semibold">진심 어린 조언</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 relative scroll-reveal">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20 scroll-reveal">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">스펙보다 중요한 것은<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">리얼리티</span></h2>
              <p className="text-gray-600 text-lg">텍스트로는 알 수 없는 직무의 진짜 모습</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 scroll-reveal scroll-reveal-delay-100">
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                  <i data-lucide="play" className="w-7 h-7"></i>
                </div>
                <h3 className="text-2xl font-bold mb-3">숏폼 브이로그</h3>
                <p className="text-gray-600 leading-relaxed">
                  1분 안에 담긴 현직자의 하루. 화려함 뒤에 숨겨진 야근과 보람까지, 가감 없이 보여드립니다.
                </p>
              </div>

              {/* Card 2 */}
              <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border-green-500/50 scroll-reveal scroll-reveal-delay-200">
                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                  <i data-lucide="message-circle" className="w-7 h-7"></i>
                </div>
                <h3 className="text-2xl font-bold mb-3">1:1 채팅 멘토링</h3>
                <p className="text-gray-600 leading-relaxed">
                  &quot;이 회사 복지 진짜인가요?&quot;<br/>
                  가장 사소한 질문도 괜찮습니다. 현직자와 다이렉트로 연결됩니다.
                </p>
              </div>

              {/* Card 3 */}
              <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 scroll-reveal scroll-reveal-delay-300">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                  <i data-lucide="compass" className="w-7 h-7"></i>
                </div>
                <h3 className="text-2xl font-bold mb-3">문화 적합도</h3>
                <p className="text-gray-600 leading-relaxed">
                  단순 채용이 아닌, 나와 결이 맞는 팀을 찾으세요. 행복하게 일할 수 있는 곳을 발견합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section id="mission" className="py-32 relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
              <p className="text-green-600 text-sm font-semibold mb-3 tracking-wider">Vision & Mission</p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-green-600 mb-4 leading-tight">취준로드가<br/>그리는 미래</h2>
              <p className="text-gray-700 text-lg">청년이 사회로 나아가는 첫 관문</p>
            </div>

            {/* Vision & Mission Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Vision Card */}
              <div className="relative">
                <div className="h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-12 text-center shadow-2xl hover:scale-105 transition-transform duration-300">
                  <h3 className="text-white text-4xl font-bold mb-8">Vision</h3>
                  <p className="text-white text-xl leading-relaxed">
                    모든 청년이 원하는 일을 빠르게 찾고<br/>
                    재미있게 준비하는 세상을 만듭니다.
                  </p>
                </div>
              </div>

              {/* Mission Card */}
              <div className="relative">
                <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 text-center shadow-2xl hover:scale-105 transition-transform duration-300">
                  <h3 className="text-white text-4xl font-bold mb-8">Mission</h3>
                  <p className="text-white text-xl leading-relaxed">
                    사람들이 원하는 일을 하며 행복하게 살아가는<br/>
                    세상을 만들고자 합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Section */}
            <div className="flex flex-col md:flex-row items-center gap-16 max-w-6xl mx-auto">
              <div className="flex-1 space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold leading-[1.3] text-gray-900">
                  하고 싶은 일을 하는<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">행복한 세상</span>을<br/>만듭니다
                </h2>
                <div className="space-y-6 text-lg text-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center mt-1 text-green-600"><i data-lucide="check" className="w-4 h-4"></i></div>
                    <p><strong className="text-gray-900">보여주기에서 공감하기로.</strong><br/>화려한 성공담보다, &apos;왜 이 일을 사랑하는지&apos;에 대한 진심을 나눅니다.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center mt-1 text-green-600"><i data-lucide="check" className="w-4 h-4"></i></div>
                    <p><strong className="text-gray-900">문의에서 관계로.</strong><br/>단순 질의응답을 넘어, 커피챗과 사이드 프로젝트로 이어지는 멘토링을 지향합니다.</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial Visual */}
              <div className="flex-1 w-full relative">
                {/* Card Stack Effect */}
                <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-[2rem] rotate-6 opacity-30 blur-lg"></div>
                  <div className="absolute inset-0 bg-white rounded-[2rem] border border-green-200 flex flex-col items-center justify-center text-center p-8 shadow-xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full mb-6 overflow-hidden border-4 border-green-200">
                      <span className="text-4xl">👤</span>
                    </div>
                    <p className="text-2xl font-serif italic mb-4 text-gray-800">&quot;취준로드 덕분에<br/>영상을 보고 생긴 궁금증을 바로 해결 할 수 있었어요!&quot;</p>
                    <p className="text-sm text-gray-600">- 취업준비생 이동형님 -</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mentor & Mentee Registration Section */}
        <section id="community" className="py-24 relative bg-gradient-to-b from-white to-green-50/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">지금 바로<br/><span className="text-green-600">시작하세요</span></h2>
              <p className="text-gray-700 text-lg">경험을 나누고 질문하세요</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Mentor Card */}
              <div className="glass-panel rounded-3xl p-10 hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-3xl group-hover:bg-green-400/30 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                    <i data-lucide="user-check" className="w-8 h-8"></i>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">멘토로 참여하기</h3>
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    당신의 소중한 경험을 나눠주세요.<br/>
                    후배들의 고민을 함께 해결하며<br/>
                    의미있는 연결을 만들어보세요.
                  </p>
                  
                  <ul className="space-y-3 mb-8 text-gray-700">
                    <li className="flex items-center gap-3">
                      <i data-lucide="check-circle" className="w-5 h-5 text-green-600"></i>
                      <span>영상으로 직무 브이로그 공유</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <i data-lucide="check-circle" className="w-5 h-5 text-green-600"></i>
                      <span>1:1 채팅으로 맞춤 상담</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <i data-lucide="check-circle" className="w-5 h-5 text-green-600"></i>
                      <span>포인트 리워드 제공</span>
                    </li>
                  </ul>
                  
                  <button onClick={openMentorForm} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                    <i data-lucide="video" className="w-5 h-5"></i>
                    멘토 시작하기
                  </button>
                </div>
              </div>

              {/* Mentee Card */}
              <div className="glass-panel rounded-3xl p-10 hover:scale-105 transition-transform duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                    <i data-lucide="message-square-plus" className="w-8 h-8"></i>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">멘티로 질문하기</h3>
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    궁금한 직무, 회사, 커리어에 대해<br/>
                    현직자에게 직접 물어보세요.<br/>
                    진짜 답변을 얻을 수 있습니다.
                  </p>
                  
                  <ul className="space-y-3 mb-8 text-gray-700">
                    <li className="flex items-center gap-3">
                      <i data-lucide="check-circle" className="w-5 h-5 text-emerald-600"></i>
                      <span>실시간 직무 브이로그 탐색</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <i data-lucide="check-circle" className="w-5 h-5 text-emerald-600"></i>
                      <span>현직자와 1:1 대화</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <i data-lucide="check-circle" className="w-5 h-5 text-emerald-600"></i>
                      <span>무료로 시작 가능</span>
                    </li>
                  </ul>
                  
                  <button onClick={openMenteeForm} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                    <i data-lucide="send" className="w-5 h-5"></i>
                    질문 시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4 text-center">
            <div className="glass-panel max-w-4xl mx-auto rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-[100px] opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-8 relative z-10 text-gray-900 leading-tight">당신의 <span className="text-green-600">천직</span>을<br/>만날 시간</h2>
              <p className="text-gray-700 text-lg mb-10 relative z-10">1분이면 새로운 세상이 열립니다</p>
              
              <Link href="/chat" className="relative z-10 inline-block px-10 py-5 bg-green-600 text-white rounded-full font-bold text-xl hover:bg-green-700 hover:scale-105 transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                취준로드 시작하기
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-green-200 bg-green-50/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                  <i data-lucide="play" className="w-3 h-3 text-white fill-white ml-0.5"></i>
                </div>
                취준로드
              </div>
              <div className="flex gap-8 text-sm text-gray-600">
                <a href="#" className="hover:text-green-600">이용약관</a>
                <a href="#" className="hover:text-green-600">개인정보처리방침</a>
                <a href="#" className="hover:text-green-600">문의하기</a>
              </div>
              <div className="text-gray-500 text-sm">
                © 2025 취준로드 Inc. All rights reserved.
              </div>
            </div>
          </div>
        </footer>

        {/* Mentor Modal */}
        <div className={`modal ${mentorModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeMentorForm(); }}>
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">멘토 신청하기</h3>
              <button onClick={closeMentorForm} className="text-gray-400 hover:text-gray-600">
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            
            <form onSubmit={handleMentorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이름 *</label>
                <input 
                  type="text" 
                  required 
                  value={mentorForm.name}
                  onChange={(e) => setMentorForm({...mentorForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="홍길동" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 *</label>
                <input 
                  type="email" 
                  required 
                  value={mentorForm.email}
                  onChange={(e) => setMentorForm({...mentorForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="example@email.com" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">분야 *</label>
                <input 
                  type="text" 
                  required 
                  value={mentorForm.field}
                  onChange={(e) => setMentorForm({...mentorForm, field: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="예: 소프트웨어 개발, 마케팅, 디자인 등" 
                />
              </div>
              
              <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors mt-6">
                신청 완료
              </button>
            </form>
          </div>
        </div>

        {/* Mentee Modal */}
        <div className={`modal ${menteeModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeMenteeForm(); }}>
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">질문하기</h3>
              <button onClick={closeMenteeForm} className="text-gray-400 hover:text-gray-600">
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            
            <form onSubmit={handleMenteeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 *</label>
                <input 
                  type="email" 
                  required 
                  value={menteeForm.email}
                  onChange={(e) => setMenteeForm({...menteeForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  placeholder="example@email.com" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">질문 내용 *</label>
                <textarea 
                  required 
                  rows={6} 
                  value={menteeForm.question}
                  onChange={(e) => setMenteeForm({...menteeForm, question: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" 
                  placeholder="궁금한 점을 자유롭게 작성해주세요"
                ></textarea>
              </div>
              
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors mt-6">
                질문 보내기
              </button>
            </form>
          </div>
        </div>

        {/* Nickname Modal */}
        <div className={`modal ${showNicknameModal ? 'active' : ''}`} onClick={(e) => { if (!user) return; if (e.target === e.currentTarget && userNickname) setShowNicknameModal(false); }}>
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">닉네임 설정</h3>
              {userNickname && (
                <button onClick={() => setShowNicknameModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i data-lucide="x" className="w-6 h-6"></i>
                </button>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">
                채팅에서 사용할 닉네임을 설정해주세요.
              </p>
            </div>

            <form onSubmit={handleNicknameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">닉네임 *</label>
                <input 
                  type="text" 
                  required 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={!nickname.trim()}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                설정 완료
              </button>
            </form>
          </div>
        </div>

        {/* Email Modal (앱 다운로드) */}
        <div className={`modal ${emailModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeEmailModal(); }}>
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">앱 출시 알림 받기</h3>
              <button onClick={closeEmailModal} className="text-gray-400 hover:text-gray-600">
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">
                취준로드 앱이 곧 출시됩니다! 🎉<br/>
                이메일을 남겨주시면 출시 소식을 가장 먼저 알려드릴게요.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 주소 *</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="example@email.com" 
                  disabled={isSubmitting}
                />
              </div>
              
              {submitMessage && (
                <div className={`p-4 rounded-xl ${submitMessage.includes('감사') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {submitMessage}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '전송 중...' : '알림 받기'}
              </button>
            </form>
          </div>
        </div>

        {/* Login Required Modal */}
        <div className={`modal ${showLoginModal ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeLoginModal(); }}>
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">로그인이 필요합니다</h3>
              <button onClick={closeLoginModal} className="text-gray-400 hover:text-gray-600">
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed mb-4">
                멘토님과 채팅하려면 로그인이 필요합니다. 🔒
              </p>
              <p className="text-gray-500 text-sm">
                Google 계정으로 간편하게 로그인하세요.
              </p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLoggingIn ? '로그인 중...' : 'Google로 로그인'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// 메인 컴포넌트 - Suspense로 감싸기
export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">로딩 중...</div></div>}>
      <LandingPageContent />
    </Suspense>
  );
}
