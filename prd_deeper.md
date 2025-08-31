📑 Product Requirements Document (Developer-Friendly Version)
1. 제품 개요

제품명: Hotel Matching Model Visualization Dashboard

목적: 호텔 매칭 모델의 복잡한 과정을 시각적으로 직관적으로 보여주는 데모 대시보드

대상 사용자: 모델 개발자, 데이터 분석가, 비즈니스 관계자

핵심 목표:

후보군 추출 → 스코어링 → 최종 판단 단계를 순차적으로 시각화

누구나 쉽게 이해할 수 있도록 버튼 클릭 + 애니메이션 기반

2. 시스템 개요
2.1 데이터 흐름

CSV Load

서버 기동 시 500개 catalog CSV를 메모리/DB에 로드

검색 대상 property 1개를 기준으로 step 진행

Step1 (후보군 선정)

500개 중 유사도 기반으로 100개를 API에서 반환

단순 시뮬레이션 → 랜덤 선택 or 사전 정의된 정답 데이터 포함

Step2 (스코어링)

후보군 100개에 점수(0~1, 소수점 4자리) 생성 후 반환

정렬된 상태로 제공

Step3 (최종 판단)

조건별 분류 후 JSON으로 반환

확정, 탈락, LLM 검증 그룹 포함

3. 데이터 정의
3.1 컬럼 스펙
컬럼명	타입	설명
supplier_type	string	{AGODA, EPS, DOTW, HB} 중 하나
supplier_property_seq	string	8자리 숫자 (e.g., "82374910")
name	string	호텔 이름
address	string	호텔 주소
3.2 데이터 샘플
supplier_type,supplier_property_seq,name,address
AGODA,12345678,Hotel Forza Osaka Namba Dotonbori,Osaka Prefecture, Osaka, 3f 1-4-22 Dotonbori
EPS,87654321,Hotel Forza Osaka Namba Dotonbori,Osaka Prefecture, Osaka, 3f 1-4-22 Dotonbori
DOTW,23456789,Hotel Forza Osaka Namba Dotonbori,Osaka Prefecture, Osaka, 3f 1-4-22 Dotonbori
HB,34567890,Hotel Forza Osaka Namba Dotonbori,Osaka Prefecture, Osaka, 3f 1-4-22 Dotonbori
...

4. API 스펙 (FastAPI)
4.1 엔드포인트

GET /step1
→ 후보군 100개 반환

{
  "step": 1,
  "candidates": [
    {"supplier_type": "AGODA", "seq": "12345678", "name": "...", "address": "..."},
    ...
  ]
}


GET /step2
→ 후보군 100개 + 스코어 반환 (정렬됨)

{
  "step": 2,
  "scored_candidates": [
    {"supplier_type": "AGODA", "seq": "12345678", "name": "...", "score": 0.9845},
    ...
  ]
}


GET /step3
→ 최종 결과 반환

{
  "step": 3,
  "results": {
    "confirmed": [...],
    "rejected": [...],
    "llm_review": [...]
  }
}

4.2 에러 핸들링

CSV 없거나 손상 → 500 Internal Server Error 반환

잘못된 step 호출 → 400 Bad Request

5. 프론트엔드 스펙
5.1 구조

VanillaJS + Bulma + Highcharts

HTML 기본 Layout:

aside: 좌측 세로 버튼 메뉴

main: 우측 메인 시각화 영역

Bulma Components: 버튼, 카드, 컬럼 레이아웃 활용

Highcharts: 테이블 + 차트(Scatterplot or Column)로 시각화

5.2 UI 플로우

Step1 버튼 클릭

API /step1 호출

500개 중 100개 하이라이트 (애니메이션: 색상 전환, fade-in/out)

Step2 버튼 클릭

API /step2 호출

100개 점수 + 정렬 애니메이션

색상 코드:

상위: 초록

중간: 노랑

하위: 빨강

Step3 버튼 클릭

API /step3 호출

확정: 체크 아이콘 + 파란색 강조

탈락: 회색 투명

LLM 검증: 점선 테두리 → 딜레이 후 일부 파란색 변환

6. 애니메이션/시각화 가이드

Step1: 원본 → 필터링된 후보군만 색상 강조

Step2: 점수 기반으로 위치가 위/아래로 슬라이드하며 정렬

Step3: 상태 전환 시 아이콘 등장 (✔, ✖) + 색상 변화

7. 기술 스택

백엔드: FastAPI, Pandas (CSV 로드/처리), Uvicorn

프론트엔드: VanillaJS, Bulma, Highcharts, Axios (API 통신)

테스트: Pytest (API 단위 테스트), Jest(프론트 단위테스트 - 선택)

배포: Docker (FastAPI + Nginx static 파일)

CI/CD: GitHub Actions (옵션)

8. 개발 방침

MVP 기준: 더미 데이터 기반 → 전체 프로세스 시뮬레이션

유지보수 용이성:

각 Step API는 독립적으로 호출 가능하게 설계

프론트는 상태(state)를 currentStep으로 관리

확장성:

실제 Embedding/ML/LLM API로 교체할 수 있도록 모듈화

코드 컨벤션:

Python: PEP8, Black formatter

JS: ESLint, Prettier

9. 성공 기준 (개발자 관점)

Step별 API 호출 시 프론트가 시각적으로 자연스럽게 갱신

모든 애니메이션/색상 구분이 명확히 작동

CSV 더미 데이터 기반으로 실제 모델과 동일한 흐름을 체험 가능