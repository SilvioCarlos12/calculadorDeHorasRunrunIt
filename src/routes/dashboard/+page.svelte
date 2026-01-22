<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import HoursCard from '$lib/components/HoursCard.svelte';

	$effect(() => {
		if (!$auth.isAuthenticated) {
			goto('/');
		}
	});

	function handleLogout() {
		auth.logout();
		goto('/');
	}

	function refreshPage() {
		window.location.reload();
	}

	const userName = $derived($auth.user?.name || 'Usuário');
	const greeting = $derived(() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Bom dia';
		if (hour < 18) return 'Boa tarde';
		return 'Boa noite';
	});
</script>

<svelte:head>
	<title>Dashboard - Runrun.it</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-900">
	<!-- Header -->
	<header class="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm">
		<div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
			<div class="flex items-center gap-4">
				<div class="w-10 h-10 text-indigo-500 flex-shrink-0">
					<svg viewBox="0 0 32 32" fill="none" class="w-full h-full">
						<circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5" />
						<polyline points="10,16 14,20 22,12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
				<div>
					<h1 class="text-lg font-semibold text-slate-100">
						{greeting()}, <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{userName}</span>
					</h1>
					<p class="text-sm text-slate-400">Gerencie suas horas trabalhadas</p>
				</div>
			</div>
			
			<div class="flex gap-2">
				<button 
					class="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
					onclick={refreshPage}
				>
					<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
					</svg>
					Atualizar
				</button>
				<button 
					class="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
					onclick={handleLogout}
				>
					<svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
					</svg>
					Sair
				</button>
			</div>
		</div>
	</header>

	<!-- Main -->
	<main class="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
		<div class="max-w-2xl mx-auto">
			<HoursCard />
		</div>
	</main>

	<!-- Footer -->
	<footer class="py-6 text-center text-slate-500 text-sm">
		<p>
			Dados do <a href="https://runrun.it" target="_blank" rel="noopener" class="text-indigo-400 hover:underline">Runrun.it</a>
		</p>
	</footer>
</div>
