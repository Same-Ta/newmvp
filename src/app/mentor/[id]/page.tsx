'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// 빌드 시 정적 생성 방지
export const dynamic = 'force-dynamic';

// 멘토 데이터 (chatId와 동일한 구조)
const mentorData: { [key: string]: {
  name: string;
  avatar: string;
  field: string;
  company: string;
  experience: string;
  status: string;
  description: string;
  careers: { title: string; period: string }[];
  skills: string[];
  specs: { label: string; value: string }[];
  questions: string[];
}} = {
  '1': {
    name: '이원준',
    avatar: '👨‍🍳',
    field: '마케팅/식품 기획',
    company: 'CJ제일제당',
    experience: '입사 2년차',
    status: '온라인',
    description: '트렌드를 읽고 실행하는 식품 마케터입니다. "스펙보다 회사가 왜 나를 뽑아야 하는지" 설명할 수 있었던 게 합격의 킥이었습니다. 취준생 여러분의 솔직한 고민, 함께 나눠요!',
    careers: [
      { title: 'CJ제일제당 마케팅팀', period: '2023 - 현재' },
      { title: 'CJ제일제당 인턴', period: '2022 - 2023' }
    ],
    skills: ['마케팅 전략', '트렌드 분석', '브랜드 기획', '소비자 조사'],
    specs: [
      { label: '학력', value: '서울대학교 경영학과 졸업' },
      { label: '자격증', value: 'ADsP (데이터분석 준전문가)' },
      { label: '어학', value: 'TOEIC 920점' },
      { label: '수상', value: 'CJ 마케팅 공모전 대상' }
    ],
    questions: [
      'CJ제일제당 면접에서 가장 중요하게 본 포인트가 뭐였나요?',
      '이력서를 어느 정도까지 준비하고 들어가셨나요? 외워야 할까요?',
      '취준할 때 실패했던 경험도 솔직하게 말하는 게 도움이 될까요?',
      '마케팅 직무에서 가장 중요한 역량은 무엇인가요?',
      '신입 마케터로서 어떤 업무를 주로 하시나요?'
    ]
  },
  '2': {
    name: '김서현',
    avatar: '👩‍💻',
    field: 'SW개발',
    company: '삼성전자',
    experience: '입사 3년차',
    status: '온라인',
    description: '삼성전자 무선사업부에서 안드로이드 앱 개발을 담당하고 있습니다. SSAFY 출신으로 비전공자도 충분히 도전할 수 있다는 걸 보여드리고 싶어요.',
    careers: [
      { title: '삼성전자 안드로이드 개발', period: '2022 - 현재' },
      { title: 'SSAFY 9기', period: '2021 - 2022' }
    ],
    skills: ['Android', 'Kotlin', 'Java', 'Git', 'REST API'],
    specs: [
      { label: '학력', value: '연세대학교 영문학과 졸업' },
      { label: '교육', value: 'SSAFY 9기 우수 수료' },
      { label: '자격증', value: '정보처리기사' },
      { label: '어학', value: 'TOEIC 950점' }
    ],
    questions: [
      '삼성전자 SSAFY 출신으로 취업하셨는데, 부트캠프의 장점이 뭔가요?',
      '비전공자가 개발자 취업할 때 가장 큰 장벽은 무엇이었나요?',
      '안드로이드 개발 포트폴리오는 어떻게 준비하면 좋을까요?',
      '코딩 테스트는 어느 정도 수준까지 준비하셨나요?',
      '실무에서 가장 어려웠던 점은 무엇인가요?'
    ]
  },
  '3': {
    name: '박준혁',
    avatar: '👨‍💼',
    field: '경영기획',
    company: 'LG전자',
    experience: '입사 4년차',
    status: '오프라인',
    description: 'LG전자 경영기획팀에서 중장기 전략을 수립합니다. 인적성부터 임원면접까지, 대기업 채용 프로세스의 A to Z를 함께 나눠드릴게요.',
    careers: [
      { title: 'LG전자 경영기획팀', period: '2021 - 현재' },
      { title: 'LG전자 전략기획 인턴', period: '2020 - 2021' }
    ],
    skills: ['경영 전략', '사업 기획', '재무 분석', 'Excel', 'PowerPoint'],
    specs: [
      { label: '학력', value: '고려대학교 경영학과 / MBA' },
      { label: '자격증', value: 'CFA Level 2' },
      { label: '어학', value: 'TOEIC 980점, OPIc AL' },
      { label: '수상', value: 'LG 경영혁신 공모전 최우수상' }
    ],
    questions: [
      'LG전자 인적성 시험은 어떻게 준비하셨나요?',
      '경영기획직 면접에서 어떤 질문이 나왔나요?',
      '임원면접 분위기와 준비 꿀팁이 궁금합니다!',
      '경영기획직에 필요한 핵심 역량은 무엇인가요?',
      'MBA가 경영기획 취업에 도움이 되나요?'
    ]
  },
  '4': {
    name: '정다은',
    avatar: '👩‍🎨',
    field: 'UX/UI 디자인',
    company: '카카오',
    experience: '입사 2년차',
    status: '온라인',
    description: '카카오톡 UI/UX를 디자인합니다. 포트폴리오 구성부터 디자인 직무 면접 꿀팁까지, 실무 디자이너의 시각으로 알려드릴게요.',
    careers: [
      { title: '카카오 UX/UI 디자이너', period: '2023 - 현재' },
      { title: '스타트업 프로덕트 디자이너', period: '2021 - 2023' }
    ],
    skills: ['Figma', 'Sketch', 'Prototyping', 'User Research', 'Design System'],
    specs: [
      { label: '학력', value: '홍익대학교 시각디자인과 졸업' },
      { label: '수상', value: '카카오 디자인 공모전 우수상' },
      { label: '어학', value: 'TOEIC 880점' },
      { label: '기타', value: 'Google UX Design Certificate' }
    ],
    questions: [
      '카카오 디자이너 포트폴리오 구성은 어떻게 해야 하나요?',
      'UI/UX 직무 면접에서 실제로 어떤 과제가 나오나요?',
      '디자인 트렌드는 어떻게 공부하고 계신가요?',
      'Figma와 Sketch 중 어떤 툴을 먼저 배워야 할까요?',
      '사용자 리서치는 어떻게 진행하나요?'
    ]
  },
  '5': {
    name: '최민수',
    avatar: '👨‍🔬',
    field: 'R&D/연구개발',
    company: 'SK하이닉스',
    experience: '입사 3년차',
    status: '온라인',
    description: '반도체 공정 연구를 하고 있습니다. 석사 출신으로 연구직 준비하시는 분들께 학위 vs 경력, 연구 포트폴리오 준비법 등을 공유합니다.',
    careers: [
      { title: 'SK하이닉스 반도체 공정 연구원', period: '2022 - 현재' },
      { title: 'KAIST 석사과정', period: '2020 - 2022' }
    ],
    skills: ['반도체 공정', '박막 증착', 'SEM/TEM 분석', '논문 작성'],
    specs: [
      { label: '학력', value: 'KAIST 전자공학 석사' },
      { label: '논문', value: 'SCI급 논문 3편 게재' },
      { label: '어학', value: 'TOEIC 920점' },
      { label: '특허', value: '반도체 공정 관련 특허 2건' }
    ],
    questions: [
      'SK하이닉스 연구직은 석사가 필수인가요?',
      '연구 포트폴리오는 논문 위주로 구성해야 하나요?',
      '학위과정 중 취업 vs 박사 진학, 어떻게 결정하셨나요?',
      '반도체 업계 전망은 어떻게 보시나요?',
      '연구직 면접에서 어떤 질문이 나왔나요?'
    ]
  },
  '6': {
    name: '강유진',
    avatar: '👩‍💼',
    field: '인사/HR',
    company: '현대자동차',
    experience: '입사 2년차',
    status: '온라인',
    description: '현대자동차 인사팀에서 채용을 담당합니다. 면접관 입장에서 본 합격자들의 공통점, 면접 후 평가 기준 등 리얼한 이야기 들려드릴게요.',
    careers: [
      { title: '현대자동차 인사팀 채용 담당', period: '2023 - 현재' },
      { title: '현대자동차 HR 인턴', period: '2022 - 2023' }
    ],
    skills: ['채용', '인사 평가', '조직문화', '노무 관리'],
    specs: [
      { label: '학력', value: '이화여대 심리학과 졸업' },
      { label: '자격증', value: '공인노무사 1차 합격' },
      { label: '어학', value: 'TOEIC 960점, TOEIC Speaking 7급' },
      { label: '교육', value: 'SHRM-CP (국제인사관리자격증)' }
    ],
    questions: [
      '현대자동차 인사팀 면접관으로서, 합격자들의 공통점은 뭔가요?',
      '면접 후 평가 기준이 궁금합니다. 어떤 점을 중요하게 보시나요?',
      'HR 직무는 어떤 역량이 가장 중요한가요?',
      '인사 직무 면접 준비는 어떻게 해야 하나요?',
      '채용 트렌드가 어떻게 변하고 있나요?'
    ]
  },
  '7': {
    name: '윤재석',
    avatar: '👨‍💻',
    field: '백엔드 개발',
    company: '네이버',
    experience: '입사 5년차',
    status: '오프라인',
    description: '네이버 검색 플랫폼 백엔드 개발자입니다. 코딩테스트 준비법, 기술 면접 단골 질문, 실무에서 쓰는 기술 스택 등을 알려드립니다.',
    careers: [
      { title: '네이버 검색 플랫폼 개발', period: '2020 - 현재' },
      { title: '스타트업 백엔드 개발자', period: '2018 - 2020' }
    ],
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Kafka', 'AWS'],
    specs: [
      { label: '학력', value: '서울대학교 컴퓨터공학과 졸업' },
      { label: '자격증', value: 'AWS Certified Solutions Architect' },
      { label: '어학', value: 'TOEIC 900점' },
      { label: 'GitHub', value: 'Contributions 2000+ / Stars 500+' }
    ],
    questions: [
      '네이버 코딩테스트는 어느 정도 수준까지 준비해야 하나요?',
      '백엔드 기술 면접에서 단골로 나오는 질문이 있나요?',
      '실무에서 쓰는 기술과 면접 준비 기술이 다른가요?',
      '대규모 트래픽 처리 경험을 쌓으려면 어떻게 해야 하나요?',
      '신입 백엔드 개발자에게 필요한 핵심 스킬은 무엇인가요?'
    ]
  },
  '8': {
    name: '송하늘',
    avatar: '👩‍🏭',
    field: '생산관리',
    company: 'LG화학',
    experience: '입사 3년차',
    status: '온라인',
    description: 'LG화학 배터리 생산라인을 관리합니다. 화학공학 전공자로서 제조업 취업 준비, 생산직 vs 사무직 차이 등 현장 이야기 나눠요.',
    careers: [
      { title: 'LG화학 배터리 생산관리', period: '2022 - 현재' },
      { title: 'LG화학 생산기술 인턴', period: '2021 - 2022' }
    ],
    skills: ['생산 공정 관리', '품질 관리', '6시그마', 'ERP'],
    specs: [
      { label: '학력', value: '한양대학교 화학공학과 졸업' },
      { label: '자격증', value: '품질경영기사, 6시그마 GB' },
      { label: '어학', value: 'TOEIC 890점' },
      { label: '교육', value: 'LG Way 교육 이수' }
    ],
    questions: [
      'LG화학 생산관리직은 어떤 업무를 하나요?',
      '화학공학 전공으로 제조업 취업할 때 꿀팁이 있을까요?',
      '생산직과 사무직의 실제 차이가 궁금합니다!',
      '배터리 산업 전망은 어떻게 보시나요?',
      '생산관리 직무에 필요한 자격증이 있나요?'
    ]
  },
  '9': {
    name: '임동현',
    avatar: '👨‍💼',
    field: '재무/회계',
    company: 'SK이노베이션',
    experience: '입사 4년차',
    status: '온라인',
    description: 'SK이노베이션 재무팀에서 투자분석을 담당합니다. CPA 준비하면서 취업했던 경험, 회계 직무 면접 준비법 공유합니다.',
    careers: [
      { title: 'SK이노베이션 재무팀', period: '2021 - 현재' },
      { title: '회계법인 인턴', period: '2020 - 2021' }
    ],
    skills: ['재무 분석', '투자 평가', 'Excel', 'SAP', 'IFRS'],
    specs: [
      { label: '학력', value: '성균관대학교 경영학과 졸업' },
      { label: '자격증', value: 'CPA (공인회계사)' },
      { label: '어학', value: 'TOEIC 970점' },
      { label: '교육', value: 'CFA Level 1 합격' }
    ],
    questions: [
      'CPA 준비하면서 취업도 병행 가능한가요?',
      'SK이노베이션 재무직 면접에서 어떤 질문이 나왔나요?',
      '회계 직무 면접 준비는 어떻게 해야 하나요?',
      '재무/회계 직무에 필요한 핵심 역량은 무엇인가요?',
      'Excel 고급 기능은 어느 정도까지 알아야 하나요?'
    ]
  },
  '10': {
    name: '한서윤',
    avatar: '👩‍🔬',
    field: '품질관리',
    company: 'CJ제일제당',
    experience: '입사 2년차',
    status: '온라인',
    description: 'CJ제일제당 식품안전센터에서 품질관리를 합니다. 식품공학 전공으로 대기업 품질직 준비하시는 분들께 도움 드리고 싶어요.',
    careers: [
      { title: 'CJ제일제당 품질관리팀', period: '2023 - 현재' },
      { title: 'CJ제일제당 품질 인턴', period: '2022 - 2023' }
    ],
    skills: ['품질 관리', '식품 안전', 'HACCP', '미생물 검사'],
    specs: [
      { label: '학력', value: '서울대학교 식품공학과 졸업' },
      { label: '자격증', value: '식품기사, 품질경영기사' },
      { label: '어학', value: 'TOEIC 910점' },
      { label: '교육', value: 'HACCP 전문가 과정 이수' }
    ],
    questions: [
      'CJ제일제당 품질관리직은 어떤 일을 하나요?',
      '식품공학 전공자로 대기업 품질직 준비할 때 필요한 자격증이 있나요?',
      '품질관리 vs 연구개발, 어떤 차이가 있나요?',
      '식품 안전 이슈 발생 시 어떻게 대응하나요?',
      '품질관리 직무의 커리어 패스는 어떻게 되나요?'
    ]
  },
  '11': {
    name: '오진우',
    avatar: '👨‍💻',
    field: '데이터 분석',
    company: '쿠팡',
    experience: '입사 3년차',
    status: '오프라인',
    description: '쿠팡 데이터 분석가로 고객 행동 분석을 합니다. SQL, Python 독학으로 비전공 취업 성공한 케이스입니다. 포트폴리오 만드는 법 알려드릴게요.',
    careers: [
      { title: '쿠팡 데이터 분석가', period: '2022 - 현재' },
      { title: '스타트업 데이터 인턴', period: '2021 - 2022' }
    ],
    skills: ['Python', 'SQL', 'Tableau', 'Google Analytics', 'A/B Testing'],
    specs: [
      { label: '학력', value: '연세대학교 경제학과 졸업 (비전공)' },
      { label: '자격증', value: 'ADsP, SQLD' },
      { label: '어학', value: 'TOEIC 930점' },
      { label: '교육', value: '구글 데이터 분석 자격증' }
    ],
    questions: [
      '비전공자가 데이터 분석가로 취업하려면 어떤 공부를 해야 하나요?',
      'SQL과 Python 중 뭘 먼저 배워야 할까요?',
      '데이터 분석 포트폴리오는 어떻게 만들면 좋을까요?',
      '쿠팡 데이터 분석가 면접은 어떻게 준비하셨나요?',
      '실무에서 가장 많이 사용하는 분석 기법은 무엇인가요?'
    ]
  },
  '12': {
    name: '배수진',
    avatar: '👩‍💼',
    field: '영업/Sales',
    company: '삼성전자',
    experience: '입사 4년차',
    status: '온라인',
    description: '삼성전자 B2B 영업을 담당합니다. 영업직은 발로 뛰는 것만이 아닙니다. 전략적 세일즈, 대기업 영업의 리얼을 들려드릴게요.',
    careers: [
      { title: '삼성전자 B2B 영업', period: '2021 - 현재' },
      { title: '삼성전자 영업 인턴', period: '2020 - 2021' }
    ],
    skills: ['B2B 영업', '고객 관리', '협상', 'Salesforce'],
    specs: [
      { label: '학력', value: '고려대학교 경영학과 졸업' },
      { label: '자격증', value: '텔레마케팅관리사' },
      { label: '어학', value: 'TOEIC 950점, OPIc IH' },
      { label: '수상', value: '삼성전자 우수 영업사원상 2회' }
    ],
    questions: [
      '삼성전자 B2B 영업은 일반 영업과 어떻게 다른가요?',
      '대기업 영업직 면접에서 중요하게 보는 포인트가 뭔가요?',
      '영업 실적 압박은 실제로 어느 정도인가요?',
      '영업 직무에 필요한 핵심 스킬은 무엇인가요?',
      '고객과의 관계는 어떻게 유지하나요?'
    ]
  },
  '13': {
    name: '서준호',
    avatar: '👨‍🎓',
    field: '마케팅',
    company: '아모레퍼시픽',
    experience: '입사 2년차',
    status: '온라인',
    description: '아모레퍼시픽 브랜드 마케터입니다. 뷰티 업계 트렌드, SNS 마케팅 전략, 브랜드 기획 면접 꿀팁 등을 나눠요.',
    careers: [
      { title: '아모레퍼시픽 브랜드 마케터', period: '2023 - 현재' },
      { title: '광고 대행사 AE', period: '2021 - 2023' }
    ],
    skills: ['브랜드 마케팅', 'SNS 마케팅', '광고 기획', 'Photoshop'],
    specs: [
      { label: '학력', value: '연세대학교 광고홍보학과 졸업' },
      { label: '수상', value: '아모레퍼시픽 마케팅 공모전 우수상' },
      { label: '어학', value: 'TOEIC 920점' },
      { label: '자격증', value: '컬러리스트기사' }
    ],
    questions: [
      '아모레퍼시픽 브랜드 마케터는 어떤 일을 하나요?',
      '뷰티 업계 마케팅 트렌드가 궁금합니다!',
      '브랜드 기획 면접에서 어떤 과제가 나오나요?',
      'SNS 마케팅 전략은 어떻게 수립하나요?',
      '광고 대행사와 브랜드사 마케팅의 차이는 무엇인가요?'
    ]
  },
  '14': {
    name: '안지혜',
    avatar: '👩‍💻',
    field: 'AI/머신러닝',
    company: 'LG AI연구원',
    experience: '입사 2년차',
    status: '온라인',
    description: 'LG AI연구원에서 자연어처리 연구를 합니다. AI 직무 포트폴리오 구성, 대학원 vs 취업 고민, 논문 작성법 등 공유합니다.',
    careers: [
      { title: 'LG AI연구원 NLP 연구원', period: '2023 - 현재' },
      { title: 'KAIST 석사과정', period: '2021 - 2023' }
    ],
    skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Deep Learning'],
    specs: [
      { label: '학력', value: 'KAIST 인공지능학과 석사' },
      { label: '논문', value: 'AI 학회 논문 5편 게재' },
      { label: '어학', value: 'TOEIC 940점' },
      { label: '수상', value: 'AI 해커톤 대회 1위' }
    ],
    questions: [
      'AI 직무 포트폴리오는 어떻게 구성해야 하나요?',
      '대학원 진학 vs 바로 취업, 어떤 게 나을까요?',
      '논문 실적이 없어도 AI 연구직 지원 가능한가요?',
      '자연어처리 분야의 최신 트렌드는 무엇인가요?',
      'AI 엔지니어와 AI 연구원의 차이가 무엇인가요?'
    ]
  },
  '15': {
    name: '조민기',
    avatar: '👨‍🏭',
    field: '공정엔지니어',
    company: '현대제철',
    experience: '입사 5년차',
    status: '오프라인',
    description: '현대제철 제강공정 엔지니어입니다. 기계/금속 전공자로 제조업 취업 준비하시는 분들, 현장직 vs 연구직 고민 상담해드립니다.',
    careers: [
      { title: '현대제철 제강공정 엔지니어', period: '2020 - 현재' },
      { title: '현대제철 기술 인턴', period: '2019 - 2020' }
    ],
    skills: ['공정 관리', '설비 운영', 'AutoCAD', '6시그마'],
    specs: [
      { label: '학력', value: 'POSTECH 기계공학과 졸업' },
      { label: '자격증', value: '기계기사, 금속기사' },
      { label: '어학', value: 'TOEIC 870점' },
      { label: '교육', value: '6시그마 BB 자격' }
    ],
    questions: [
      '현대제철 공정 엔지니어는 어떤 업무를 하나요?',
      '기계공학 전공으로 제조업 취업 준비 중인데 조언 부탁드립니다!',
      '현장직과 연구직 중 어떤 걸 선택해야 할까요?',
      '제철 산업의 전망은 어떻게 보시나요?',
      '공정 엔지니어에게 필요한 핵심 역량은 무엇인가요?'
    ]
  },
  '16': {
    name: '홍민지',
    avatar: '👩‍💼',
    field: '전략기획',
    company: '카카오뱅크',
    experience: '입사 3년차',
    status: '온라인',
    description: '카카오뱅크 전략기획팀입니다. 핀테크 산업 전망, 금융권 취업 트렌드, 케이스 스터디 면접 준비법 등을 나눠드려요.',
    careers: [
      { title: '카카오뱅크 전략기획팀', period: '2022 - 현재' },
      { title: 'KB국민은행 디지털전략 인턴', period: '2021 - 2022' }
    ],
    skills: ['전략 기획', '사업 분석', 'Excel', 'PowerPoint', 'Tableau'],
    specs: [
      { label: '학력', value: '서울대학교 경제학과 졸업' },
      { label: '자격증', value: '재무분석사(CFA)' },
      { label: '어학', value: 'TOEIC 980점' },
      { label: '수상', value: '카카오뱅크 신사업 아이디어 공모전 대상' }
    ],
    questions: [
      '카카오뱅크 전략기획팀은 어떤 일을 하나요?',
      '핀테크 산업 전망이 궁금합니다!',
      '케이스 스터디 면접은 어떻게 준비해야 하나요?',
      '금융권 취업 트렌드는 어떻게 변하고 있나요?',
      '전략기획 직무에 필요한 핵심 역량은 무엇인가요?'
    ]
  },
  '17': {
    name: '신동욱',
    avatar: '👨‍💻',
    field: '보안/인프라',
    company: 'NHN',
    experience: '입사 4년차',
    status: '온라인',
    description: 'NHN 보안팀에서 클라우드 인프라 보안을 담당합니다. 정보보호학과 출신으로 보안 직무 준비, 자격증 활용법 알려드립니다.',
    careers: [
      { title: 'NHN 보안팀', period: '2021 - 현재' },
      { title: '보안 컨설팅 업체', period: '2019 - 2021' }
    ],
    skills: ['네트워크 보안', '클라우드 보안', '모의해킹', 'Python'],
    specs: [
      { label: '학력', value: '고려대학교 정보보호학과 졸업' },
      { label: '자격증', value: '정보보안기사, CISSP' },
      { label: '어학', value: 'TOEIC 900점' },
      { label: '교육', value: 'AWS Security Specialty 자격' }
    ],
    questions: [
      'NHN 보안팀 취업 준비할 때 어떤 자격증이 도움 되나요?',
      '클라우드 인프라 보안은 어떤 기술을 다루나요?',
      '정보보안 vs 네트워크 보안, 어느 쪽이 전망이 좋을까요?',
      '모의해킹 경험은 어떻게 쌓을 수 있나요?',
      '보안 직무 면접에서 어떤 질문이 나왔나요?'
    ]
  },
  '18': {
    name: '유채원',
    avatar: '👩‍🎨',
    field: '콘텐츠 기획',
    company: 'HYBE',
    experience: '입사 2년차',
    status: '온라인',
    description: 'HYBE 콘텐츠 기획자입니다. 엔터 업계 취업 준비, 포트폴리오 구성, 크리에이티브 면접 대비법 등 리얼한 정보 공유해요.',
    careers: [
      { title: 'HYBE 콘텐츠 기획팀', period: '2023 - 현재' },
      { title: '엔터테인먼트사 인턴', period: '2022 - 2023' }
    ],
    skills: ['콘텐츠 기획', '영상 편집', 'SNS 운영', 'Adobe Premiere'],
    specs: [
      { label: '학력', value: '중앙대학교 영화학과 졸업' },
      { label: '수상', value: 'K-POP 콘텐츠 공모전 대상' },
      { label: '어학', value: 'TOEIC 910점, 일본어 JLPT N1' },
      { label: '기타', value: 'YouTube 크리에이터 (구독자 5만)' }
    ],
    questions: [
      'HYBE 콘텐츠 기획자는 어떤 일을 하나요?',
      '엔터 업계 취업 포트폴리오는 어떻게 준비해야 하나요?',
      '크리에이티브 면접에서 어떤 걸 평가하나요?',
      'K-POP 산업의 전망은 어떻게 보시나요?',
      '엔터업계 취업을 위해 어떤 준비가 필요한가요?'
    ]
  },
  '19': {
    name: '전승현',
    avatar: '👨‍🔧',
    field: '설비엔지니어',
    company: '삼성SDI',
    experience: '입사 3년차',
    status: '오프라인',
    description: '삼성SDI 배터리 설비 엔지니어입니다. 전기/전자 전공으로 설비직 준비하시는 분들, 기술직 면접 꿀팁 알려드릴게요.',
    careers: [
      { title: '삼성SDI 설비 엔지니어', period: '2022 - 현재' },
      { title: '삼성SDI 생산기술 인턴', period: '2021 - 2022' }
    ],
    skills: ['설비 관리', 'PLC 프로그래밍', '전기 회로', 'AutoCAD'],
    specs: [
      { label: '학력', value: '한양대학교 전기공학과 졸업' },
      { label: '자격증', value: '전기기사, 전자기사' },
      { label: '어학', value: 'TOEIC 880점' },
      { label: '교육', value: 'PLC 전문가 과정 이수' }
    ],
    questions: [
      '삼성SDI 설비 엔지니어 면접 준비 꿀팁이 있나요?',
      '전기공학 전공으로 배터리 업계 취업 가능한가요?',
      '기술직 면접에서 실무 지식을 어느 정도까지 물어보나요?',
      'PLC 프로그래밍은 어떻게 공부해야 하나요?',
      '설비 엔지니어의 커리어 패스는 어떻게 되나요?'
    ]
  },
  '20': {
    name: '권나연',
    avatar: '👩‍💼',
    field: '구매/SCM',
    company: 'SK텔레콤',
    experience: '입사 4년차',
    status: '온라인',
    description: 'SK텔레콤 구매팀에서 공급망 관리를 합니다. 협상력, 원가분석 능력 등 구매직에 필요한 역량과 준비법을 공유합니다.',
    careers: [
      { title: 'SK텔레콤 구매팀', period: '2021 - 현재' },
      { title: 'LG전자 SCM 인턴', period: '2020 - 2021' }
    ],
    skills: ['구매 관리', 'SCM', '협상', 'SAP', 'Excel'],
    specs: [
      { label: '학력', value: '이화여대 경영학과 졸업' },
      { label: '자격증', value: '국제무역사, 물류관리사' },
      { label: '어학', value: 'TOEIC 960점, 중국어 HSK 6급' },
      { label: '교육', value: 'CPIM (공인생산재고관리사)' }
    ],
    questions: [
      'SK텔레콤 구매직은 어떤 역량이 중요한가요?',
      '협상 스킬은 어떻게 키워야 하나요?',
      'SCM 관리 경험이 없어도 지원 가능한가요?',
      '구매 직무 면접은 어떻게 준비해야 하나요?',
      '글로벌 공급망 관리의 어려움은 무엇인가요?'
    ]
  }
};

