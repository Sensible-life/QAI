# AI QA 사업계획서용 시장 조사

작성일: 2026-03-18  
대상 제품: "URL만 넣으면 AI가 실제 사용자처럼 클릭/입력하며 기능 장애를 찾아 리포트하는 QA 서비스"

## 1. 한 줄 결론

이 시장은 분명히 유망하다. 다만 "AI가 테스트를 대신한다"는 넓은 메시지로 들어가면 이미 경쟁이 매우 치열하다. 초기 창업팀이 파고들어야 할 가장 날카로운 진입점은 아래다.

- 타깃 고객: 전담 QA가 없는 스타트업, 소규모 SaaS 팀, 에이전시
- 타깃 문제: 로컬에서 잘 되던 기능이 배포 후 깨지는 문제
- 첫 제품 정의: 범용 테스트 플랫폼이 아니라 배포 전 기능 smoke QA agent
- 첫 핵심 가치: `이 배포 막아야 하나?`를 10분 안에 근거와 함께 답해주는 것

## 2. 심사위원이 가장 먼저 볼 포인트

심사위원은 보통 아래 질문을 본다.

1. 진짜로 아픈 문제인가?
2. 그 문제를 지금 돈 주고 해결하려는 고객이 누구인가?
3. 기존 테스트 자동화/QA SaaS와 뭐가 다른가?
4. LLM의 불안정성을 어떻게 통제할 것인가?
5. 반복 가능한 매출 구조가 가능한가?
6. 오픈소스를 쓴다면 방어력이 어디서 나오는가?

이 사업은 "AI가 사이트를 탐색한다" 자체보다, 아래 질문에 답할 수 있을 때 설득력이 생긴다.

- 왜 사람이 직접 테스트 시나리오를 짜는 현재 방식이 너무 비싼가?
- 왜 기존 Playwright 기반 자동화만으로는 초기 팀이 문제를 해결하지 못하는가?
- 왜 지금은 에이전트 기반 QA가 실제로 작동 가능한 수준까지 왔는가?
- 왜 이 제품이 broad QA suite가 아니라 release gate로 시작해야 하는가?

## 3. 시장이 유망한 이유

### 3-1. 품질 엔지니어링 시장 자체가 크다

- Everest Group 2025는 글로벌 Quality Engineering services 시장이 2024년에 약 750억~770억 달러 규모였다고 설명한다.
- Gartner의 2025 Market Guide 요약도 AI-augmented testing이 QE 시장을 재편하고 있다고 본다.
- 여러 시장 보고서는 소프트웨어 테스트 시장이 2025년 이후 두 자릿수 성장률로 커질 가능성을 제시한다. 수치 자체는 보고서마다 차이가 있으므로, 사업계획서에는 "정확한 TAM 수치"보다 "품질 엔지니어링 지출이 이미 매우 크고, AI 기반 전환이 시작됐다"는 메시지로 쓰는 편이 안전하다.

### 3-2. AI 코딩이 빨라질수록 QA 병목이 더 커진다

개발 속도는 LLM 도구로 빨라졌지만, 품질 검증은 여전히 아래에 묶여 있다.

- 사람이 테스트 시나리오를 설계해야 함
- 테스트 스크립트를 계속 유지보수해야 함
- flaky test를 사람 손으로 구분해야 함
- 배포 전후 실제 핵심 퍼널을 빠르게 검증하기 어려움

즉, AI 코딩 확산은 QA 시장을 줄이는 게 아니라 오히려 "검증 자동화" 수요를 키운다.

### 3-3. 경쟁사들이 이미 이 카테고리를 검증했다

현재 주요 플레이어는 모두 AI를 전면에 내세운다.

- QA Wolf: AI-native 서비스, 웹/모바일 E2E 커버리지 제공
- Momentic: plain English 기반 테스트 작성, self-healing locator, autonomous testing agent
- mabl: agentic tester, 자동 triage와 test creation agent 강조
- LambdaTest KaneAI: 자연어 기반 테스트 작성/진화, 다층 테스트, observability

