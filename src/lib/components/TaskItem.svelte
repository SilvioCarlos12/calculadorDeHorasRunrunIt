<script lang="ts">
	import type { Task } from '$lib/api/runrun';
	import { getDaysOverdue } from '$lib/api/runrun';

	interface Props {
		task: Task;
	}

	let { task }: Props = $props();

	const daysOverdue = $derived(task.desired_date ? getDaysOverdue(task.desired_date) : 0);
	
	const priorityColors: Record<number, string> = {
		1: 'bg-red-500',
		2: 'bg-amber-500',
		3: 'bg-emerald-500',
		4: 'bg-indigo-500',
		5: 'bg-violet-500'
	};

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'Sem prazo';
		const date = new Date(dateStr);
		return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
	}

	const priorityClass = $derived(priorityColors[task.priority] || 'bg-indigo-500');
</script>

<article class="flex bg-slate-800/80 rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-all">
	<!-- Priority indicator -->
	<div class="w-1.5 shrink-0 {priorityClass}"></div>
	
	<!-- Main content -->
	<div class="flex-1 flex items-center justify-between gap-4 p-4">
		<!-- Left: Title and meta -->
		<div class="flex-1 min-w-0 space-y-1.5">
			<h4 class="text-sm font-medium text-white leading-snug line-clamp-2">
				{task.title}
			</h4>
			
			{#if task.project_name || task.client_name}
				<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
					{#if task.project_name}
						<span class="inline-flex items-center gap-1 text-xs text-slate-400">
							<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
								<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
							</svg>
							{task.project_name}
						</span>
					{/if}
					
					{#if task.client_name}
						<span class="inline-flex items-center gap-1 text-xs text-slate-400">
							<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
							</svg>
							{task.client_name}
						</span>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Right: Status badges -->
		<div class="flex flex-col items-end gap-1.5 shrink-0">
			{#if daysOverdue > 0}
				<span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-red-400 bg-red-500/20 border border-red-500/30 rounded">
					<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
					{daysOverdue} dias
				</span>
			{/if}
			
			<span class="inline-flex items-center gap-1 text-xs text-slate-500">
				<svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
				</svg>
				{formatDate(task.desired_date)}
			</span>
		</div>
	</div>
</article>
