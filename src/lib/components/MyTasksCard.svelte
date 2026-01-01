<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { getTasks, type Task } from '$lib/api/runrun';
	import TaskItem from './TaskItem.svelte';

	let allTasks = $state<Task[]>([]);
	let loading = $state(true);
	let error = $state('');
	let filter = $state<'all' | 'open' | 'closed'>('open');
	let searchQuery = $state('');

	let filteredTasks = $derived(() => {
		let tasks = allTasks;
		
		if (filter === 'open') {
			tasks = tasks.filter(t => t.state !== 'done');
		} else if (filter === 'closed') {
			tasks = tasks.filter(t => t.state === 'done');
		}
		
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			tasks = tasks.filter(t => 
				t.title.toLowerCase().includes(query) ||
				t.project_name?.toLowerCase().includes(query) ||
				t.client_name?.toLowerCase().includes(query)
			);
		}
		
		return tasks;
	});

	async function fetchTasks() {
		const credentials = $auth.credentials;
		const userId = $auth.user?.id;
		if (!credentials || !userId) return;

		loading = true;
		error = '';

		try {
			let fetchedTasks: Task[] = [];
			let page = 1;
			const limit = 100;

			while (true) {
				const tasks = await getTasks(credentials, {
					limit,
					page,
					sort: 'desired_date',
					sort_dir: 'asc',
					responsible_id: userId
				});

				fetchedTasks = [...fetchedTasks, ...tasks];

				if (tasks.length < limit) break;
				page++;
			}

			allTasks = fetchedTasks;
		} catch (e) {
			error = 'Erro ao carregar tarefas';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchTasks();
	});

	const taskCounts = $derived({
		all: allTasks.length,
		open: allTasks.filter(t => t.state !== 'done').length,
		closed: allTasks.filter(t => t.state === 'done').length
	});
</script>

<div class="bg-slate-800 rounded-2xl p-6 flex flex-col min-h-[400px] max-h-[700px]">
	<!-- Header -->
	<div class="flex items-center gap-3 mb-4">
		<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
			<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M9 11l3 3L22 4" />
				<path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
			</svg>
		</div>
		<div>
			<h3 class="text-base font-semibold text-slate-100">Minhas Tarefas</h3>
			<p class="text-sm text-slate-400">
				{#if !loading}
					{filteredTasks().length} tarefa{filteredTasks().length !== 1 ? 's' : ''}
				{:else}
					Carregando...
				{/if}
			</p>
		</div>
	</div>

	<!-- Controls -->
	<div class="flex flex-col gap-3 mb-4">
		<!-- Filter tabs -->
		<div class="flex gap-1 bg-slate-900 p-1 rounded-lg">
			<button 
				class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm transition-all {filter === 'open' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
				onclick={() => filter = 'open'}
			>
				Abertas
				<span class="text-xs px-1.5 py-0.5 rounded {filter === 'open' ? 'bg-indigo-500 text-white' : 'bg-slate-700'}">{taskCounts.open}</span>
			</button>
			<button 
				class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm transition-all {filter === 'closed' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
				onclick={() => filter = 'closed'}
			>
				Concluídas
				<span class="text-xs px-1.5 py-0.5 rounded {filter === 'closed' ? 'bg-indigo-500 text-white' : 'bg-slate-700'}">{taskCounts.closed}</span>
			</button>
			<button 
				class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm transition-all {filter === 'all' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
				onclick={() => filter = 'all'}
			>
				Todas
				<span class="text-xs px-1.5 py-0.5 rounded {filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-700'}">{taskCounts.all}</span>
			</button>
		</div>

		<!-- Search -->
		<div class="relative">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
			</svg>
			<input 
				type="text" 
				placeholder="Buscar tarefas..."
				bind:value={searchQuery}
				class="w-full py-2.5 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
			/>
		</div>
	</div>

	<!-- Content -->
	{#if loading}
		<div class="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
			<div class="w-8 h-8 border-3 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
			<span>Carregando tarefas...</span>
		</div>
	{:else if error}
		<div class="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
			<span>{error}</span>
			<button class="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors" onclick={fetchTasks}>
				Tentar novamente
			</button>
		</div>
	{:else if filteredTasks().length === 0}
		<div class="flex-1 flex flex-col items-center justify-center text-center p-8">
			<div class="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center text-slate-500 mb-4">
				<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
					<rect x="9" y="3" width="6" height="4" rx="1" />
				</svg>
			</div>
			<h4 class="text-lg text-slate-100 mb-1">Nenhuma tarefa encontrada</h4>
			<p class="text-sm text-slate-400">
				{#if searchQuery}
					Nenhuma tarefa corresponde à sua busca.
				{:else if filter === 'open'}
					Você não tem tarefas abertas.
				{:else if filter === 'closed'}
					Você não tem tarefas concluídas.
				{:else}
					Você não tem tarefas.
				{/if}
			</p>
		</div>
	{:else}
		<div class="flex-1 space-y-3 overflow-y-auto min-h-0 pr-1">
			{#each filteredTasks() as task (task.id)}
				<TaskItem {task} />
			{/each}
		</div>
	{/if}
</div>
