📑 Product Requirements Document (PRD)
1. 제품 개요

제품명: Hotel Matching Model Visualization Dashboard

목적: 내부 property hotel과 외부 catalog hotel의 매칭 과정을 직관적으로 보여주는 시각화 대시보드 제공

핵심 가치: 복잡한 매칭 모델 과정을 누구나 쉽게 이해할 수 있도록 단계별 애니메이션 기반 시각화 제공

2. 모델 개요

모델의 목적:
내부 property hotel에 대해, 수백만 개 catalog 호텔 중 어떤 것과 일치하는지 찾는 것.

프로세스

Step 1: 후보군 선정

호텔 이름과 주소의 lexical + semantic 유사도를 활용해 Top 100개의 catalog 후보 선별

Step 2: 스코어링

후보군에 다양한 파생변수(feature)를 추가 후 머신러닝 모델을 통해 0~1 점수 부여

점수 기준: 소수점 4자리까지

Step 3: 최종 판단

0.98 이상 → 확정 (Confirmed)

0.3 이하 → 탈락 (Rejected)

0.3 ~ 0.98 사이 → LLM에게 질의 후 일부 확정 처리

3. 데이터 정의
3.1 Property (검색 대상)

supplier_type: EPS

supplier_property_seq: 8자리 랜덤 숫자

name: Hotel Forza Osaka Namba Dotonbori

address: Osaka Prefecture, Osaka, 3f 1-4-22 Dotonbori

3.2 Catalog 데이터 (500개)

컬럼: supplier_type, supplier_property_seq, name, address

supplier_type: {AGODA, EPS, DOTW, HB}

총 500개:

정답 데이터 (4개): supplier_type별 동일 name & address

유사 데이터 (96개): 이름·주소가 비슷한 호텔

무관 데이터 (400개): 유사도가 낮은 호텔

CSV 파일로 저장

4. 대시보드 기능 요구사항
4.1 화면 레이아웃

좌측 세로 버튼 패널

Step1 버튼

Step2 버튼

Step3 버튼

우측 메인 뷰 영역

Highcharts 기반 테이블·차트·애니메이션 표시

4.2 Step별 동작
Step 1: 후보군 선정

500개 catalog 중 100개만 선택

애니메이션: 전체 데이터에서 후보가 “하이라이트” 되며 걸러지는 모습

색상:

선택된 데이터: 파란색

탈락된 데이터: 회색

Step 2: 스코어링

후보 100개에 점수 (0~1, 소수점 4자리) 부여

점수 기반 오름차순 정렬 애니메이션

색상:

상위 (고득점): 초록색

중간: 노란색

하위: 빨간색

Step 3: 최종 판단

조건 기반 자동 처리:

≥0.98 → 확정 (파란색 굵은 테두리)

≤0.3 → 탈락 (회색 투명 처리)

0.3~0.98 → LLM 질의 처리 (점선 테두리 후 일부 확정)

애니메이션:

확정: 체크 아이콘 등장

탈락: X 아이콘 등장

LLM 질의 후 확정: 딜레이 후 파란색 변환

5. 기술 스펙
프론트엔드

Framework: VanillaJS

CSS: Bulma (UI 프레임워크)

차트/시각화: Highcharts (Scatter, Column, Table 차트 활용)

애니메이션: Highcharts 애니메이션 + CSS transition

백엔드

Framework: FastAPI

API 엔드포인트

/step1 → 후보군 100개 반환

/step2 → 스코어링 결과 반환

/step3 → 최종 판단 결과 반환

데이터: CSV 파일 로드 후 API에서 제공

배포

Docker 기반 컨테이너화 (선택 사항)

로컬/내부 서버 실행 가능

6. 성공 지표 (Success Metrics)

사용성: 모델 과정이 직관적으로 이해되는가?

시각 효과: Step별 애니메이션과 색상 구분이 명확한가?

재사용성: 다른 모델/데이터셋에도 쉽게 적용 가능한가?

7. 향후 확장

실제 embedding similarity, ML scoring, LLM 호출 API 연동

호텔명/주소 다국어 지원

검색 Property 동적 입력 지원

👉 지금 단계에서는 CSV 더미 데이터 500개 생성 → FastAPI 엔드포인트 제작 → VanillaJS + Highcharts 시각화 순서로 진행하면 됩니다.

원하시면 제가 바로 CSV 더미 데이터 생성 Python 코드부터 만들어드릴까요?
