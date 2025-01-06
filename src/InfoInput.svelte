<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let currentStep = 0;
	let userInfo = {
		name: '',
		age: '',
		sex: '',
		weight: '',
		height: '',
		sleepTime: '',
		drink: '',
		smoke: '',
		fatigue: '',
		systolicBP: '',
		diastolicBP: '',
		heartRate: '',
		walking: '',
		cholesterol: ''
	};

	let errorMessage = '';

	const steps = [
		{ field: 'name', label: '성함', type: 'text', required: true },
		{ field: 'age', label: '연령', type: 'number', required: true },
		{ field: 'sex', label: '성별', type: 'select', options: ['남자', '여자'], required: true },
		{ field: 'weight', label: '몸무게 (kg)', type: 'number', step: '0.1', required: true },
		{ field: 'height', label: '키 (cm)', type: 'number', step: '0.1', required: true },
		{ field: 'sleepTime', label: '하루 수면시간', type: 'number', step: '0.5', required: true },
		{ field: 'drink', label: '음주 여부', type: 'select', options: ['예', '아니오'], required: true },
		{ field: 'smoke', label: '흡연 여부', type: 'select', options: ['예', '아니오'], required: true },
		{ field: 'fatigue', label: '피로 여부', type: 'select', options: ['예', '아니오'], required: true },
		{ field: ['systolicBP', 'diastolicBP'], label: '혈압', type: 'number', required: false },
		{ field: 'heartRate', label: '심박수', type: 'number', required: false },
		{ 
			field: 'walking', 
			label: '하루에 걸음은 얼마나 걷나요?', 
			type: 'select', 
			options: [
				'매우 많이 걷는다',
				'꽤 많이 걷는다',
				'보통 걷는다',
				'조금 걷는다',
				'거의 걷지 않는다'
			], 
			required: false 
		},
		{ field: 'cholesterol', label: '콜레스테롤 과다 여부', type: 'select', options: ['예', '아니오'], required: false }
	];

	function handleNext() {
		if (isValidInput()) {
			errorMessage = '';
			if (currentStep < steps.length - 1) {
				currentStep++;
			} else {
				dispatch('finish', userInfo);
			}
		}
	}

	function handleBack() {
		errorMessage = '';
		if (currentStep > 0) {
			currentStep--;
		} else {
			dispatch('goToWelcome');
		}
	}

	function handleSkip() {
		errorMessage = '';
		if (!steps[currentStep].required) {
			if (Array.isArray(steps[currentStep].field)) {
				steps[currentStep].field.forEach(field => {
					userInfo[field] = null;
				});
			} else {
				userInfo[steps[currentStep].field] = null;
			}
			if (currentStep < steps.length - 1) {
				currentStep++;
			} else {
				dispatch('finish', userInfo);
			}
		}
	}

	function isValidInput() {
		const currentStepInfo = steps[currentStep];
		
		if (currentStepInfo.field === 'walking' || currentStepInfo.field === 'cholesterol') {
			return true;  // 걸음 수와 콜레스테롤은 필수 입력이 아니므로, 항상 true를 반환
		}

		if (Array.isArray(currentStepInfo.field)) {
			// 혈압 입력 검증
			const systolic = userInfo.systolicBP;
			const diastolic = userInfo.diastolicBP;
			if ((systolic && !diastolic) || (!systolic && diastolic)) {
				errorMessage = '수축기 혈압과 이완기 혈압을 모두 입력해주세요.';
				return false;
			}
			return true;
		} else {
			const value = userInfo[currentStepInfo.field];
			
			if (currentStepInfo.required && (value === '' || value === null || value === undefined)) {
				return false;
			}

			if (currentStepInfo.field === 'name') {
				if (!/^[가-힣a-zA-Z\s]+$/.test(value)) {
					errorMessage = '이름은 문자만 입력 가능합니다.';
					return false;
				}
			}

			if (currentStepInfo.type === 'number') {
				const numValue = parseFloat(value);
				if (isNaN(numValue)) {
					return false;
				}
				if (currentStepInfo.step) {
					const step = parseFloat(currentStepInfo.step);
					const remainder = (numValue / step) % 1;
					if (remainder !== 0 && Math.abs(remainder - 1) > Number.EPSILON) {
						return false;
					}
				}
			}

			if (currentStepInfo.type === 'select') {
				return currentStepInfo.options.includes(value);
			}
		}

		return true;
	}

	function typeAction(node, type) {
		node.type = type;
		return {
			update(newType) {
				node.type = newType;
			}
		};
	}

	function handleSelect(option) {
		const currentField = steps[currentStep].field;
		if (currentField === 'walking') {
			const walkingValues = {
				'매우 많이 걷는다': 10000,
				'꽤 많이 걷는다': 8000,
				'보통 걷는다': 7000,
				'조금 걷는다': 5600,
				'거의 걷지 않는다': 3000
			};
			userInfo[currentField] = walkingValues[option];
		} else {
			userInfo[currentField] = option;
		}
		userInfo = {...userInfo};
	}

	function handleInput(event) {
		if (steps[currentStep].field === 'name') {
			event.target.value = event.target.value.replace(/[^가-힣a-zA-Z\s]/g, '');
		}
	}
