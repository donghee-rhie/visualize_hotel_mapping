/**
 * Hotel Matching Model Visualization - 박스 레이아웃 버전
 * CSS 애니메이션 기반 구현
 */

class HotelMatchingBoxVisualizer {
    constructor() {
        this.API_BASE = 'http://localhost:8001';
        this.currentStep = 0;
        this.propertyData = null;
        this.catalogData = null;
        this.hotelBoxes = [];
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Hotel Matching Box Visualizer 초기화 중...');
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 초기 데이터 로드
        await this.loadInitialData();
        
        console.log('✅ 초기화 완료');
    }
    
    setupEventListeners() {
        // Step 버튼들
        document.querySelectorAll('.step-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const step = parseInt(e.target.closest('.step-button').dataset.step);
                this.executeStep(step);
            });
        });
        
        // 리셋 버튼
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetVisualization();
        });
        
        // 메시지 닫기 버튼
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete')) {
                e.target.closest('.notification').classList.add('is-hidden');
            }
        });
    }
    
    async loadInitialData() {
        try {
            // Property 데이터 로드
            const propertyResponse = await fetch(`${this.API_BASE}/property`);
            this.propertyData = await propertyResponse.json();
            
            // Catalog 데이터 로드 (36개)
            const catalogResponse = await fetch(`${this.API_BASE}/catalog`);
            const catalogResult = await catalogResponse.json();
            this.catalogData = catalogResult.items;
            
            // Property 정보 표시
            this.displayPropertyInfo();
            
            // 호텔 박스들 렌더링
            this.renderHotelBoxes();
            
            this.showMessage('카탈로그 후보군 로드 완료! Step 1을 시작하세요.', 'is-info');
            
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            this.showMessage('데이터 로드에 실패했습니다.', 'is-danger');
        }
    }
    
    displayPropertyInfo() {
        const propertyInfoEl = document.getElementById('property-info');
        
        propertyInfoEl.innerHTML = `
            <div class="hotel-info" style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 12px;">
                <div class="hotel-name" style="font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                    ${this.propertyData.name}
                </div>
                <div class="hotel-address" style="font-size: 0.85rem; color: #7f8c8d; margin-bottom: 8px;">
                    ${this.propertyData.address}
                </div>
                <span class="hotel-supplier" style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">
                    ${this.propertyData.supplier_type}
                </span>
            </div>
        `;
    }
    
    renderHotelBoxes() {
        const container = document.getElementById('hotel-container');
        container.innerHTML = '';
        
        this.catalogData.forEach((hotel, index) => {
            const box = this.createHotelBox(hotel, index);
            container.appendChild(box);
            this.hotelBoxes.push(box);
            
            // 애니메이션 지연 효과
            setTimeout(() => {
                box.classList.add('fade-in');
            }, index * 20);
        });
        
        // 메인 타이틀 업데이트 (숫자 미표기)
        document.getElementById('main-title').textContent = '카탈로그 후보군';
    }
    
    createHotelBox(hotel, index) {
        const box = document.createElement('div');
        box.className = 'hotel-box initial';
        box.setAttribute('data-index', index);
        box.setAttribute('data-supplier', hotel.supplier_type);
        box.setAttribute('data-correct', hotel.is_correct);
        
        box.innerHTML = `
            <div class="hotel-name">${hotel.name}</div>
            <div class="hotel-address">${hotel.address}</div>
            <span class="hotel-supplier">${hotel.supplier_type}</span>
            <div class="score-container" style="display: none;">
                <div class="similarity-score">
                    <span>유사도:</span>
                    <span>${hotel.similarity_score.toFixed(3)}</span>
                </div>
                <div class="ml-score" style="display: none;">
                    <span>ML:</span>
                    <span>${hotel.ml_score.toFixed(3)}</span>
                </div>
            </div>
        `;
        
        // 정답 별 표기 비활성화
        
        // 호버 효과
        box.addEventListener('mouseenter', () => {
            if (!box.classList.contains('hidden')) {
                box.style.transform = 'translateY(-5px) scale(1.02)';
            }
        });
        
        box.addEventListener('mouseleave', () => {
            if (!box.classList.contains('hidden')) {
                box.style.transform = 'translateY(0) scale(1)';
            }
        });
        
        return box;
    }
    
    async executeStep(step) {
        if (step <= this.currentStep) {
            return; // 이미 실행된 단계
        }
        
        if (step > this.currentStep + 1) {
            this.showMessage('이전 단계를 먼저 완료해주세요.', 'is-warning');
            return;
        }
        
        try {
            switch(step) {
                case 1:
                    await this.executeStep1();
                    break;
                case 2:
                    await this.executeStep2();
                    break;
                case 3:
                    await this.executeStep3();
                    break;
                case 4:
                    await this.executeStep4();
                    break;
            }
        } catch (error) {
            console.error(`Step ${step} 실행 실패:`, error);
            this.showMessage(`Step ${step} 실행에 실패했습니다.`, 'is-danger');
        }
    }
    
    async executeStep1() {
        this.updateStatusTag('Step 1 처리 중', 'processing');
        
        try {
            const response = await fetch(`${this.API_BASE}/step1`, { method: 'POST' });
            const result = await response.json();
            
            // Step 1 애니메이션 실행
            await this.animateStep1(result);
            
            this.currentStep = 1;
            this.updateStepButtons();
            this.updateProgressInfo('Step 1 완료', '완료 : Catalog 중 1차 후보군 산정');
            this.updateStatusTag('Step 1 완료', 'completed');
            
            // 서버 메시지 대신 고정 문구 사용하여 일관성 유지
            this.showMessage('완료 : Catalog 중 1차 후보군 산정', 'is-success');
            
        } catch (error) {
            this.updateStatusTag('오류 발생', 'error');
            throw error;
        }
    }
    
    async animateStep1(result) {
        // 메인 타이틀 업데이트
        document.getElementById('main-title').textContent = 'Step 1: 1차 후보군 선별';
        
        // 모든 박스에 유사도 점수 표시 (순차적으로)
        for (let i = 0; i < this.hotelBoxes.length; i++) {
            const box = this.hotelBoxes[i];
            const scoreContainer = box.querySelector('.score-container');
            
            setTimeout(() => {
                scoreContainer.style.display = 'flex';
                scoreContainer.classList.add('slide-up');
            }, i * 80);
        }
        
        await this.delay(this.hotelBoxes.length * 80 + 800);
        
        // 선택된 박스들을 파란색으로 변경하고 나머지는 페이드아웃
        const selectedSupplierSeqs = new Set(result.selected_items.map(item => item.supplier_property_seq));
        
        for (let i = 0; i < this.hotelBoxes.length; i++) {
            const box = this.hotelBoxes[i];
            const hotel = this.catalogData[i];
            
            setTimeout(() => {
                if (selectedSupplierSeqs.has(hotel.supplier_property_seq)) {
                    box.classList.remove('initial');
                    box.classList.add('selected');
                    box.style.transform = 'scale(1.1)';
                    box.style.zIndex = '10';
                    
                    setTimeout(() => {
                        box.style.transform = 'scale(1)';
                    }, 400);
                } else {
                    // 선택되지 않은 박스는 페이드아웃
                    box.style.opacity = '0.3';
                    box.style.transform = 'scale(0.9)';
                    box.style.filter = 'grayscale(0.7)';
                }
            }, i * 50);
        }
        
        await this.delay(this.hotelBoxes.length * 50 + 1000);
    }
    
    async executeStep2() {
        this.updateStatusTag('Step 2 처리 중 (스코어링)', 'processing');
        
        try {
            const response = await fetch(`${this.API_BASE}/step2`, { method: 'POST' });
            const result = await response.json();
            
            // Step 2 애니메이션 실행
            await this.animateStep2(result);
            
            this.currentStep = 2;
            this.updateStepButtons();
            this.updateProgressInfo('Step 2 완료', 'ML모델을 활용한 유사도 Scoring 완료');
            this.updateStatusTag('스코어링 완료', 'completed');
            
            this.showMessage(result.message, 'is-success');
            
        } catch (error) {
            this.updateStatusTag('오류 발생', 'error');
            throw error;
        }
    }
    
    async animateStep2(result) {
        // 메인 타이틀 업데이트
        document.getElementById('main-title').textContent = 'Step 2: 스코어링 및 정렬';

        // 1) 선택되지 않은(회색) 박스 제거
        const selectedSupplierSeqs = new Set(result.ranked_items.map(item => item.supplier_property_seq));
        for (let i = 0; i < this.hotelBoxes.length; i++) {
            const box = this.hotelBoxes[i];
            const hotel = this.catalogData[i];
            if (!selectedSupplierSeqs.has(hotel.supplier_property_seq)) {
                setTimeout(() => {
                    box.style.opacity = '0';
                    box.style.transform = 'scale(0.5)';
                    box.style.display = 'none';
                }, i * 30);
            }
        }
        await this.delay(this.hotelBoxes.length * 30 + 800);

        // Step2부터 유사도 점수 제거
        const allSimilarityEls = document.querySelectorAll('.similarity-score');
        allSimilarityEls.forEach(el => {
            el.parentElement && el.parentElement.removeChild(el);
        });

        // 2) 남은 박스만 추려서 '사전 정렬' (유사도 기반) 후 배치
        const container = document.getElementById('hotel-container');
        let remainingBoxes = this.hotelBoxes.filter(box => {
            const index = parseInt(box.getAttribute('data-index'));
            const hotel = this.catalogData[index];
            return selectedSupplierSeqs.has(hotel.supplier_property_seq);
        });
        remainingBoxes = remainingBoxes.sort((a, b) => {
            const ia = parseInt(a.getAttribute('data-index'));
            const ib = parseInt(b.getAttribute('data-index'));
            const sa = this.catalogData[ia].similarity_score;
            const sb = this.catalogData[ib].similarity_score;
            return sb - sa; // 유사도 내림차순
        });
        container.innerHTML = '';
        remainingBoxes.forEach((box, i) => {
            setTimeout(() => {
                container.appendChild(box);
                box.classList.add('slide-up');
            }, i * 60);
        });
        await this.delay(remainingBoxes.length * 60 + 600);

        // 3) 그리드를 4x3으로 전환 후 박스 확대
        const grid = document.getElementById('hotel-container');
        grid.classList.add('survivors-12');
        remainingBoxes.forEach((box, i) => {
            setTimeout(() => {
                box.classList.add('enlarge');
            }, i * 50);
        });
        await this.delay(remainingBoxes.length * 50 + 500);

        // 4) ML 점수 표시 및 색상 적용
        for (let i = 0; i < remainingBoxes.length; i++) {
            const box = remainingBoxes[i];
            setTimeout(() => {
                const mlScore = box.querySelector('.ml-score');
                if (mlScore) {
                    mlScore.style.display = 'block';
                    mlScore.classList.add('slide-up');
                }
                const index = parseInt(box.getAttribute('data-index'));
                const hotel = this.catalogData[index];
                box.classList.remove('selected');
                const score = parseFloat(hotel.ml_score);
                if (score >= 0.7) box.classList.add('scored-high');
                else if (score >= 0.3) box.classList.add('scored-medium');
                else box.classList.add('scored-low');
            }, i * 120);
        }
        await this.delay(remainingBoxes.length * 120 + 700);

        // 5) ML 스코어 기준 최종 정렬
        const rankedOrder = result.ranked_items.map(it => it.supplier_property_seq);
        const ordered = remainingBoxes.sort((a, b) => {
            const ia = rankedOrder.indexOf(this.catalogData[parseInt(a.getAttribute('data-index'))].supplier_property_seq);
            const ib = rankedOrder.indexOf(this.catalogData[parseInt(b.getAttribute('data-index'))].supplier_property_seq);
            return ia - ib;
        });
        container.innerHTML = '';
        ordered.forEach((box, i) => {
            setTimeout(() => {
                container.appendChild(box);
                box.classList.add('slide-up');
            }, i * 80);
        });
        await this.delay(ordered.length * 80 + 600);
    }

    async executeStep3() {
        this.updateStatusTag('Step 3 처리 중', 'processing');
        try {
            const response = await fetch(`${this.API_BASE}/step3`, { method: 'POST' });
            const result = await response.json();
            await this.animateStep3(result);
            this.currentStep = 3;
            this.updateStepButtons();
            this.updateProgressInfo('Step 3 완료', 'LLM 검증대상 선정 완료');
            this.updateStatusTag('검증 대상 지정', 'completed');
            this.showMessage(result.message, 'is-success');
        } catch (e) {
            this.updateStatusTag('오류 발생', 'error');
            throw e;
        }
    }

    async animateStep3(result) {
        document.getElementById('main-title').textContent = 'Step 3: LLM 검증대상 선정';
        const container = document.getElementById('hotel-container');
        const boxes = Array.from(container.children);
        const seqToBox = new Map();
        boxes.forEach(box => {
            const idx = parseInt(box.getAttribute('data-index'));
            const seq = this.catalogData[idx].supplier_property_seq;
            seqToBox.set(seq, box);
        });
        // 초기화: 기존 상태/라벨 제거
        boxes.forEach(box => {
            box.classList.remove('confirmed','rejected','llm-processing','llm-confirmed');
            const oldLabel = box.querySelector('.status-label');
            if (oldLabel) oldLabel.remove();
        });
        
        // 클라이언트 보호 로직: 표시 기준(소수점 3자리 반올림)으로 재평가해 0.98 이상은 확정으로 승급
        const promoteToConfirmed = [];
        const remainLLM = [];
        (result.llm_items || []).forEach(item => {
            const rounded = Math.round(parseFloat(item.ml_score) * 1000) / 1000;
            if (rounded >= 0.98) promoteToConfirmed.push(item);
            else remainLLM.push(item);
        });
        const finalConfirmed = (result.confirmed_items || []).concat(promoteToConfirmed);
        const finalRejected = result.rejected_items || [];
        const finalLLM = remainLLM;

        // 순차 처리: 현재 화면 순서대로 ML 점수 깜빡 → 판정 라벨 깜빡
        const statusMap = new Map();
        finalConfirmed.forEach(it => statusMap.set(it.supplier_property_seq, { type: 'confirmed', text: '확정' }));
        finalRejected.forEach(it => statusMap.set(it.supplier_property_seq, { type: 'rejected', text: '탈락' }));
        finalLLM.forEach(it => statusMap.set(it.supplier_property_seq, { type: 'llm', text: 'LLM 판정' }));

        for (const box of boxes) {
            const idx = parseInt(box.getAttribute('data-index'));
            const seq = this.catalogData[idx].supplier_property_seq;
            const status = statusMap.get(seq);
            if (!status) continue;

            // 1) 점수 칸 하이라이트
            const scoreEl = box.querySelector('.ml-score');
            if (scoreEl) {
                scoreEl.classList.add('score-flash');
                await this.delay(344);
                scoreEl.classList.remove('score-flash');
            } else {
                await this.delay(104);
            }

            // 2) 판정 라벨 및 박스 상태 적용 + 라벨 깜빡임
            if (status.type === 'confirmed') box.classList.add('confirmed');
            else if (status.type === 'rejected') box.classList.add('rejected');
            else if (status.type === 'llm') box.classList.add('llm-processing');

            this.addStatusLabel(box, status.text, status.type);
            const label = box.querySelector('.status-label');
            if (label) {
                label.classList.add('label-flash');
                await this.delay(344);
                label.classList.remove('label-flash');
            } else {
                await this.delay(104);
            }
        }
        // Step 3에서는 최종 확정/탈락 확정 처리하지 않음
    }

    async executeStep4() {
        this.updateStatusTag('Step 4 처리 중', 'processing');
        try {
            const response = await fetch(`${this.API_BASE}/step4`, { method: 'POST' });
            const result = await response.json();
            await this.animateStep4(result);
            this.currentStep = 4;
            this.updateStepButtons();
            this.updateProgressInfo('Step 4 완료', '최종 선별 완료');
            this.updateStatusTag('모든 단계 완료', 'completed');
            this.showMessage(result.message, 'is-success');
        } catch (e) {
            this.updateStatusTag('오류 발생', 'error');
            throw e;
        }
    }

    async animateStep4(result) {
        document.getElementById('main-title').textContent = 'Step 4: 최종 선별';
        const container = document.getElementById('hotel-container');
        const boxes = Array.from(container.children);
        const seqToBox = new Map();
        boxes.forEach(box => {
            const idx = parseInt(box.getAttribute('data-index'));
            const seq = this.catalogData[idx].supplier_property_seq;
            seqToBox.set(seq, box);
        });
        // 순차 처리: 각 LLM 검증 박스가 먼저 깜빡이고 → 결과로 바뀌어 다시 깜빡임
        const finalRejected = result.rejected_items || [];
        const finalConfirmed = result.llm_confirmed_items || [];
        const statusMap = new Map();
        finalRejected.forEach(it => statusMap.set(it.supplier_property_seq, { type: 'rejected', text: '탈락' }));
        finalConfirmed.forEach(it => statusMap.set(it.supplier_property_seq, { type: 'confirmed', text: '확정' }));

        (async () => {
            for (const box of boxes) {
                const idx = parseInt(box.getAttribute('data-index'));
                const seq = this.catalogData[idx].supplier_property_seq;
                const status = statusMap.get(seq);
                // Step3에서 LLM 검증 대상이었던 박스만 처리
                if (!status || !box.classList.contains('llm-processing')) continue;

                // 1) 현재 LLM 판정 라벨 깜빡임
                let label = box.querySelector('.status-label');
                if (label) {
                    label.classList.add('label-flash');
                    await this.delay(344);
                    label.classList.remove('label-flash');
                } else {
                    await this.delay(104);
                }

                // 2) 결과 상태로 전환 및 라벨 업데이트
                if (status.type === 'rejected') {
                    box.classList.remove('llm-processing','llm-confirmed');
                    box.classList.add('rejected');
                    this.updateStatusLabel(box, '탈락', 'rejected');
                } else {
                    box.classList.remove('llm-processing');
                    box.classList.add('llm-confirmed');
                    this.updateStatusLabel(box, '확정', 'confirmed');
                }

                // 3) 결과 라벨 깜빡임
                label = box.querySelector('.status-label');
                if (label) {
                    label.classList.add('label-flash');
                    await this.delay(344);
                    label.classList.remove('label-flash');
                } else {
                    await this.delay(104);
                }
            }
        })();
    }
    
    // Step 3 제거됨
    
    // animateStep3 제거됨
    
    addStatusLabel(box, text, type) {
        const label = document.createElement('div');
        label.className = `status-label ${type}`;
        const iconMap = {
            confirmed: 'fa-check-circle',
            rejected: 'fa-times-circle',
            llm: 'fa-robot'
        };
        const icon = iconMap[type] || 'fa-info-circle';
        label.innerHTML = `<span class="icon" style="margin-right:4px;"><i class="fas ${icon}"></i></span>${text}`;
        box.appendChild(label);
    }
    
    updateStatusLabel(box, text, type) {
        const label = box.querySelector('.status-label');
        if (label) {
            const iconMap = {
                confirmed: 'fa-check-circle',
                rejected: 'fa-times-circle',
                llm: 'fa-robot'
            };
            const icon = iconMap[type] || 'fa-info-circle';
            label.className = `status-label ${type}`;
            label.innerHTML = `<span class="icon" style="margin-right:4px;"><i class="fas ${icon}"></i></span>${text}`;
        }
    }
    
    updateStepButtons() {
        const buttons = document.querySelectorAll('.step-button');
        
        buttons.forEach((btn, index) => {
            const step = index + 1;
            
            if (step <= this.currentStep) {
                btn.classList.add('completed');
                btn.disabled = false;
                const icon = btn.querySelector('.icon i');
                icon.className = 'fas fa-check';
            } else if (step === this.currentStep + 1) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        });
    }
    
    updateProgressInfo(title, description) {
        const progressInfo = document.getElementById('progress-info');
        progressInfo.innerHTML = `
            <div class="progress-indicator completed" style="display: flex; align-items: center; margin-bottom: 8px;">
                <span class="icon has-text-success" style="margin-right: 8px;"><i class="fas fa-check-circle"></i></span>
                <span><strong>${title}</strong></span>
            </div>
            <p class="is-size-7 has-text-grey-dark">${description}</p>
        `;
    }
    
    updateStatusTag(text, type) {
        const statusTag = document.getElementById('status-tag');
        statusTag.textContent = text;
        statusTag.className = 'tag is-large pastel-tag';
        
        if (type === 'processing') {
            statusTag.classList.add('processing');
        } else if (type === 'completed') {
            statusTag.classList.add('completed');
        }
    }
    
    showMessage(text, type = 'is-info') {
        const messageArea = document.getElementById('message-area');
        const messageText = document.getElementById('message-text');
        
        messageArea.className = `notification pastel-notification ${type} fade-in`;
        messageText.textContent = text;
        messageArea.classList.remove('is-hidden');
        
        // 5초 후 자동 숨김
        setTimeout(() => {
            messageArea.classList.add('is-hidden');
        }, 5000);
    }
    
    // 로딩 모달 제거됨
    
    resetVisualization() {
        this.currentStep = 0;
        
        // 버튼 상태 리셋
        document.querySelectorAll('.step-button').forEach((btn, index) => {
            btn.classList.remove('completed');
            btn.disabled = index > 0;
            
            // 아이콘 복원
            const icons = ['fas fa-filter', 'fas fa-sort-amount-down', 'fas fa-check-circle'];
            btn.querySelector('.icon i').className = icons[index];
        });
        
        // 진행 상태 리셋
        document.getElementById('progress-info').innerHTML = '<p>Step을 시작하세요.</p>';
        
        // 상태 태그 리셋
        this.updateStatusTag('대기 중', '');
        
        // 메시지 숨김
        document.getElementById('message-area').classList.add('is-hidden');
        
        // 메인 타이틀 리셋
        document.getElementById('main-title').textContent = 'Hotel Matching Model Visualization';

        // 컨테이너/그리드 상태 리셋
        const container = document.getElementById('hotel-container');
        container.classList.remove('survivors-12');
        container.innerHTML = '';

        // 로컬 상태 리셋 후 재렌더링
        this.hotelBoxes = [];
        this.renderHotelBoxes();
        
        this.showMessage('시각화가 리셋되었습니다.', 'is-info');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    new HotelMatchingBoxVisualizer();
});
