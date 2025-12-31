'use client';

import Link from 'next/link';
import { useState } from 'react';

// 빌드 시 정적 생성 방지
export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  title: string;
  mentorName: string;
  mentorAvatar: string;
  price: number;
  originalPrice: number;
  description: string;
  category: string;
  sales: number;
  rating: number;
  thumbnail: string;
  company: string;
  field: string;
  imageUrl: string;
}

const products: Product[] = [
  {
    id: 1,
    title: 'CJ제일제당 마케팅 직무 합격 전략',
    mentorName: '이원준',
    mentorAvatar: '👨‍🍳',
    price: 10000,
    originalPrice: 10000,
    description: 'CJ제일제당 마케팅 직무 면접 준비와 자기소개서 작성 가이드',
    category: '취업',
    sales: 89,
    rating: 4.9,
    thumbnail: '📝',
    company: 'CJ제일제당',
    field: '마케팅/식품 기획',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500',
  },
  {
    id: 2,
    title: '삼성전자 SW개발 포트폴리오 완성',
    mentorName: '김서현',
    mentorAvatar: '👩‍💻',
    price: 10000,
    originalPrice: 10000,
    description: 'SSAFY 출신이 알려주는 비전공자 개발자 취업 성공기',
    category: '개발',
    sales: 156,
    rating: 4.8,
    thumbnail: '💻',
    company: '삼성전자',
    field: 'SW개발',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500',
  },
  {
    id: 3,
    title: 'LG전자 경영기획 직무 인적성 대비',
    mentorName: '박준혁',
    mentorAvatar: '👨‍💼',
    price: 10000,
    originalPrice: 10000,
    description: '대기업 인적성부터 임원면접까지 채용 프로세스 완벽 가이드',
    category: '취업',
    sales: 203,
    rating: 5.0,
    thumbnail: '📊',
    company: 'LG전자',
    field: '경영기획',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
  },
  {
    id: 4,
    title: '카카오 UX/UI 디자이너 포트폴리오',
    mentorName: '정다은',
    mentorAvatar: '👩‍🎨',
    price: 10000,
    originalPrice: 10000,
    description: '카카오톡 디자이너가 알려주는 포트폴리오 구성 노하우',
    category: '디자인',
    sales: 178,
    rating: 4.9,
    thumbnail: '🎨',
    company: '카카오',
    field: 'UX/UI 디자인',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
  },
  {
    id: 5,
    title: 'SK하이닉스 R&D 연구직 준비',
    mentorName: '최민수',
    mentorAvatar: '👨‍🔬',
    price: 10000,
    originalPrice: 10000,
    description: '석사 출신 연구직 취업 가이드 - 학위 vs 경력 고민 해결',
    category: '연구',
    sales: 134,
    rating: 4.7,
    thumbnail: '🔬',
    company: 'SK하이닉스',
    field: 'R&D/연구개발',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
  },
  {
    id: 6,
    title: '현대자동차 HR 직무 면접 대비',
    mentorName: '강유진',
    mentorAvatar: '👩‍💼',
    price: 10000,
    originalPrice: 10000,
    description: '면접관이 보는 합격자의 공통점 - 채용 담당자의 리얼 조언',
    category: '취업',
    sales: 167,
    rating: 5.0,
    thumbnail: '💼',
    company: '현대자동차',
    field: '인사/HR',
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500',
  },
  {
    id: 7,
    title: '네이버 백엔드 개발자 코딩테스트',
    mentorName: '윤재석',
    mentorAvatar: '👨‍💻',
    price: 10000,
    originalPrice: 10000,
    description: '네이버 코딩테스트 준비법과 기술 면접 단골 질문 100선',
    category: '개발',
    sales: 245,
    rating: 4.9,
    thumbnail: '⌨️',
    company: '네이버',
    field: '백엔드 개발',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
  },
  {
    id: 8,
    title: 'LG화학 생산관리 직무 가이드',
    mentorName: '송하늘',
    mentorAvatar: '👩‍🏭',
    price: 10000,
    originalPrice: 10000,
    description: '화학공학 전공자를 위한 제조업 취업 완벽 가이드',
    category: '제조',
    sales: 112,
    rating: 4.6,
    thumbnail: '🏭',
    company: 'LG화학',
    field: '생산관리',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500',
  },
  {
    id: 9,
    title: 'SK이노베이션 재무직 CPA 병행',
    mentorName: '임동현',
    mentorAvatar: '👨‍💼',
    price: 10000,
    originalPrice: 10000,
    description: 'CPA 준비하며 대기업 재무직 취업한 노하우',
    category: '회계',
    sales: 189,
    rating: 4.8,
    thumbnail: '📈',
    company: 'SK이노베이션',
    field: '재무/회계',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
  },
  {
    id: 10,
    title: 'CJ제일제당 품질관리 직무 준비',
    mentorName: '한서윤',
    mentorAvatar: '👩‍🔬',
    price: 10000,
    originalPrice: 10000,
    description: '식품공학 전공자를 위한 대기업 품질직 취업 전략',
    category: '품질',
    sales: 98,
    rating: 4.7,
    thumbnail: '✅',
    company: 'CJ제일제당',
    field: '품질관리',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500',
  },
  {
    id: 11,
    title: '쿠팡 데이터 분석가 포트폴리오',
    mentorName: '오진우',
    mentorAvatar: '👨‍💻',
    price: 10000,
    originalPrice: 10000,
    description: '비전공자 SQL/Python 독학으로 데이터 분석가 되기',
    category: '데이터',
    sales: 221,
    rating: 4.9,
    thumbnail: '📊',
    company: '쿠팡',
    field: '데이터 분석',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
  },
  {
    id: 12,
    title: '삼성전자 B2B 영업 직무 가이드',
    mentorName: '배수진',
    mentorAvatar: '👩‍💼',
    price: 10000,
    originalPrice: 10000,
    description: '대기업 영업직의 리얼 - 전략적 세일즈 노하우',
    category: '영업',
    sales: 145,
    rating: 4.8,
    thumbnail: '💰',
    company: '삼성전자',
    field: '영업/Sales',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500',
  },
  {
    id: 13,
    title: '아모레퍼시픽 마케팅 직무 준비',
    mentorName: '서준호',
    mentorAvatar: '👨‍🎓',
    price: 10000,
    originalPrice: 10000,
    description: '뷰티 업계 브랜드 마케팅과 SNS 전략 완벽 가이드',
    category: '마케팅',
    sales: 167,
    rating: 4.9,
    thumbnail: '💄',
    company: '아모레퍼시픽',
    field: '마케팅',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500',
  },
  {
    id: 14,
    title: 'LG AI연구원 머신러닝 직무',
    mentorName: '안지혜',
    mentorAvatar: '👩‍💻',
    price: 10000,
    originalPrice: 10000,
    description: 'AI 직무 포트폴리오 구성과 대학원 vs 취업 가이드',
    category: 'AI',
    sales: 198,
    rating: 5.0,
    thumbnail: '🤖',
    company: 'LG AI연구원',
    field: 'AI/머신러닝',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500',
  },
  {
    id: 15,
    title: '현대제철 공정엔지니어 준비',
    mentorName: '조민기',
    mentorAvatar: '👨‍🏭',
    price: 10000,
    originalPrice: 10000,
    description: '기계공학 전공자를 위한 제조업 엔지니어 취업 가이드',
    category: '제조',
    sales: 124,
    rating: 4.7,
    thumbnail: '⚙️',
    company: '현대제철',
    field: '공정엔지니어',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500',
  },
  {
    id: 16,
    title: '카카오뱅크 전략기획 케이스 스터디',
    mentorName: '홍민지',
    mentorAvatar: '👩‍💼',
    price: 10000,
    originalPrice: 10000,
    description: '핀테크 산업 전망과 케이스 스터디 면접 완벽 대비',
    category: '기획',
    sales: 187,
    rating: 4.9,
    thumbnail: '🏦',
    company: '카카오뱅크',
    field: '전략기획',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500',
  },
  {
    id: 17,
    title: 'NHN 보안 직무 자격증 활용법',
    mentorName: '신동욱',
    mentorAvatar: '👨‍💻',
    price: 10000,
    originalPrice: 10000,
    description: '정보보호 전공자를 위한 클라우드 보안 직무 가이드',
    category: '보안',
    sales: 143,
    rating: 4.8,
    thumbnail: '🔐',
    company: 'NHN',
    field: '보안/인프라',
    imageUrl: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=500',
  },
  {
    id: 18,
    title: 'HYBE 콘텐츠 기획 포트폴리오',
    mentorName: '유채원',
    mentorAvatar: '👩‍🎨',
    price: 10000,
    originalPrice: 10000,
    description: '엔터테인먼트 업계 콘텐츠 기획자 취업 완벽 가이드',
    category: '엔터',
    sales: 209,
    rating: 5.0,
    thumbnail: '🎬',
    company: 'HYBE',
    field: '콘텐츠 기획',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500',
  },
  {
    id: 19,
    title: '삼성SDI 설비엔지니어 기술면접',
    mentorName: '전승현',
    mentorAvatar: '👨‍🔧',
    price: 10000,
    originalPrice: 10000,
    description: '전기공학 전공자를 위한 배터리 업계 설비직 가이드',
    category: '제조',
    sales: 156,
    rating: 4.8,
    thumbnail: '🔋',
    company: '삼성SDI',
    field: '설비엔지니어',
    imageUrl: 'https://images.unsplash.com/photo-1609557927087-f9cf8e88de18?w=500',
  },
  {
    id: 20,
    title: 'SK텔레콤 구매/SCM 직무 준비',
    mentorName: '권나연',
    mentorAvatar: '👩‍💼',
    price: 10000,
    originalPrice: 10000,
    description: '협상력과 원가분석 - 구매직에 필요한 핵심 역량',
    category: '구매',
    sales: 132,
    rating: 4.7,
    thumbnail: '📦',
    company: 'SK텔레콤',
    field: '구매/SCM',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500',
  },
];