</script>

<div class="info-input">
	<h2>{steps[currentStep].label}</h2>
	
	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
	
	{#if steps[currentStep].type === 'select'}
		<div class="button-group">
			{#each steps[currentStep].options as option}
				<button 
					class:selected={userInfo[steps[currentStep].field] === (steps[currentStep].field === 'walking' ? 
						Object.values({
							'매우 많이 걷는다': 10000,
							'꽤 많이 걷는다': 8000,
							'보통 걷는다': 7000,
							'조금 걷는다': 5600,
							'거의 걷지 않는다': 3000
						})[steps[currentStep].options.indexOf(option)] : option)}
					on:click={() => handleSelect(option)}
				>
					{option}
				</button>
			{/each}
		</div>
	{:else if Array.isArray(steps[currentStep].field)}
		<div class="input-group">
			<label>
				수축기 혈압:
				<input 
					type="number"
					bind:value={userInfo.systolicBP}
					required={steps[currentStep].required}
					on:input={() => userInfo = {...userInfo}}
				>
			</label>
			<label>
				이완기 혈압:
				<input 
					type="number"
					bind:value={userInfo.diastolicBP}
					required={steps[currentStep].required}
					on:input={() => userInfo = {...userInfo}}
				>
			</label>
		</div>
	{:else}
		<input 
			use:typeAction={steps[currentStep].type}
			bind:value={userInfo[steps[currentStep].field]}
			step={steps[currentStep].step}
			required={steps[currentStep].required}
			on:input={handleInput}
		>
	{/if}

	<div class="navigation">
		<button on:click={handleBack}>뒤로가기</button>
		{#if !steps[currentStep].required}
			<button on:click={handleSkip}>건너뛰기</button>
		{/if}
		<button on:click={handleNext}>
			{currentStep === steps.length - 1 ? '확인' : '다음'}
		</button>
	</div>
</div>

<style>
	.info-input {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	h2 {
		margin-bottom: 1em;
	}

	input {
		font-size: 1.2em;
		padding: 0.5em;
		margin-bottom: 1em;
	}

	.button-group {
		display: flex;
		justify-content: center;
		margin-bottom: 1em;
	}

	.button-group button {
		margin: 0 0.5em;
		background-color: #f0f0f0;
		color: #333;
		border: 1px solid #ccc;
		padding: 0.5em 1em;
		cursor: pointer;
		transition: background-color 0.3s, color 0.3s;
	}

	.button-group button.selected {
		background-color: #007bff;
		color: white;
		border-color: #007bff;
	}

	.navigation {
		display: flex;
		justify-content: space-between;
		width: 100%;
		max-width: 300px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-bottom: 1em;
	}

	.input-group label {
		margin-bottom: 0.5em;
	}

	.error {
		color: red;
		margin-bottom: 1em;
	}
</style>