이건 "시장 없음"이 아니라 "시장 있음, 다만 crowded"라는 신호다.

### 3-4. 현재 시장 페이지에서 읽히는 구체적 신호

2026년 3월 기준 공개 페이지들만 봐도 아래가 확인된다.

- QA Wolf는 홈페이지에서 `80% automated E2E test coverage`, `weeks not years`, `200 parallel 3 min tests`, `zero flakes`를 전면에 내세운다.
- Momentic은 메인 페이지에서 `plain English`, `self-healing locator`, `autonomous testing agent`, `99% fewer false positive alerts`, `8x increase in release cadence`를 강조한다.
- mabl은 `agentic tester`, `testing bottlenecks`, `generate tests 2x faster`, `accelerated innovation by 9x`를 말한다.
- KaneAI는 `GenAI-native testing agent`, `plan, author and evolve tests`, `3000+ combinations of browsers, OS and real devices`, `human in the loop`를 강조한다.

즉 시장은 이미 다음 방향으로 수렴 중이다.

- 자연어 기반 테스트 작성
- 자가 유지보수/자가 healing
- 실제 릴리스 워크플로우와 통합
- 사람 검수 또는 human-in-the-loop 장치

따라서 후발주자가 "AI로 테스트합니다"만 말하면 차별화가 거의 없다.

## 4. 경쟁 구도 정리

### 4-1. 대표 경쟁사 포지셔닝

| 플레이어 | 핵심 메시지 | 장점 | 약점/틈새 |
| --- | --- | --- | --- |
| QA Wolf | 서비스형 E2E 커버리지 | 사람이 검수하는 운영 모델, 실행 책임 강함 | 스타트업 초기에 쓰기엔 무겁고 high-touch |
| Momentic | 자연어 기반 테스트, 자가 유지 | 비개발자도 접근 쉬움 | 결국 테스트 운영 플랫폼 성격이 강함 |
| mabl | enterprise AI-native testing | 광범위한 기능, 기업용 운영에 강함 | 엔터프라이즈 중심, 초기 팀엔 과할 수 있음 |
| LambdaTest KaneAI | GenAI-native test agent + 광범위한 실행 인프라 | 디바이스/브라우저 커버리지 강함 | 포지셔닝이 넓어 초기 팀의 핵심 pain에 덜 직결될 수 있음 |
| Browserbase / Browser Use / Stagehand | 에이전트/브라우저 인프라 레이어 | 빠른 MVP 제작 가능 | 그대로는 고객 문제를 푸는 완제품이 아님 |

### 4-2. 우리가 정면승부하면 안 되는 영역

- "모든 테스트를 대체하는 범용 AI 테스트 플랫폼"
- "대기업용 통합 QA 스택"
- "브라우저/디바이스 조합 전부 지원"을 초기에 약속하는 전략

이 영역은 자본, 인프라, 영업 사이클 면에서 불리하다.

### 4-3. 우리가 파고들기 좋은 wedge

아래 조합이 가장 현실적이다.

- 제품 정의: 배포 전 기능 smoke QA
- 고객: QA 없는 스타트업 팀
- 사용 입력: URL + 우선순위 요청 1줄
- 출력: 장애 리포트 + 재현 경로 + 배포 판단

즉, "테스트 authoring"이 아니라 "배포 의사결정"이 제품 중심이어야 한다.

## 5. 왜 지금 구현 가능한가

### 5-1. 브라우저 에이전트 오픈소스가 충분히 빠르게 발전 중

오픈소스 레이어가 빠르게 좋아지고 있다.

- Browser Use는 오픈소스(MIT)이며 브라우저 에이전트 실행과 도구 확장을 제공한다.
- Browserbase는 Playwright, Puppeteer, Selenium, Stagehand 호환 브라우저 인프라를 제공하고, 대규모 세션 실행과 세션 관측 기능을 내세운다.
- Browserbase 문서는 Browser Use는 Python 기반, Stagehand는 TypeScript 쪽 대안이라고 설명한다.
- Browser Use GitHub는 2026년 3월 기준 약 `81.1k stars`와 `9.6k forks`로 매우 강한 개발자 관심을 보인다.
- Browserbase는 공식 사이트에서 `Spin up 1000s of browsers in milliseconds`, 세션 녹화, command logging, isolated sessions를 명시한다.

