<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	// Configuração do Jira
	type JiraConfig = {
		instanceUrl: string;
		email: string;
		apiToken: string;
	};

	// Dados do worklog do Jira
	type Worklog = {
		id: string;
		issueId: string;
		author: {
			displayName: string;
			emailAddress: string;
		};
		timeSpent: string;
		timeSpentSeconds: number;
		started: string;
		comment?: string;
	};

	type WorkRecord = {
		id: string;
		name: string;
		task: string;
		day: number;
		month: number;
		year: number;
		hours: number;
		hourlyRate: number;
	};

	const STORAGE_KEY = 'jira_work_records';
	const MONTHLY_GOAL_HOURS = 160;
	const today = new Date();
	const todayDate = formatDateInput(today);
	const todayDateBr = formatDateBr(today);
	const monthNames = [
		'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
		'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
	];

	// Estados do Jira
	let jiraConfig = $state<JiraConfig | null>(null);
	let isConnected = $state(false);
	let isConnecting = $state(false);
	let jiraError = $state('');

	// Estados da tela
	let records = $state<WorkRecord[]>([]);
	let selectedMonth = $state(today.getMonth() + 1);
	let selectedYear = $state(today.getFullYear());
	let error = $state('');
	let showClearConfirm = $state(false);

	// Credenciais do formulário
	let instanceUrl = $state('');
	let email = $state('');
	let apiToken = $state('');

	// Filtros
	let dateFrom = $state('');
	let dateTo = $state('');

	function formatDateInput(date: Date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function formatDateBr(date: Date) {
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	function formatDateFromIso(isoDate: string) {
		const date = new Date(isoDate);
		return formatDateBr(date);
	}

	function getAuthHeader(config: JiraConfig): string {
		const auth = btoa(`${config.email}:${config.apiToken}`);
		return `Basic ${auth}`;
	}

	// Buscar worklogs do Jira
	async function fetchJiraWorklogs(config: JiraConfig, dateFrom?: string, dateTo?: string) {
    isConnecting = true;
    jiraError = '';
    
    try {
        const response = await fetch('/api/jira', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instanceUrl: config.instanceUrl,
                email: config.email,
                apiToken: config.apiToken,
                dateFrom,
                dateTo
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao buscar worklogs');
        }

        const data = await response.json();
        const newRecords = data.worklogs.map((worklog: any) => {
            const date = new Date(worklog.started);
            return {
                id: worklog.id,
                name: worklog.author.displayName,
                task: worklog.issueId,
                day: date.getDate(),
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                hours: worklog.timeSpentSeconds / 3600,
                hourlyRate: 0
            };
        });

        // Salvar no localStorage
        if (browser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
        }
        
        records = newRecords;
        
        if (newRecords.length === 0) {
            jiraError = 'Nenhum worklog encontrado para o período selecionado.';
        }

        return newRecords;

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar worklogs do Jira';
        jiraError = message;
        throw error;
    } finally {
        isConnecting = false;
    }
}

	// Conectar ao Jira
	async function connectJira() {
		if (!instanceUrl || !email || !apiToken) {
			error = 'Preencha todas as credenciais do Jira.';
			return;
		}

		error = '';
		
		const config = {
			instanceUrl: instanceUrl.trim(),
			email: email.trim(),
			apiToken: apiToken.trim()
		};

		try {
			await fetchJiraWorklogs(config, dateFrom, dateTo);
			jiraConfig = config;
			isConnected = true;
			error = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao conectar com o Jira';
		}
	}

	// Desconectar do Jira
	function disconnectJira() {
		jiraConfig = null;
		isConnected = false;
		records = [];
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	// Buscar novamente com novos filtros
	async function refreshWorklogs() {
		if (!jiraConfig) return;
		try {
			await fetchJiraWorklogs(jiraConfig, dateFrom, dateTo);
			error = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao atualizar worklogs';
		}
	}

	// Carregar dados salvos
	onMount(() => {
		if (!browser) return;
		
		const saved = localStorage.getItem('jira_config');
		if (saved) {
			try {
				const config = JSON.parse(saved);
				jiraConfig = config;
				isConnected = true;
				instanceUrl = config.instanceUrl;
				email = config.email;
				apiToken = config.apiToken;
				
				// Carregar worklogs salvos
				const storedRecords = localStorage.getItem(STORAGE_KEY);
				if (storedRecords) {
					records = JSON.parse(storedRecords);
				}
			} catch {
				localStorage.removeItem('jira_config');
			}
		}
	});

	// Salvar configuração
	$effect(() => {
		if (browser && jiraConfig) {
			localStorage.setItem('jira_config', JSON.stringify(jiraConfig));
		}
	});

	// Calcular totais
	const monthlyRecords = $derived(
		records.filter((record) => record.month === selectedMonth && record.year === selectedYear)
	);

	const monthlyHours = $derived(
		monthlyRecords.reduce((total, record) => total + Number(record.hours || 0), 0)
	);

	const totalHours = $derived(
		records.reduce((total, record) => total + Number(record.hours || 0), 0)
	);

	const monthlyValue = $derived(
		monthlyRecords.reduce(
			(total, record) => total + Number(record.hours || 0) * Number(record.hourlyRate || 0),
			0
		)
	);

	const monthlyProgress = $derived(Math.min((monthlyHours / MONTHLY_GOAL_HOURS) * 100, 100));

	function formatCurrency(value: number) {
		return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
	}

	function formatHours(value: number) {
		return value.toLocaleString('pt-BR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	function clearRecords() {
		showClearConfirm = true;
	}

	function confirmClearRecords() {
		records = [];
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
		showClearConfirm = false;
	}

	function cancelClearRecords() {
		showClearConfirm = false;
	}
</script>

<svelte:head>
	<title>Com Jira - Registro de Horas</title>
</svelte:head>

<main class="min-h-screen bg-slate-950 text-slate-100">
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
		<a href="/" class="w-fit text-sm text-slate-400 transition hover:text-white">Voltar para opções</a>

		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-3">
				<div class="p-2 bg-[#005BF0]/10 rounded-xl">
					<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-[#005BF0]">
						<path d="M12.5 2L8 6.5L12.5 11L17 6.5L12.5 2Z" />
						<path d="M8 6.5L3.5 11L8 15.5L12.5 11L8 6.5Z" />
						<path d="M17 6.5L12.5 11L17 15.5L21.5 11L17 6.5Z" />
					</svg>
				</div>
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.25em] text-[#005BF0]">Com Jira</p>
					<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Horas do Jira</h1>
				</div>
			</div>
			<p class="max-w-2xl text-slate-400">
				Conecte-se ao Jira para buscar automaticamente suas horas trabalhadas.
			</p>
		</div>

		<!-- Configuração do Jira -->
		{#if !isConnected}
			<section class="rounded-2xl border border-[#005BF0]/30 bg-[#005BF0]/5 p-6 shadow-xl shadow-black/20">
				<h2 class="mb-4 text-lg font-semibold text-white">Configurar integração</h2>
				
				<form class="grid gap-4" onsubmit={(event) => { event.preventDefault(); connectJira(); }}>
					<div class="grid gap-4">
						<label class="grid gap-2 text-sm font-medium text-slate-200">
							URL da instância
							<input
								bind:value={instanceUrl}
								placeholder="https://seu-instancia.atlassian.net"
								class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-[#005BF0]"
							/>
						</label>

						<label class="grid gap-2 text-sm font-medium text-slate-200">
							E-mail
							<input
								type="email"
								bind:value={email}
								placeholder="seu-email@empresa.com"
								class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-[#005BF0]"
							/>
						</label>

						<label class="grid gap-2 text-sm font-medium text-slate-200">
							API Token
							<input
								type="password"
								bind:value={apiToken}
								placeholder="Seu token gerado no perfil Atlassian"
								class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-[#005BF0]"
							/>
						</label>

						<div class="grid grid-cols-2 gap-4">
							<label class="grid gap-2 text-sm font-medium text-slate-200">
								Data inicial
								<input
									type="date"
									bind:value={dateFrom}
									class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-[#005BF0]"
								/>
							</label>
							<label class="grid gap-2 text-sm font-medium text-slate-200">
								Data final
								<input
									type="date"
									bind:value={dateTo}
									class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-[#005BF0]"
								/>
							</label>
						</div>
					</div>

					{#if error}
						<p class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
							{error}
						</p>
					{/if}

					<button 
						class="rounded-xl bg-[#005BF0] px-5 py-3 font-semibold text-white transition hover:bg-[#005BF0]/80 disabled:opacity-50 disabled:cursor-not-allowed" 
						type="submit"
						disabled={isConnecting}
					>
						{isConnecting ? '🔄 Conectando...' : '🔗 Conectar ao Jira'}
					</button>
				</form>
			</section>
		{:else}
			<!-- Conectado - Mostrar dados -->
			<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
				<section class="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-black/20">
					<div class="flex justify-between items-center mb-4">
						<h2 class="text-lg font-semibold">Worklogs do Jira</h2>
						<div class="flex gap-2">
							<button 
								class="rounded-lg bg-[#005BF0]/20 px-3 py-1 text-sm text-[#005BF0] transition hover:bg-[#005BF0]/30" 
								onclick={refreshWorklogs}
								disabled={isConnecting}
							>
								{isConnecting ? '🔄' : '↻ Atualizar'}
							</button>
							<button 
								class="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/30" 
								onclick={disconnectJira}
							>
								Desconectar
							</button>
						</div>
					</div>

					{#if jiraError}
						<div class="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
							{@html jiraError}
						</div>
					{/if}

					{#if isConnecting}
						<div class="text-center py-8">
							<span class="animate-spin text-4xl inline-block">⏳</span>
							<p class="text-slate-400 mt-2">Buscando worklogs...</p>
						</div>
					{:else}
						<div class="flex gap-4 mb-4 text-sm text-slate-400">
							<span>Total: <strong class="text-white">{records.length}</strong> registros</span>
							<span>Horas: <strong class="text-white">{formatHours(totalHours)}h</strong></span>
						</div>

						<div class="max-h-[500px] overflow-y-auto space-y-2">
							{#each monthlyRecords as record (record.id)}
								<div class="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
									<div class="flex justify-between items-start">
										<div>
											<p class="text-white font-medium">{record.name}</p>
											<p class="text-sm text-[#005BF0]">{record.task}</p>
											<p class="text-xs text-slate-500">
												{String(record.day).padStart(2, '0')}/{String(record.month).padStart(2, '0')}/{record.year}
											</p>
										</div>
										<div class="text-right">
											<span class="text-[#005BF0] font-bold text-lg">
												{formatHours(record.hours)}h
											</span>
										</div>
									</div>
								</div>
							{/each}

							{#if monthlyRecords.length === 0 && !isConnecting}
								<div class="text-center py-8 text-slate-400">
									<p>Nenhum worklog encontrado para este mês</p>
									<p class="text-sm mt-2">Tente ajustar os filtros de data</p>
								</div>
							{/if}
						</div>
					{/if}
				</section>

				<aside class="grid gap-4">
					<!-- Filtros -->
					<section class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
						<h3 class="text-sm font-semibold text-slate-300 mb-3">Filtros</h3>
						<div class="flex gap-3">
							<select bind:value={selectedMonth} class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-[#005BF0]">
								{#each monthNames as monthName, index}
									<option value={index + 1}>{monthName}</option>
								{/each}
							</select>
							<input
								type="number"
								bind:value={selectedYear}
								class="w-28 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-[#005BF0]"
							/>
						</div>
					</section>

					<section class="rounded-2xl border border-[#005BF0]/30 bg-[#005BF0]/10 p-5">
						<p class="text-sm text-[#005BF0]">Horas no mês</p>
						<strong class="mt-2 block text-4xl">{formatHours(monthlyHours)}h</strong>
						<p class="mt-2 text-sm text-slate-400">
							{monthlyRecords.length} registro{monthlyRecords.length === 1 ? '' : 's'} nesse mês
						</p>
					</section>

					<section class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
						<p class="text-sm text-emerald-200">Valor do mês</p>
						<strong class="mt-2 block text-3xl">{formatCurrency(monthlyValue)}</strong>
						<p class="mt-2 text-sm text-slate-400">Meta: {MONTHLY_GOAL_HOURS}h</p>
					</section>

					<section class="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
						<p class="text-sm text-violet-200">Progresso mensal</p>
						<strong class="mt-2 block text-3xl">{monthlyProgress.toFixed(0)}%</strong>
						<div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
							<div class="h-full rounded-full bg-violet-400" style="width: {monthlyProgress}%"></div>
						</div>
					</section>

					<section class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
						<p class="text-sm text-slate-400">Total geral</p>
						<strong class="mt-2 block text-3xl">{formatHours(totalHours)}h</strong>
					</section>

					<button 
						class="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400"
						onclick={() => alert('Funcionalidade de exportação CSV em breve!')}
					>
						📊 Exportar CSV
					</button>
				</aside>
			</div>
		{/if}
	</section>
</main>

{#if showClearConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40">
			<div class="mb-4 flex items-start gap-3">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
						<path d="M3 6h18" />
						<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
					</svg>
				</div>
				<div>
					<h2 class="text-lg font-semibold text-slate-100">Limpar registros?</h2>
					<p class="mt-1 text-sm leading-6 text-slate-400">
						Isso vai apagar todos os worklogs carregados do Jira.
					</p>
				</div>
			</div>

			<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<button class="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-800" onclick={cancelClearRecords}>
					Cancelar
				</button>
				<button class="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400" onclick={confirmClearRecords}>
					Limpar registros
				</button>
			</div>
		</div>
	</div>
{/if}