<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleStart() {
		dispatch('start');
	}
</script>

<div class="welcome">
	<h1>환영합니다</h1>
	<button on:click={handleStart}>시작하기</button>
</div>

<style>
	.welcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	h1 {
		font-size: 2em;
		margin-bottom: 1em;
	}

	button {
		font-size: 1.2em;
		padding: 0.5em 1em;
	}
</style>
