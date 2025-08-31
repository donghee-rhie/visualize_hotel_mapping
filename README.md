# Hotel Matching Model Visualization Dashboard

호텔 매칭 모델의 과정을 직관적으로 시각화하는 대시보드입니다.

## 📋 프로젝트 개요

내부 property hotel과 외부 catalog hotel의 매칭 과정을 3단계로 나누어 애니메이션 기반으로 시각화합니다:

1. **Step 1: 후보군 선정** - 500개 카탈로그 중 유사도 기반 Top 100개 선별
2. **Step 2: 스코어링** - ML 모델을 통한 점수 부여 및 정렬
3. **Step 3: 최종 판단** - 임계값 기반 자동 판단 + LLM 질의

## 🛠 기술 스택

- **백엔드**: FastAPI, Python 3.11
- **프론트엔드**: VanillaJS, Bulma CSS, Highcharts
- **데이터**: CSV 파일 (더미 데이터)

## 🚀 설치 및 실행

### 1. 환경 설정

```bash
# Conda 환경 생성
conda create -n hotel_matching python=3.11 -y
conda activate hotel_matching

# 패키지 설치
pip install fastapi uvicorn pandas numpy pydantic python-multipart
```

### 2. 데이터 생성

```bash
# 더미 데이터 생성 (Property 1개 + Catalog 500개)
python generate_dummy_data.py
```

### 3. 서버 실행

```bash
# 백엔드 서버 시작
python start_server.py
```

### 4. 웹 접속

브라우저에서 접속:
- **메인 대시보드**: http://localhost:8000/static/index.html
- **API 문서**: http://localhost:8000/docs

## 🎯 사용법

1. **데이터 확인**: 좌측 패널에서 검색 대상 Property 정보 확인
2. **Step 1 실행**: "Step 1: 후보군 선정" 버튼 클릭
   - 500개 중 100개 후보 선정 과정을 시각화
3. **Step 2 실행**: "Step 2: 스코어링" 버튼 클릭
   - ML 점수 기반 정렬 과정을 막대 차트로 시각화
4. **Step 3 실행**: "Step 3: 최종 판단" 버튼 클릭
   - 최종 매칭 결과를 도넛 차트로 시각화

## 📊 시각화 특징

### Step 1: 후보군 선정
- **차트 타입**: 산점도 (Scatter Plot)
- **색상 구분**: 
  - 파란색: 선택된 후보
  - 회색: 제외된 데이터
  - 빨간색: 정답 데이터

### Step 2: 스코어링
- **차트 타입**: 막대 차트 (Column Chart)
- **색상 구분**:
  - 초록색: 높은 점수 (≥0.7)
  - 주황색: 중간 점수 (0.3-0.7)
  - 빨간색: 낮은 점수 (<0.3)

### Step 3: 최종 판단
- **차트 타입**: 도넛 차트 (Donut Chart)
- **분류**:
  - 자동 확정 (≥0.98)
  - LLM 확정
  - LLM 검토 대상
  - 탈락 (≤0.3)

## 🔧 API 엔드포인트

- `GET /property` - 검색 대상 Property 조회
- `GET /catalog` - 전체 Catalog 데이터 조회 (500개)
- `POST /step1` - Step 1: 후보군 선정 실행
- `POST /step2` - Step 2: 스코어링 실행
- `POST /step3` - Step 3: 최종 판단 실행
- `GET /stats` - 통계 정보 조회

## 📁 프로젝트 구조

```
visualize/
├── backend.py              # FastAPI 백엔드 서버
├── start_server.py         # 서버 시작 스크립트
├── generate_dummy_data.py  # 더미 데이터 생성
├── property_data.csv       # Property 데이터 (1개)
├── catalog_data.csv        # Catalog 데이터 (500개)
├── requirements.txt        # Python 의존성
├── frontend/
│   ├── index.html         # 메인 HTML
│   ├── app.js            # JavaScript 애플리케이션
│   └── style.css         # 스타일시트
└── README.md             # 이 파일
```

## 🎨 주요 기능

### 애니메이션 효과
- 단계별 부드러운 전환 애니메이션
- 차트 타입 변경 시 자연스러운 모핑
- 색상 변화 및 정렬 애니메이션

### 인터랙티브 요소
- 호버 시 상세 정보 툴팁
- 단계별 진행 상태 표시
- 리셋 기능으로 처음부터 재시작 가능

### 반응형 디자인
- 모바일 및 태블릿 지원
- 다양한 화면 크기 대응

## 🔍 데이터 구조

### Property 데이터
```json
{
  "supplier_type": "EPS",
  "supplier_property_seq": "70147282",
  "name": "Hotel Forza Osaka Namba Dotonbori",
  "address": "Osaka Prefecture, Osaka, 3f 1-4-22 Dotonbori"
}
```

### Catalog 데이터
```json
{
  "supplier_type": "AGODA",
  "supplier_property_seq": "54555604",
  "name": "Hotel Metropolitan Asakusa",
  "address": "Tokyo Prefecture, Tokyo, 1-2-3 Asakusa",
  "similarity_score": 0.8532,
  "ml_score": 0.7245,
  "is_correct": false
}
```

## 🐛 문제 해결

### 서버가 시작되지 않는 경우
```bash
# 포트 8000이 사용 중인지 확인
lsof -i :8000

# 기존 프로세스 종료
pkill -f "python"

# 다시 시작
python start_server.py
```

### 데이터가 로드되지 않는 경우
```bash
# CSV 파일 재생성
python generate_dummy_data.py

# 파일 존재 확인
ls -la *.csv
```

## 📈 향후 확장 계획

- 실제 embedding similarity API 연동
- ML 모델 API 연동
- LLM API 연동
- 다국어 지원
- 실시간 데이터 연동
- 사용자 정의 임계값 설정

## 🤝 기여

이슈나 개선사항이 있으시면 언제든 제안해 주세요!

---

**Hotel Matching Model Visualization Dashboard v1.0.0**
# visualize_hotel_mapping
