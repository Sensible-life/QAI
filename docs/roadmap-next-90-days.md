# QAI Next 90 Days Roadmap

작성일: 2026-03-23

## 목표

다음 90일의 목표는 QAI를 `동작하는 데모`에서 `반복 사용 가능한 release gate 제품`으로 끌어올리는 것이다.

핵심 방향은 아래 3가지다.

1. 실행 구조를 안정화한다.
2. 결과 신뢰도를 높인다.
3. 실제 팀 워크플로우에 붙인다.

## Month 1: Execution Foundation

### 목표

- 서버 요청 처리와 브라우저 실행 경로 분리
- run lifecycle 가시성 확보
- 외부 사이트 대상 실패 원인 파악성 개선

### 작업 항목

- in-process `RunQueue` 도입
- `run create`와 `run process` 경로 분리
- queue snapshot API 추가
- 브라우저 실행 실패 메시지 정교화
- artifacts / run logs 구조 정리

### 완료 기준

- 동시에 여러 run 요청이 들어와도 서버는 즉시 run id 반환
- 브라우저 실행은 queue 순서대로 수행
- queue 상태를 API로 확인 가능

## Month 2: Trust and Verification

### 목표

- false positive 감소
- 요청 focus와 결과 해석 연결 강화
- finding 우선순위와 verdict 설명 고도화

### 작업 항목

- verifier를 재실행 기반 구조로 확장
- finding type 분류 추가
- severity/confidence/focus match 복합 점수화
- verdict reason 템플릿 고도화
- regression diff 초안 도입

### 완료 기준

- high severity finding에 대해 재검증 로직 존재
- report에 왜 hold/review/pass가 나왔는지 설명 가능
- focus 요청과 실제 finding 연결이 명확히 드러남

## Month 3: Workflow Integration

### 목표

- 실제 배포 프로세스에 연결
- 팀 단위 반복 사용 가능성 확보
- 초기 유료 검증 준비

### 작업 항목

- GitHub Preview / Vercel preview 연동
- Slack 알림 연동
- 프로젝트/환경 단위 run grouping
- 반복 실행 이력과 최근 장애 비교
- 요금제/usage metering 초안 반영

### 완료 기준

- preview URL 생성 후 자동 run 시작 가능
- 결과를 Slack으로 공유 가능
- 프로젝트 단위로 run history 확인 가능

## 구현 우선순위

1. Queue + worker separation
2. Re-verification
3. External site generalization
4. Integration layer
5. Project model and billing hooks

## 현재 바로 진행 중인 항목

2026-03-23 기준 첫 번째 단계로 `RunQueue`를 도입해 HTTP 요청과 브라우저 실행 경로를 분리했다. 이는 이후 worker 분리와 DB 전환의 전단계 역할을 한다.