export default function MentorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params?.id as string;
  const mentor = mentorData[mentorId];

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">멘토 프로필을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/chat')}
            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            멘토 찾기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="뒤로가기"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Profile</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8 pb-24">
        {/* 프로필 헤더 - 중앙 정렬 */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-lg mb-4 relative">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            {mentor.status === '온라인' && (
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{mentor.name}</h2>
          
          {/* 통계 */}
          <div className="flex gap-12 mt-6 w-full justify-center py-4 border-y border-gray-100">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">1,089</div>
              <div className="text-xs text-gray-500 mt-1">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">275</div>
              <div className="text-xs text-gray-500 mt-1">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">10</div>
              <div className="text-xs text-gray-500 mt-1">Events</div>
            </div>
          </div>
        </div>

        {/* About Me */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">About Me</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">
            {mentor.description}
          </p>
          <p className="text-gray-500 text-xs">
            {mentor.company} · {mentor.field} · {mentor.experience}
          </p>
        </div>

        {/* 경력 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">경력</h3>
          <div className="space-y-3">
            {mentor.careers.map((career, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900">{career.title}</p>
                <p className="text-gray-500 text-sm mt-1">{career.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 스펙 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">스펙</h3>
          <div className="space-y-3">
            {mentor.specs.map((spec, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-gray-400 text-sm flex-shrink-0 w-16">{spec.label}</span>
                <span className="text-gray-700 text-sm flex-1">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interest - 스킬을 태그 형식으로 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Interest</h3>
          <div className="flex flex-wrap gap-2">
            {mentor.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2">
                <span className="text-lg">{getSkillIcon(skill)}</span>
                <span className="text-sm text-gray-700">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 질문 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">추천 질문</h3>
          <div className="space-y-2">
            {mentor.questions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => router.push(`/chat/${mentorId}`)}
                className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <p className="text-gray-700 text-sm">{question}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push(`/chat/${mentorId}`)}
            className="w-full h-14 bg-green-600 text-white rounded-full font-bold text-base hover:bg-green-700 transition-all active:scale-95"
          >
            {mentor.name} 멘토님과 채팅하기
          </button>
        </div>
      </div>
    </div>
  );
}

// 스킬 아이콘 매핑 함수
function getSkillIcon(skill: string): string {
  const iconMap: { [key: string]: string } = {
    '마케팅': '📊',
    '브랜드': '✨',
    '트렌드': '📈',
    '분석': '🔍',
    '개발': '💻',
    'Android': '🤖',
    'Java': '☕',
    'Python': '🐍',
    '디자인': '🎨',
    'Figma': '🎨',
    '연구': '🔬',
    'HR': '👥',
    '채용': '👥',
    '영업': '💼',
    '데이터': '📊',
    'AI': '🤖',
    '보안': '🔒',
    '콘텐츠': '🎬',
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (skill.includes(key)) return icon;
  }
  return '⚡';
}
