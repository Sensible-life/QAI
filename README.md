# QAI

QAI는 `preview/staging URL`의 핵심 퍼널을 실제 브라우저에서 실행하고, 배포를 막아야 할 기능 장애를 근거와 함께 리포트하는 `QA release gate` 데모 프로젝트입니다.

## 한 줄 요약

- 입력: URL, 테스트 계정, 환경, 퍼널
- 실행: Discovery -> Planning -> Execution -> Evidence -> Judge -> Verify -> Report
- 출력: 발견된 이슈, 스크린샷/네트워크/콘솔 증거, `배포 가능 / 보류` 판단

## 프로젝트 목적

이 프로젝트는 범용 테스트 자동화 플랫폼을 만드는 것이 아니라, 아래 문제를 겨냥합니다.

- 로컬에서는 되는데 배포 후 핵심 기능이 깨지는 문제
- 전담 QA가 없어 시나리오를 매번 사람이 써야 하는 문제
- 배포 직전에 `지금 막아야 하나?`를 빠르게 판단하기 어려운 문제

즉 QAI의 포지셔닝은 `AI 테스트 작성기`가 아니라 `배포 전 핵심 퍼널 검증기`입니다.

## 현재 v1 범위

- 지원 퍼널
  - `login`
  - `checkout`
  - `form`
- 실행 환경
  - `preview`
  - `staging`
  - `production` 입력은 받지만, 현재 데모는 preview/staging 사용을 전제로 설계
- 산출물
  - finding 목록
  - step별 evidence
  - 실행 로그
  - 최종 verdict

## Agent Workflow

QAI v1은 `완전 자유형 agent`가 아니라 `제약된 agent workflow`입니다.

1. `Discovery Agent`
   진입 페이지의 제목, 텍스트, 링크, CTA, form 구조를 수집합니다.
2. `Planner Agent`
   선택한 퍼널에 맞는 실행 계획을 생성합니다.
3. `Browser Executor`
   Playwright로 브라우저를 조작하고 step을 수행합니다.
4. `Evidence Collector`
   스크린샷, 콘솔 에러, 응답 오류, 요청 실패를 누적 수집합니다.
5. `Judge Agent`
   evidence를 finding으로 승격합니다.
6. `Verifier`
   high severity 또는 high confidence finding을 검증 상태로 올립니다.
7. `Reporter Agent`
   최종 리포트와 배포 판단을 생성합니다.

핵심 원칙은 다음과 같습니다.

- 저수준 브라우저 액션은 deterministic하게 실행
- 상위 계획과 판정만 agentic하게 처리
- high severity finding은 검증 단계를 거쳐서 최종 리포트에 반영

## 파일 구조

### 루트

- [index.html](C:\Users\ChoSungwon\Desktop\dev\QAI\index.html)
  메인 제품 데모 화면
- [styles.css](C:\Users\ChoSungwon\Desktop\dev\QAI\styles.css)
  메인 제품 데모 스타일
- [package.json](C:\Users\ChoSungwon\Desktop\dev\QAI\package.json)
  실행 스크립트와 의존성 정의
- [tsconfig.json](C:\Users\ChoSungwon\Desktop\dev\QAI\tsconfig.json)
  서버/코어 TypeScript 설정
- [tsconfig.client.json](C:\Users\ChoSungwon\Desktop\dev\QAI\tsconfig.client.json)
  클라이언트 번들용 TypeScript 설정

### `src/`

- [src/server.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\server.ts)
  정적 파일과 API를 함께 서빙하는 엔트리 서버

#### `src/domain/`

- [src/domain/contracts.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\domain\contracts.ts)
  전역 타입 계약
- [src/domain/schemas.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\domain\schemas.ts)
  API 입력 검증 스키마

#### `src/orchestrator/`

- [src/orchestrator/run-orchestrator.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\orchestrator\run-orchestrator.ts)
  전체 agent workflow를 순서대로 실행하는 상태 머신

#### `src/agents/`

- [src/agents/discovery-agent.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\agents\discovery-agent.ts)
  진입 페이지 구조 수집