const categories = ['전체', '취업', '개발', '디자인', '데이터', '마케팅', '연구', '제조', 'AI', '엔터'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredProducts = selectedCategory === '전체'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-green-50">
      {/* 헤더 */}
      <header className="bg-white p-4 sticky top-0 z-10 border-b">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">기업공략집 스토어</h1>
          
          {/* 카테고리 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 상품 리스트 */}
      <main className="max-w-4xl mx-auto p-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 상품 썸네일 */}
              <div className="relative h-48 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${product.imageUrl})`,
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                  }}
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* 상품 정보 */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">{product.mentorName}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {product.price.toLocaleString()}원
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.sales}명 구매
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
                    {product.company}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 rounded text-xs text-blue-600 font-medium">
                    {product.field}
                  </span>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all">
                  구매하기
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-gray-500 text-lg">해당 카테고리의 상품이 없습니다</p>
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-4xl mx-auto flex">
          <Link href="/chat" className="flex-1 py-4 flex flex-col items-center text-gray-500 hover:text-green-600">
            <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs font-medium">멘토</span>
          </Link>
          
          <Link href="/chats" className="flex-1 py-4 flex flex-col items-center text-gray-500 hover:text-green-600">
            <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">채팅</span>
          </Link>
          
          <Link href="/products" className="flex-1 py-4 flex flex-col items-center text-green-600">
            <svg className="w-7 h-7 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs font-medium">스토어</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
