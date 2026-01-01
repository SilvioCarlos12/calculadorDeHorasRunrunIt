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

<div class="card {className}">
	{#if title || header}
		<div class="card-header">
			{#if header}
				{@render header()}
			{:else}
				<h3 class="card-title">{title}</h3>
				{#if subtitle}
					<p class="card-subtitle">{subtitle}</p>
				{/if}
			{/if}
		</div>
	{/if}
	<div class="card-body">
		{@render children()}
	</div>
</div>

<style>
	.card {
		background: var(--color-surface);
		border-radius: 16px;
		border: 1px solid var(--color-border);
		overflow: hidden;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.card:hover {
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.card-header {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.card-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.card-subtitle {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.card-body {
		padding: 1.5rem;
	}
</style>

