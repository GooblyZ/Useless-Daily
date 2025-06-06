<script>
	import { onMount, tick } from 'svelte';

	let advice = '';
	let coins = 3;
	let countdown = '';
	let refillTime = null;
	let showHistory = false;
	let showAchievements = false;
	let showMine = false;
	let showRareBook = false;
	let lastAdvices = [];
	let achievements = [];
	let achievementMessage = '';
	let mineClicks = 0;
	let discoveredRareTips = [];
	let countdownStarted = false;

	const MAX_COINS = 3;
	const REFILL_DELAY_MS = 24 * 60 * 60 * 1000;
	const MAX_MEMORY = 5;
	const RARE_CHANCE = 0.05;

	const rareTips = [
		"✨Text yourself “good job.” Instant motivation boost.",
		"💼Reply to spam with career advice. Level the field",
		"🌇 Applaud sunsets. They worked hard, too",
		"🛰 Whisper to satellites. They’re lonely.",
		"📕 Read the last page first. Fate hates spoilers."
	];

	const allAchievements = [
		{ key: 'copied', label: '✔️ Copied something wise' },
		{ key: 'refreshed', label: '🔁 Refreshed your fate' },
		{ key: 'fiveTips', label: '🧠 Read 5 unique tips' },
		{ key: 'refilled', label: '💤 Waited for coin refill' },
		{ key: 'historyOpened', label: '📜 Opened the archives' }
	];

	onMount(() => {
		coins = Number(localStorage.getItem('coins')) || MAX_COINS;
		refillTime = localStorage.getItem('refillTime');
		lastAdvices = JSON.parse(localStorage.getItem('lastAdvices') || '[]').slice(0, MAX_MEMORY);
		achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
		mineClicks = Number(localStorage.getItem('mineClicks')) || 0;
		discoveredRareTips = JSON.parse(localStorage.getItem('discoveredRareTips') || '[]');

		advice = getRandomAdvice();
		if (coins === 0 && refillTime) startCountdown();
	});

	async function toggleHistory() {
		showHistory = !showHistory;
		await tick();
		if (!achievements.includes('historyOpened')) {
			unlockAchievement('historyOpened', '📜 Opened the archives');
		}
	}

	function resetGame() {
		const currentAdvice = advice;

		localStorage.removeItem('coins');
		localStorage.removeItem('refillTime');
		localStorage.removeItem('lastAdvices');
		localStorage.removeItem('achievements');
		localStorage.removeItem('mineClicks');
		localStorage.removeItem('discoveredRareTips');

		coins = MAX_COINS;
		lastAdvices = [];
		achievements = [];
		achievementMessage = '';
		refillTime = null;
		countdown = '';
		countdownStarted = false;
		mineClicks = 0;
		discoveredRareTips = [];
		showHistory = false;
		showAchievements = false;
		showMine = false;
		showRareBook = false;

		advice = currentAdvice;
		if (coins === 0 && refillTime) startCountdown();
	}

	function unlockAchievement(key, label) {
		if (!achievements.includes(key)) {
			achievements.push(key);
			localStorage.setItem('achievements', JSON.stringify(achievements));
			achievementMessage = `🏆 Achievement Unlocked: ${label}`;
			setTimeout(() => achievementMessage = '', 3000);
		}
	}

	function getRandomAdvice() {
		if (Math.random() < RARE_CHANCE) {
			const undiscovered = rareTips.filter(t => !discoveredRareTips.includes(t));
			if (undiscovered.length > 0) {
				const tip = undiscovered[Math.floor(Math.random() * undiscovered.length)];
				discoveredRareTips.push(tip);
				localStorage.setItem('discoveredRareTips', JSON.stringify(discoveredRareTips));
				achievementMessage = `✨ Rare Tip Discovered!`;
				setTimeout(() => achievementMessage = '', 3000);
				return tip;
			}
		}

		const samples = [
			"Pour cereal first, then put it back. Teaches regret.",
			"Eat soup with a fork to build patience.",
			"Never trust a man with two first names.",
			"Yawn louder to assert dominance.",
			"Blink one eye at a time for efficiency.",
			"Stand in line for things you don’t want. Builds character.",
			"Restart your router to restart your life.",
			"Clean your house by moving everything slightly.",
			"If you can't find it, don't look. It'll show up.",
			"Water your plants with coffee. They need the energy too.",
			"Buy a calendar to remember the past.",
			"Clap at your screen to scare away bugs.",
			"Sleep during meetings to save energy.",
			"Talk to your furniture. Build trust.",
			"Use both hands to double-click for power clicks.",
			"Whisper 'Enhance' while zooming on photos.",
			"Microwave your socks before walking. It’s therapeutic.",
			"Wear two pairs of socks to fake productivity.",
			"Always carry a spoon. Yogurt is unpredictable.",
			"Write TODO lists after doing the tasks. Dominate your day.",
			"Rename your Wi-Fi to 'FBI Surveillance Van'. Fear is power.",
			"Applaud when the microwave finishes early.",
			"Brush your teeth while doing squats. Time = saved.",
			"Use Ctrl+S while talking. Backup your soul.",
			"Reboot your life by turning it off and on again."
		];

		const chosen = samples[Math.floor(Math.random() * samples.length)];
		updateMemory(chosen);
		return chosen;
	}

	function updateMemory(newAdvice) {
	lastAdvices = [newAdvice, ...lastAdvices.filter(t => t !== newAdvice)].slice(0, MAX_MEMORY);
	localStorage.setItem('lastAdvices', JSON.stringify(lastAdvices));
	if (lastAdvices.length >= 5) unlockAchievement('fiveTips', '🧠 Read 5 unique tips');
}


	function refreshAdvice() {
		if (coins > 0) {
			coins--;
			advice = getRandomAdvice();
			localStorage.setItem('coins', coins);
			unlockAchievement('refreshed', '🔁 Refreshed your fate');

			if (coins === 0) {
				const nextTime = Date.now() + REFILL_DELAY_MS;
				localStorage.setItem('refillTime', nextTime);
				refillTime = nextTime;
				startCountdown();
			}
		}
	}

	function copyToClipboard(text) {
		navigator.clipboard.writeText(text);
		unlockAchievement('copied', '✔️ Copied something wise');
	}

	function startCountdown() {
		if (countdownStarted) return;
		countdownStarted = true;

		const interval = setInterval(() => {
			const now = Date.now();
			const remaining = Number(refillTime) - now;

			if (remaining <= 0) {
				clearInterval(interval);
				countdownStarted = false;

				if (refillTime) {
					coins = MAX_COINS;
					localStorage.setItem('coins', coins);
					localStorage.removeItem('refillTime');
					countdown = '';
					unlockAchievement('refilled', '💤 Waited for coin refill');
				}
				return;
			}

			const hrs = Math.floor(remaining / (1000 * 60 * 60));
			const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
			const secs = Math.floor((remaining % (1000 * 60)) / 1000);
			countdown = `Next refill in: ${hrs}h ${mins}m ${secs}s`;
		}, 1000);
	}