이 조합 덕분에 "브라우저를 실제로 조작하는 에이전트"를 밑바닥부터 직접 만들 필요가 없다.

### 5-2. 하지만 기술 우위는 모델이 아니라 평가/리포트 쪽에서 나온다

단순히 사이트를 클릭하는 기능은 곧 commodity가 된다. 방어력은 아래에서 생긴다.

- 어떤 시나리오를 우선 생성하는가
- 어떤 신호를 문제로 판정하는가
- false positive를 얼마나 줄이는가
- 재현 근거를 얼마나 설득력 있게 제시하는가
- 배포 판단을 얼마나 신뢰할 수 있게 해주는가

즉, 핵심 IP는 `테스트 계획 + 증거 구조화 + 장애 판정 + 리포트 UX`다.

## 6. 고객 세그먼트 우선순위

### 1순위: 전담 QA가 없는 스타트업 SaaS 팀

특징:

- 개발자가 직접 테스트를 겸함
- 스테이징/프리뷰 링크가 존재함
- 배포 빈도가 높고 회귀 버그가 자주 남
- 큰 테스트 플랫폼 도입 여력이 낮음

왜 좋은가:

- pain이 즉각적이다
- 도입 결정권자가 소수다
- 배포 전 자동 점검 메시지가 명확하다

### 2순위: 클라이언트 프로젝트를 반복 배포하는 에이전시

특징:

- 여러 사이트를 자주 릴리스함
- 운영 QA 인력이 제한적임
- 보고서 산출물이 중요함

왜 좋은가:

- URL 기반 다계정 운영과 리포트 자동화 니즈가 강하다

### 3순위: 커머스/예약/핀테크 등 고위험 퍼널 보유 팀

특징:

- 결제, 예약, 인증, 신청 같은 금전/전환 퍼널 존재
- 한 번의 장애 비용이 큼

왜 좋은가:

- ROI 설명이 쉽다
- "결제 위주로 봐줘" 같은 자연어 지시가 매우 직관적이다

## 7. 제품 방향 제안

### 7-1. 초반 제품의 핵심 입력/출력

입력:

- URL
- 환경 정보(staging / preview / production)
- 우선 점검 요청 1줄
- 필요시 테스트 계정

출력:

- 발견된 문제 목록
- 심각도
- 사용자 재현 경로
- 스크린샷/네트워크/콘솔/DOM 근거
- 배포 가능 여부

### 7-2. 꼭 필요한 첫 기능

- 핵심 퍼널 자동 추정
- 자연어 우선순위 반영
- 행동 로그 기반 보고서 생성
- 높은 확률의 기능 장애 탐지
- Slack/Jira/GitHub/Vercel 연동 여지

### 7-3. 일부러 나중으로 미뤄야 할 기능

- 광범위한 모바일 디바이스 매트릭스
- 모든 브라우저 조합 지원
- 복잡한 엔터프라이즈 권한 체계
- 완전한 no-code 테스트 플랫폼화

## 8. 심사위원 예상 질문 리스트

### 시장/고객

1. QA 자동화 툴이 이미 많은데 왜 또 필요한가?
2. 첫 고객은 누구고, 왜 당장 사는가?
3. UX 리서치형 합성 사용자와 무엇이 다른가?
4. 얼마나 자주 쓰이는 제품인가?

### 기술/품질

5. 에이전트가 잘못 판단하면 누가 책임지는가?
6. false positive를 어떻게 줄일 것인가?
7. 로그인/인증/캡차가 있는 실제 서비스도 다룰 수 있는가?
8. 테스트 시나리오를 AI가 자동 생성할 때 누락을 어떻게 줄일 것인가?

