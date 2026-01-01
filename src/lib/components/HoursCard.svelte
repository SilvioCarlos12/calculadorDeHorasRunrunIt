<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { auth } from '$lib/stores/auth';
	import { getManualWorkPeriods, formatSecondsToHours } from '$lib/api/runrun';

	let totalSeconds = $state(0);
	let loading = $state(true);
	let error = $state('');
	let displayMonth = $state('');
	
	// Valor/hora com persistência em localStorage
	let valorHora = $state(browser ? Number(localStorage.getItem('valorHora')) || 0 : 0);
	
	// Cálculo derivado do valor total
	let valorTotal = $derived((totalSeconds / 3600) * valorHora);
	
	// Persistir valorHora quando mudar
	$effect(() => {
		if (browser) {
			localStorage.setItem('valorHora', String(valorHora));
		}
	});
	
	// Formatação de moeda brasileira
	function formatCurrency(value: number): string {
		return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	const monthNames = [
		'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
		'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
	];

	const expectedMonthlySeconds = 176 * 3600;

	let progressPercentage = $derived(Math.min((totalSeconds / expectedMonthlySeconds) * 100, 100));

	async function fetchHours() {
		const credentials = $auth.credentials;
		const userId = $auth.user?.id;
		if (!credentials || !userId) return;

		loading = true;
		error = '';

		try {
			const limit = 100;
			
			let allPeriods: { seconds: number; date_to_apply: string }[] = [];
			let page = 1;
			
			// Buscar todos os períodos (API retorna os mais recentes)
			while (true) {
				const periods = await getManualWorkPeriods(credentials, {
					user_id: userId,
					limit,
					page
				});
				
				allPeriods = [...allPeriods, ...periods];
				if (periods.length < limit) break;
				page++;
			}

			// Detectar o mês mais recente dos lançamentos
			if (allPeriods.length > 0) {
				// Extrair mês/ano diretamente da string (evita problemas de timezone)
				const getMonthYear = (dateStr: string) => {
					const [year, month] = dateStr.split('-').map(Number);
					return { year, month: month - 1 }; // month é 0-indexed
				};
				
				const monthYears = allPeriods.map(p => getMonthYear(p.date_to_apply));
				const mostRecent = monthYears.reduce((a, b) => {
					if (a.year > b.year) return a;
					if (a.year < b.year) return b;
					return a.month > b.month ? a : b;
				});
				
				displayMonth = `${monthNames[mostRecent.month]} ${mostRecent.year}`;
				
				// Filtrar apenas lançamentos do mês mais recente (comparação de strings)
				const targetPrefix = `${mostRecent.year}-${String(mostRecent.month + 1).padStart(2, '0')}`;
				const filteredPeriods = allPeriods.filter(p => p.date_to_apply.startsWith(targetPrefix));
				
				totalSeconds = filteredPeriods.reduce((sum, period) => sum + (period.seconds || 0), 0);
				
				// #region agent log
				fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HoursCard:fetchHours',message:'Hours loaded',data:{totalSeconds,periodsCount:filteredPeriods.length,allPeriodsCount:allPeriods.length,displayMonth,targetPrefix},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'FIX_FILTER'})}).catch(()=>{});
				// #endregion
			} else {
				displayMonth = 'Sem lançamentos';
				totalSeconds = 0;
			}
			
		} catch (e) {
			error = 'Erro ao carregar horas';
			console.error(e);
			// #region agent log
			fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HoursCard:fetchHours',message:'Error',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'ERROR'})}).catch(()=>{});
			// #endregion
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchHours();
	});
</script>

<div class="bg-gradient-to-br from-slate-800 to-indigo-900/30 rounded-2xl p-6">
	<!-- Header -->
	<div class="flex items-center gap-3 mb-6">
		<div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
			<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<polyline points="12,6 12,12 16,14" />
			</svg>
		</div>
		<div>
			<h3 class="text-base font-semibold text-slate-100">Horas Trabalhadas</h3>
			<p class="text-sm text-slate-400">{displayMonth || 'Carregando...'}</p>
		</div>
	</div>

	{#if loading}
		<div class="flex flex-col items-center gap-4 py-8 text-slate-400">
			<div class="w-8 h-8 border-3 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
			<span>Carregando...</span>
		</div>
	{:else if error}
		<div class="flex flex-col items-center gap-4 py-8 text-slate-400">
			<span>{error}</span>
			<button class="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors" onclick={fetchHours}>
				Tentar novamente
			</button>
		</div>
	{:else}
		<div class="space-y-5">
			<!-- Valor/hora input - Compacto à esquerda -->
			<div class="flex items-center gap-2 w-fit bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/50">
				<svg class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
				</svg>
				<label for="valorHora" class="text-xs text-slate-400 whitespace-nowrap">Valor/hora:</label>
				<div class="relative w-[80px]">
					<span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
					<input 
						id="valorHora"
						type="number" 
						min="0" 
						step="0.01"
						bind:value={valorHora}
						placeholder="0"
						class="w-full pl-7 pr-1 py-1 bg-slate-800 border border-emerald-500/40 rounded text-slate-100 text-sm focus:outline-none focus:border-emerald-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
				</div>
			</div>

			<!-- Hours & Value display - Side by side -->
			<div class="grid grid-cols-2 gap-4">
				<!-- Horas -->
				<div class="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700/50">
					<div class="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
						<svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10" />
							<polyline points="12,6 12,12 16,14" />
						</svg>
					</div>
					<span class="block text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-none">
						{formatSecondsToHours(totalSeconds)}
					</span>
					<span class="block text-slate-500 text-xs mt-1">
						horas trabalhadas
					</span>
				</div>
				
				<!-- Valor -->
				<div class="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700/50">
					<div class="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
						<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
						</svg>
					</div>
					<span class="block text-3xl font-bold text-emerald-400 leading-none">
						{formatCurrency(valorTotal)}
					</span>
					<span class="block text-slate-500 text-xs mt-1">
						valor do mês
					</span>
				</div>
			</div>

			<!-- Progress -->
			<div class="bg-slate-900 p-4 rounded-xl">
				<div class="flex justify-between text-sm text-slate-400 mb-2">
					<span>Progresso mensal</span>
					<span>{progressPercentage.toFixed(1)}%</span>
				</div>
				<div class="h-2 bg-slate-700 rounded-full overflow-hidden">
					<div 
						class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
						style="width: {progressPercentage}%"
					></div>
				</div>
				<p class="text-center text-xs text-slate-500 mt-2">
					Meta mensal: 176h (22 dias × 8h)
				</p>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-3 gap-3">
				<div class="text-center bg-slate-900 p-3 rounded-xl">
					<span class="block text-2xl font-semibold text-slate-100">{Math.floor(totalSeconds / 3600)}</span>
					<span class="block text-xs text-slate-400 mt-1">Horas</span>
				</div>
				<div class="text-center bg-slate-900 p-3 rounded-xl">
					<span class="block text-2xl font-semibold text-slate-100">{Math.floor((totalSeconds % 3600) / 60)}</span>
					<span class="block text-xs text-slate-400 mt-1">Minutos</span>
				</div>
				<div class="text-center bg-slate-900 p-3 rounded-xl">
					<span class="block text-2xl font-semibold text-slate-100">{(totalSeconds / 3600 / 8).toFixed(1)}</span>
					<span class="block text-xs text-slate-400 mt-1">Dias</span>
				</div>
			</div>
		</div>
	{/if}
</div>
