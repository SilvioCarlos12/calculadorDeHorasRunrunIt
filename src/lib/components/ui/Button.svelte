<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const variantClasses: Record<string, string> = {
		primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30',
		secondary: 'bg-slate-700 text-slate-100 border border-slate-600 hover:bg-slate-600',
		danger: 'bg-red-500 text-white hover:bg-red-600',
		ghost: 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};
</script>

<button
	{type}
	class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed {variantClasses[variant]} {sizeClasses[size]} {className}"
	disabled={disabled || loading}
	{onclick}
>
	{#if loading}
		<span class="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin"></span>
	{/if}
	<span class:opacity-70={loading}>{@render children()}</span>
</button>
