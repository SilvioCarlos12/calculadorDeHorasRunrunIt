<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		class?: string;
		children: Snippet;
		header?: Snippet;
	}

	let { title, subtitle, class: className = '', children, header }: Props = $props();
</script>

<div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/30 {className}">
	{#if title || header}
		<div class="px-6 py-5 border-b border-slate-700">
			{#if header}
				{@render header()}
			{:else}
				<h3 class="text-lg font-semibold text-slate-100">{title}</h3>
				{#if subtitle}
					<p class="mt-1 text-sm text-slate-400">{subtitle}</p>
				{/if}
			{/if}
		</div>
	{/if}
	<div class="p-6">
		{@render children()}
	</div>
</div>
