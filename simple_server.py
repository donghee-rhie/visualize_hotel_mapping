#!/usr/bin/env python3
"""
Hotel Matching Visualization - Simple Server
간단한 FastAPI 서버로 박스 레이아웃 테스트
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import json
import random
from decimal import Decimal, ROUND_HALF_UP

app = FastAPI(title="Hotel Matching Visualization", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# 전역 데이터
property_data = None
catalog_data = None

def load_data():
    """CSV 데이터 로드"""
    global property_data, catalog_data
    
    try:
        property_df = pd.read_csv('property_data.csv')
        catalog_df = pd.read_csv('catalog_data.csv')
        
        property_data = property_df.iloc[0].to_dict()
        catalog_data = catalog_df.to_dict('records')
        
        print(f"✅ 데이터 로드 완료: Property 1개, Catalog {len(catalog_data)}개")
        return True
        
    except Exception as e:
        print(f"❌ 데이터 로드 실패: {e}")
        return False

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "Hotel Matching Visualization API", "version": "1.0.0"}

@app.get("/property")
async def get_property():
    """검색 대상 Property 데이터 조회"""
    if not property_data:
        if not load_data():
            raise HTTPException(status_code=500, detail="Data loading failed")
    
    return {
        "supplier_type": property_data["supplier_type"],
        "supplier_property_seq": str(property_data["supplier_property_seq"]),
        "name": property_data["name"],
        "address": property_data["address"]
    }

@app.get("/catalog")
async def get_catalog():
    """초기 Catalog 후보군 조회 (랜덤 배치, 정답 4개는 반드시 포함)"""
    if not catalog_data:
        if not load_data():
            raise HTTPException(status_code=500, detail="Data loading failed")
    
    # 정답 4개 강제 포함 + 유사도 상위로 채우기 (총 36개)
    correct = [row for row in catalog_data if bool(row.get('is_correct'))]
    sorted_data = sorted(catalog_data, key=lambda x: x['similarity_score'], reverse=True)
    top = []
    # 우선 정답 추가
    seen = set()
    for row in correct:
        key = (row['supplier_type'], row['supplier_property_seq'])
        if key not in seen:
            top.append(row)
            seen.add(key)
    # 나머지 유사도 상위로 채우기
    for row in sorted_data:
        key = (row['supplier_type'], row['supplier_property_seq'])
        if key in seen:
            continue
        top.append(row)
        seen.add(key)
        if len(top) >= 36:
            break
    # 초기 배치는 랜덤
    top_36 = top[:36]
    random.shuffle(top_36)
    
    items = []
    for item in top_36:
        items.append({
            "supplier_type": item["supplier_type"],
            "supplier_property_seq": str(item["supplier_property_seq"]),
            "name": item["name"],
            "address": item["address"],
            "similarity_score": float(item["similarity_score"]),
            "ml_score": float(item["ml_score"]),
            "is_correct": bool(item["is_correct"])
        })
    
    return {
        "message": "초기 카탈로그 데이터 (6x6 그리드)",
        "total_count": 36,
        "items": items
    }

@app.post("/step1")
async def step1():
    """Step 1: 1차 후보군 선별 (정답 4개 반드시 포함)"""
    if not catalog_data:
        if not load_data():
            raise HTTPException(status_code=500, detail="Data loading failed")
    
    # 36 후보군 구성 (정답 4개 포함)
    correct = [row for row in catalog_data if bool(row.get('is_correct'))]
    sorted_data = sorted(catalog_data, key=lambda x: x['similarity_score'], reverse=True)
    pool = []
    seen = set()
    for r in correct:
        key = (r['supplier_type'], r['supplier_property_seq'])
        if key not in seen:
            pool.append(r); seen.add(key)
    for r in sorted_data:
        key = (r['supplier_type'], r['supplier_property_seq'])
        if key in seen:
            continue
        pool.append(r); seen.add(key)
        if len(pool) >= 36:
            break
    # 12개 선별: 정답 4개 + 유사도 상위로 채우기
    top_12 = []
    seen12 = set()
    for r in correct:
        key = (r['supplier_type'], r['supplier_property_seq'])
        if key not in seen12 and r in pool:
            top_12.append(r); seen12.add(key)
    for r in pool:
        key = (r['supplier_type'], r['supplier_property_seq'])
        if key in seen12:
            continue
        top_12.append(r); seen12.add(key)
        if len(top_12) >= 12:
            break
    
    selected_items = []
    for item in top_12:
        selected_items.append({
            "supplier_type": item["supplier_type"],
            "supplier_property_seq": str(item["supplier_property_seq"]),
            "name": item["name"],
            "address": item["address"],
            "similarity_score": float(item["similarity_score"]),
            "ml_score": float(item["ml_score"]),
            "is_correct": bool(item["is_correct"])
        })
    
    return {
        "message": "완료 : Catalog 중 1차 후보군 산정",
        "selected_count": 12,
        "total_count": 36,
        "selected_items": selected_items
    }

@app.post("/step2")
async def step2():
    """Step 2: 12개 생존 박스 정렬 (최종 확정은 Step 3에서)"""
    if not catalog_data:
        if not load_data():
            raise HTTPException(status_code=500, detail="Data loading failed")
    
    # 상위 36개 중 12개를 ML 점수로 정렬
    sorted_data = sorted(catalog_data, key=lambda x: x['similarity_score'], reverse=True)
    top_36 = sorted_data[:36]
    top_12 = top_36[:12]
    ml_sorted = sorted(top_12, key=lambda x: x['ml_score'], reverse=True)
    
    ranked_items = []
    for rank, item in enumerate(ml_sorted, 1):
        ranked_items.append({
            "supplier_type": item["supplier_type"],
            "supplier_property_seq": str(item["supplier_property_seq"]),
            "name": item["name"],
            "address": item["address"],
            "similarity_score": float(item["similarity_score"]),
            "ml_score": float(item["ml_score"]),
            "is_correct": bool(item["is_correct"]),
            "rank": rank
        })
    
    return {
        "message": "Step 2 완료 : ML모델을 활용한 유사도 Scoring 완료",
        "ranked_items": ranked_items
    }

@app.post("/step3")
async def step3():
    """Step 3: LLM 검증대상 선정 (상태만 부여)"""
    if not catalog_data:
        if not load_data():
            raise HTTPException(status_code=500, detail="Data loading failed")
    
    sorted_data = sorted(catalog_data, key=lambda x: x['similarity_score'], reverse=True)
    top_36 = sorted_data[:36]
    top_12 = sorted(top_36[:12], key=lambda x: x['ml_score'], reverse=True)
    
    confirmed_items = []
    rejected_items = []
    llm_items = []
    
    # 1) 임계값 기반 자동 처리
    for item in top_12:
        data = {
            "supplier_type": item["supplier_type"],
            "supplier_property_seq": str(item["supplier_property_seq"]),
            "name": item["name"],
            "address": item["address"],
            "similarity_score": float(item["similarity_score"]),
            "ml_score": float(item["ml_score"]),
            "is_correct": bool(item["is_correct"])
        }
        # UI와 동일하게 소수점 3자리 반올림 기준으로 임계값 비교
        score = float(item["ml_score"])
        rounded = float(Decimal(str(score)).quantize(Decimal('0.001'), rounding=ROUND_HALF_UP))
        if rounded >= 0.98:
            confirmed_items.append(data)
        elif rounded <= 0.3:
            rejected_items.append(data)
        else:
            llm_items.append(data)
    
    return {
        "message": "Step 3 완료: LLM 검증대상 선정",
        "confirmed_items": confirmed_items,
        "rejected_items": rejected_items,
        "llm_items": llm_items
    }

@app.post("/step4")
async def step4():
    """Step 4: 최종 선별 (정답 4개가 최종 확정)"""
    if not catalog_data:
        if not load_data():
            raise HTTPException(status_code=500, detail="Data loading failed")
    sorted_data = sorted(catalog_data, key=lambda x: x['similarity_score'], reverse=True)
    top_36 = []
    # 재사용: 정답 포함 36 구성
    correct = [row for row in catalog_data if bool(row.get('is_correct'))]
    seen=set()
    for r in correct:
        k=(r['supplier_type'], r['supplier_property_seq'])
        if k not in seen:
            top_36.append(r); seen.add(k)
    for r in sorted_data:
        k=(r['supplier_type'], r['supplier_property_seq'])
        if k in seen: continue
        top_36.append(r); seen.add(k)
        if len(top_36)>=36: break
    top_12 = sorted(top_36[:12], key=lambda x: x['ml_score'], reverse=True)
    
    confirmed_items = []
    rejected_items = []
    llm_items = []
    llm_confirmed_items = []
    
    for item in top_12:
        data = {
            "supplier_type": item["supplier_type"],
            "supplier_property_seq": str(item["supplier_property_seq"]),
            "name": item["name"],
            "address": item["address"],
            "similarity_score": float(item["similarity_score"]),
            "ml_score": float(item["ml_score"]),
            "is_correct": bool(item["is_correct"])
        }
        if data["is_correct"]:
            llm_confirmed_items.append(data)
        else:
            rejected_items.append(data)
    
    # 최종 확정은 정답 4개만
    confirmed_items = llm_confirmed_items.copy()
    
    return {
        "message": "Step 4 완료: 최종 선별",
        "confirmed_items": confirmed_items,
        "rejected_items": rejected_items,
        "llm_items": llm_items,
        "llm_confirmed_items": llm_confirmed_items
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Simple Hotel Matching Server 시작...")
    load_data()
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="info")
