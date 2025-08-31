#!/usr/bin/env python3
"""
Hotel Matching Model 시각화를 위한 더미 데이터 생성기
"""

import pandas as pd
import random
import numpy as np
from typing import List, Dict

def generate_property_data() -> Dict:
    """검색 대상 Property 데이터 생성"""
    return {
        'supplier_type': 'EPS',
        'supplier_property_seq': f'{random.randint(10000000, 99999999)}',
        'name': 'Hotel Forza Osaka Namba Dotonbori',
        'address': 'Osaka Prefecture, Osaka, 3f 1-4-22 Dotonbori'
    }

def generate_correct_answers(property_data: Dict) -> List[Dict]:
    """정답 데이터 4개 생성 (각 supplier_type별 동일 name & address)"""
    supplier_types = ['AGODA', 'EPS', 'DOTW', 'HB']
    correct_data = []
    
    for supplier_type in supplier_types:
        correct_data.append({
            'supplier_type': supplier_type,
            'supplier_property_seq': f'{random.randint(10000000, 99999999)}',
            'name': property_data['name'],
            'address': property_data['address'],
            'is_correct': True,
            'similarity_score': round(random.uniform(0.95, 1.0), 4)
        })
    
    return correct_data

def generate_similar_data(property_data: Dict, count: int = 96) -> List[Dict]:
    """유사 데이터 96개 생성"""
    supplier_types = ['AGODA', 'EPS', 'DOTW', 'HB']
    similar_data = []
    
    # 이름 변형 패턴
    name_variations = [
        'Hotel Forza Osaka Namba',
        'Forza Hotel Osaka Namba Dotonbori',
        'Hotel Forza Namba Dotonbori',
        'Osaka Namba Dotonbori Hotel Forza',
        'Hotel Forza Osaka Dotonbori',
        'Forza Osaka Namba Hotel',
        'Hotel Osaka Namba Dotonbori',
        'Namba Dotonbori Hotel Forza'
    ]
    
    # 주소 변형 패턴
    address_variations = [
        'Osaka Prefecture, Osaka, 1-4-22 Dotonbori',
        'Osaka, 3f 1-4-22 Dotonbori',
        'Osaka Prefecture, Osaka, 3-1-4-22 Dotonbori',
        'Osaka Prefecture, Namba, 3f 1-4-22 Dotonbori',
        'Osaka Prefecture, Osaka, 1-4 Dotonbori',
        'Osaka, Namba, 1-4-22 Dotonbori',
        'Osaka Prefecture, Osaka, 3f 1-4-20 Dotonbori'
    ]
    
    for i in range(count):
        similar_data.append({
            'supplier_type': random.choice(supplier_types),
            'supplier_property_seq': f'{random.randint(10000000, 99999999)}',
            'name': random.choice(name_variations),
            'address': random.choice(address_variations),
            'is_correct': False,
            'similarity_score': round(random.uniform(0.3, 0.95), 4)
        })
    
    return similar_data

def generate_unrelated_data(count: int = 400) -> List[Dict]:
    """무관 데이터 400개 생성"""
    supplier_types = ['AGODA', 'EPS', 'DOTW', 'HB']
    unrelated_data = []
    
    # 일본 주요 도시들
    cities = ['Tokyo', 'Yokohama', 'Kyoto', 'Kobe', 'Fukuoka', 'Sapporo', 'Sendai', 'Hiroshima', 'Nagoya']
    
    # 다양한 호텔 이름 패턴
    hotel_prefixes = ['Hotel', 'Grand Hotel', 'Resort', 'Inn', 'Hostel', 'Ryokan', 'Lodge']
    hotel_names = ['Sakura', 'Metropolitan', 'Royal', 'Imperial', 'Central', 'Bay', 'Garden', 'Plaza', 'Tower', 'Palace']
    hotel_suffixes = ['Tokyo', 'Shibuya', 'Shinjuku', 'Ginza', 'Akasaka', 'Roppongi', 'Asakusa', 'Harajuku']
    
    for i in range(count):
        city = random.choice(cities)
        prefix = random.choice(hotel_prefixes)
        name = random.choice(hotel_names)
        suffix = random.choice(hotel_suffixes)
        
        hotel_name = f"{prefix} {name} {suffix}"
        address = f"{city} Prefecture, {city}, {random.randint(1, 10)}-{random.randint(1, 20)}-{random.randint(1, 30)} {random.choice(['Chuo', 'Minato', 'Shibuya', 'Shinjuku'])}"
        
        unrelated_data.append({
            'supplier_type': random.choice(supplier_types),
            'supplier_property_seq': f'{random.randint(10000000, 99999999)}',
            'name': hotel_name,
            'address': address,
            'is_correct': False,
            'similarity_score': round(random.uniform(0.0, 0.3), 4)
        })
    
    return unrelated_data

def generate_ml_scores(catalog_data: List[Dict]) -> List[Dict]:
    """ML 모델 점수를 시뮬레이션하여 추가"""
    for item in catalog_data:
        if item['is_correct']:
            # 정답 데이터는 높은 점수
            item['ml_score'] = round(random.uniform(0.95, 1.0), 4)
        elif item['similarity_score'] > 0.3:
            # 유사 데이터는 중간 점수
            item['ml_score'] = round(random.uniform(0.2, 0.9), 4)
        else:
            # 무관 데이터는 낮은 점수
            item['ml_score'] = round(random.uniform(0.0, 0.4), 4)
    
    return catalog_data

def main():
    """메인 실행 함수"""
    print("🏨 Hotel Matching Model 더미 데이터 생성 중...")
    
    # Property 데이터 생성
    property_data = generate_property_data()
    
    # Catalog 데이터 생성
    catalog_data = []
    catalog_data.extend(generate_correct_answers(property_data))  # 4개
    catalog_data.extend(generate_similar_data(property_data, 96))  # 96개
    catalog_data.extend(generate_unrelated_data(400))  # 400개
    
    # ML 점수 추가
    catalog_data = generate_ml_scores(catalog_data)
    
    # 데이터 섞기
    random.shuffle(catalog_data)
    
    # CSV 파일로 저장
    property_df = pd.DataFrame([property_data])
    catalog_df = pd.DataFrame(catalog_data)
    
    property_df.to_csv('property_data.csv', index=False, encoding='utf-8')
    catalog_df.to_csv('catalog_data.csv', index=False, encoding='utf-8')
    
    print(f"✅ 데이터 생성 완료!")
    print(f"   - Property 데이터: 1개 (property_data.csv)")
    print(f"   - Catalog 데이터: {len(catalog_data)}개 (catalog_data.csv)")
    print(f"     └ 정답: 4개, 유사: 96개, 무관: 400개")
    
    # 데이터 요약 출력
    print("\n📊 Catalog 데이터 요약:")
    print(f"   - 정답 데이터: {sum(1 for item in catalog_data if item['is_correct'])}개")
    print(f"   - 높은 유사도 (>0.7): {sum(1 for item in catalog_data if item['similarity_score'] > 0.7)}개")
    print(f"   - 중간 유사도 (0.3-0.7): {sum(1 for item in catalog_data if 0.3 <= item['similarity_score'] <= 0.7)}개")
    print(f"   - 낮은 유사도 (<0.3): {sum(1 for item in catalog_data if item['similarity_score'] < 0.3)}개")

if __name__ == "__main__":
    main()