function mineCoin() {
	if (coins < MAX_COINS) {
		mineClicks++;
		localStorage.setItem('mineClicks', mineClicks);

		if (mineClicks >= 50) {
			coins++;
			mineClicks = 0;
			localStorage.setItem('coins', coins);
			localStorage.setItem('mineClicks', mineClicks);

			// ⛏️ Fix: If we reach MAX_COINS, cancel refill countdown
			if (coins === MAX_COINS) {
				refillTime = null;
				localStorage.removeItem('refillTime');
				countdown = '';
				countdownStarted = false;
			}
		}
	}
}

</script>

<main>
	<h1>🎮 Useless Daily</h1>

	{#if achievementMessage}
		<div class="achievement-toast">{achievementMessage}</div>
	{/if}

	<div class="advice">"{advice}"</div>
	<div class="coins">💰 Coins: {coins}</div>
	{#if countdown}<div class="countdown">⏳ {countdown}</div>{/if}

	<button on:click={() => copyToClipboard(advice)}>📋 Copy</button>
	<button on:click={refreshAdvice} disabled={coins === 0}>🔁 Refresh (-1)</button>
	<button on:click={toggleHistory}>🕓 Advice History</button>
	<button on:click={() => showAchievements = !showAchievements}>🏅 Achievements</button>
	<button on:click={() => showMine = !showMine}>⛏️ Mine Coins</button>
	<button on:click={() => showRareBook = !showRareBook}>📖 Rare Book ({discoveredRareTips.length}/5)</button>

	{#if showHistory}
		<div class="popup">
			<h3>📜 Last Tips</h3>
			{#if lastAdvices.length > 0}
				<ul>{#each lastAdvices as tip}<li>{tip}</li>{/each}</ul>
			{:else}
				<p>No advice history yet.</p>
			{/if}
		</div>
	{/if}

	{#if showAchievements}
		<div class="popup">
			<h3>🏆 Achievements</h3>
			<ul>
				{#each allAchievements as ach}
					<li class:unachieved={!achievements.includes(ach.key)}>{ach.label}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if showMine}
		<div class="popup">
			<h3>⛏️ Mine Coins</h3>
			<p>Click 50 times to earn 1 coin. Current: {mineClicks}/50</p>
			<button on:click={mineCoin} disabled={coins >= MAX_COINS}>💥 Click to Mine</button>
		</div>
	{/if}

	{#if showRareBook}
		<div class="popup">
			<h3>📖 Rare Book ({discoveredRareTips.length}/5)</h3>
			<ul>
				{#each rareTips as tip}
					<li class:uncollected={!discoveredRareTips.includes(tip)}>
						{discoveredRareTips.includes(tip) ? tip : '🔒 Unknown Tip'}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<button on:click={resetGame}>🔄 Reset Everything</button>

	<a href="https://www.buymeacoffee.com/Gloopsy" target="_blank" class="coffee-button">
	<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee">
</a>


</main>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

	:global(body) {
		margin: 0;
		padding: 0;
		background: linear-gradient(135deg, #1f1c2c, #928dab);
		background-size: 400% 400%;
		animation: gradientShift 10s ease infinite;
		font-family: 'Press Start 2P', system-ui, sans-serif;
		color: #f1f1f1;
	}

	@keyframes gradientShift {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		text-align: center;
		padding: 2rem;
	}

	h1 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.advice {
		font-size: 1rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1.5rem;
		max-width: 400px;
	}

	.coins, .countdown {
		font-size: 0.9rem;
		margin: 0.25rem 0;
		color: #ffd700;
		text-shadow: 0 0 4px #000;
	}

	button {
		margin: 0.5rem;
		padding: 0.6rem 1.2rem;
		font-size: 0.75rem;
		font-family: 'Press Start 2P', system-ui;
		background: #333;
		color: #fff;
		border: 2px solid #00ff99;
		border-radius: 10px;
		cursor: pointer;
		transition: transform 0.2s ease, background 0.3s ease;
	}

	button:hover {
		background: #00ff99;
		color: #000;
		transform: scale(1.05);
	}

	button:disabled {
		background: #444;
		color: #aaa;
		border-color: #555;
		cursor: not-allowed;
		transform: none;
	}

	.popup {
		margin-top: 1rem;
		background: rgba(0, 0, 0, 0.8);
		padding: 1rem;
		border-radius: 10px;
		border: 2px solid #fff;
		max-width: 90vw;
		text-align: left;
	}

	.popup ul li {
		margin-bottom: 1rem;
	}

	.popup ul li.uncollected {
		color: grey;
	}

	.popup p {
		margin: 0.5rem 0 1rem;
		font-size: 0.75rem;
	}

	.unachieved {
		color: grey;
	}

	.achievement-toast {
		position: fixed;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: #000;
		padding: 0.75rem 1.5rem;
		border: 2px solid #ffd700;
		border-radius: 10px;
		color: white;
		font-size: 0.7rem;
		z-index: 9999;
		animation: fadeOut 3s forwards;
	}

	@keyframes fadeOut {
		0% { opacity: 1; }
		80% { opacity: 1; }
		100% { opacity: 0; }
	}


	.coffee-button {
	display: inline-block;
	margin-top: 1rem;
	transition: transform 0.2s ease;
}

.coffee-button img {
	height: 60px !important;
	width: 217px !important;
	border-radius: 8px;
	box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.coffee-button:hover {
	transform: scale(1.05);
}

.coffee-button {
	position: fixed;
	bottom: 1.5rem;
	left: 1.5rem;
	z-index: 1000;
}

</style>
