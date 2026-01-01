<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { getTasks, isTaskOverdue, type Task } from '$lib/api/runrun';
	import TaskItem from './TaskItem.svelte';

	let overdueTasks = $state<Task[]>([]);
	let loading = $state(true);
	let error = $state('');

	async function fetchOverdueTasks() {
		const credentials = $auth.credentials;
		const userId = $auth.user?.id;
		if (!credentials || !userId) return;

		loading = true;
		error = '';

		try {
			let allTasks: Task[] = [];
			let page = 1;
			const limit = 100;

			while (true) {
				const tasks = await getTasks(credentials, {
					is_closed: false,
					limit,
					page,
					sort: 'desired_date',
					sort_dir: 'asc',
					responsible_id: userId
				});

				allTasks = [...allTasks, ...tasks];

				if (tasks.length < limit) break;
				page++;
			}

			overdueTasks = allTasks.filter(isTaskOverdue);
		} catch (e) {
			error = 'Erro ao carregar tarefas';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchOverdueTasks();
	});
</script>

<div class="bg-slate-800 rounded-2xl p-6 flex flex-col max-h-[600px]">
	<!-- Header -->
	<div class="flex items-center gap-3 mb-4">
		<div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white">
			<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		</div>
		<div class="flex-1">
			<h3 class="text-base font-semibold text-slate-100">Tarefas Atrasadas</h3>
			<p class="text-sm text-slate-400">
				{#if !loading && !error}
					{overdueTasks.length} tarefa{overdueTasks.length !== 1 ? 's' : ''} pendente{overdueTasks.length !== 1 ? 's' : ''}
				{:else}
					Carregando...
				{/if}
			</p>
		</div>
		{#if overdueTasks.length > 0}
			<div class="min-w-7 h-7 flex items-center justify-center bg-red-500 text-white text-sm font-semibold rounded-lg px-2">
				{overdueTasks.length}
			</div>
		{/if}
	</div>

	<!-- Content -->
	{#if loading}
		<div class="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-slate-400">
			<div class="w-8 h-8 border-3 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
			<span>Carregando tarefas...</span>
		</div>
	{:else if error}
		<div class="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-slate-400">
			<span>{error}</span>
			<button class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors" onclick={fetchOverdueTasks}>
				Tentar novamente
			</button>
		</div>
	{:else if overdueTasks.length === 0}
		<div class="flex-1 flex flex-col items-center justify-center text-center py-8">
			<div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
				<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 11 12 14 22 4" />
					<path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
				</svg>
			</div>
			<h4 class="text-lg text-slate-100 mb-1">Tudo em dia!</h4>
			<p class="text-sm text-slate-400">Não há tarefas atrasadas no momento.</p>
		</div>
	{:else}
		<div class="flex-1 space-y-3 overflow-y-auto pr-1">
			{#each overdueTasks as task (task.id)}
				<TaskItem {task} />
			{/each}
		</div>
	{/if}
</div>