- [src/agents/planner-agent.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\agents\planner-agent.ts)
  퍼널별 실행 계획 생성
- [src/agents/judge-agent.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\agents\judge-agent.ts)
  evidence를 finding으로 판정
- [src/agents/reporter-agent.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\agents\reporter-agent.ts)
  최종 리포트 생성

#### `src/funnels/`

- [src/funnels/checkout-funnel.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\funnels\checkout-funnel.ts)
  checkout step 정의
- [src/funnels/login-funnel.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\funnels\login-funnel.ts)
  login step 정의
- [src/funnels/form-funnel.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\funnels\form-funnel.ts)
  form step 정의

#### `src/executor/`

- [src/executor/browser-executor.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\executor\browser-executor.ts)
  Playwright 실행기와 퍼널별 step 수행 로직

#### `src/evidence/`

- [src/evidence/artifact-store.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\evidence\artifact-store.ts)
  스크린샷 저장 경로 관리
- [src/evidence/evidence-collector.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\evidence\evidence-collector.ts)
  콘솔/응답/요청 실패 수집

#### `src/store/`

- [src/store/run-store.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\store\run-store.ts)
  실행 이력을 `data/runs.json`에 저장

#### `src/verification/`

- [src/verification/verifier.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\verification\verifier.ts)
  finding 검증 여부 결정

#### `src/client/`

- [src/client/app.ts](C:\Users\ChoSungwon\Desktop\dev\QAI\src\client\app.ts)
  브라우저 UI 로직, polling, 결과 렌더링

### `sample-app/`

- [sample-app/index.html](C:\Users\ChoSungwon\Desktop\dev\QAI\sample-app\index.html)
  QAI가 탐색할 데모 앱 메인 화면
- [sample-app/login.html](C:\Users\ChoSungwon\Desktop\dev\QAI\sample-app\login.html)
  로그인 버그 재현용 페이지
- [sample-app/checkout.html](C:\Users\ChoSungwon\Desktop\dev\QAI\sample-app\checkout.html)
  체크아웃 버그 재현용 페이지
- [sample-app/contact.html](C:\Users\ChoSungwon\Desktop\dev\QAI\sample-app\contact.html)
  폼 피드백 버그 재현용 페이지
- [sample-app/styles.css](C:\Users\ChoSungwon\Desktop\dev\QAI\sample-app\styles.css)
  샘플 앱 스타일

### 실행 산출물

- `public/`
  클라이언트 빌드 결과
- `artifacts/`
  step별 스크린샷
- `data/runs.json`
  최근 실행 이력 저장 파일

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 타입 검사

```bash
npm run typecheck
```

### 3. 실행

```bash
npm start
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:3000
```

## 데모 사용 방법

1. 메인 화면에서 기본 샘플 URL을 그대로 사용합니다.
2. 테스트 계정과 퍼널을 선택합니다.
3. `Start agentic run`을 누릅니다.
4. 실행 로그, evidence, findings, verdict를 확인합니다.

샘플 앱은 의도적으로 아래 버그를 포함합니다.

- `login`
  세션 생성 실패, 복구 링크 오류
- `checkout`
  결제 API 500, validation 노출 실패, policy 링크 오류
- `form`
  성공 토스트가 너무 빨리 사라짐

## API

### `POST /api/test-runs`

run 생성 요청

예시:

```json
{
  "url": "http://localhost:3000/sample-app/",
  "account": "qa@sample.app",
  "password": "demo1234!",
  "environment": "staging",
  "funnel": "checkout"
}
```

### `GET /api/test-runs`

최근 실행 목록 조회

### `GET /api/test-runs/:id`

특정 실행 상세 조회

## 현재 한계

- sample-app 전용 로직이 일부 포함되어 있음
- verifier가 아직 간단한 규칙 기반임
- run queue, 인증, 멀티 유저 처리가 없음
- 실제 외부 사이트에 대한 discovery/fallback 일반화는 아직 약함

## 다음 확장 방향

- sample-app 전용 분기 축소
- 실제 preview URL에 대한 fallback 강화
- GitHub / Vercel / Slack 연동
- run queue 및 worker 분리
- finding 검증 규칙 강화