### 경쟁/방어력

9. Playwright와 뭐가 다른가?
10. QA Wolf, Momentic, mabl, KaneAI와 비교해 어디가 강한가?
11. 오픈소스를 가져다 쓰면 쉽게 복제되는 것 아닌가?

### 사업성

12. 돈은 어떤 방식으로 받을 것인가?
13. 고객이 첫 1개월 안에 체감하는 ROI는 무엇인가?
14. 서비스형으로 갈지, 플랫폼형으로 갈지 무엇이 맞는가?

## 9. 각 질문에 대한 권장 답변 방향

### "기존 테스트 도구와 뭐가 다른가?"

권장 답변:

기존 도구는 테스트를 작성하고 유지하게 만든다. 우리는 URL과 목표만 주면 고위험 사용자 플로우를 실제로 탐색하고, 배포 의사결정에 필요한 리포트를 바로 만든다.

### "LLM이 불안정한데 믿을 수 있나?"

권장 답변:

LLM이 최종 진실을 판정하는 구조가 아니다. 브라우저 액션 로그, 스크린샷, DOM 변화, 콘솔, 네트워크 응답을 먼저 수집하고, LLM은 그 증거를 구조화하고 우선순위를 매기는 역할에 제한한다.

### "오픈소스를 쓰면 방어력이 없지 않나?"

권장 답변:

브라우저 조작 레이어는 점점 commodity가 된다. 방어력은 고객별 시나리오 템플릿, 고위험 플로우 탐지, 실패 판정 품질, 배포 게이트 경험, 연동 데이터 축적에서 나온다.

### "왜 스타트업부터 공략하나?"

권장 답변:

대기업은 이미 테스트 스택과 QA 조직이 있다. 반면 스타트업은 pain은 크지만 인력이 부족해 도입이 빠르다. 첫 wedge는 여기서 만드는 게 맞다.

## 10. 수익화 제안

가장 현실적인 초기 수익화:

- 월 구독 + 실행 횟수 제한
- preview/staging URL 기준 per-run 과금
- 결제/로그인/예약 템플릿 등 고위험 플로우 팩 업셀

중기 확장:

- GitHub PR 자동 연동
- Slack release gate
- Jira 티켓 자동 생성
- 팀/프로젝트/환경별 분석 대시보드

장기 확장:

- 다중 브라우저/디바이스 실행
- API + UI 통합 시나리오
- enterprise 보안/권한/감사 로그

## 11. 최종 권고

이 사업은 할 만하다. 다만 아래처럼 정의해야 설득력이 강해진다.

- 나쁜 정의: "AI가 사람처럼 사이트를 써보며 QA해주는 툴"
- 좋은 정의: "배포 전 preview/staging URL에 대해, 로그인/결제 같은 핵심 기능이 실제로 동작하는지 자동 검증하고 배포 리스크를 리포트하는 QA release gate"

첫 3개월의 목표는 broad platform이 아니라 아래여야 한다.

1. URL + 지시문 입력
2. 핵심 퍼널 자동 생성
3. 실제 탐색 실행
4. 근거 기반 issue report 생성
5. 배포 가능/보류 판단 제공

이 다섯 개가 매끄럽게 되면, 그다음부터 플랫폼 확장이 가능하다.

## 12. 참고 소스

- QA Wolf: https://www.qawolf.com/
- Momentic: https://momentic.ai/
- mabl: https://www.mabl.com/
- LambdaTest KaneAI: https://www.lambdatest.com/kane-ai
- Browser Use GitHub: https://github.com/browser-use/browser-use
- Browserbase: https://www.browserbase.com/
- Browserbase docs: https://docs.browserbase.com/
- Gartner Market Guide for Quality Engineering Services (summary page): https://www.gartner.com/en/documents/6648734
- Everest Group Enterprise Quality Engineering Services PEAK Matrix 2025 licensed PDF summary: https://www.cognizant.com/en_us/services/documents/everest-group-enterprise-quality-engineering-services-peak-matrix-assessment-2025.pdf
