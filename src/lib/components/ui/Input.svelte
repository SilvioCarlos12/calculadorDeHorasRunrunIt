<script lang="ts">
	interface Props {
		type?: 'text' | 'password' | 'email' | 'number';
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		id?: string;
		oninput?: (e: Event) => void;
	}

	let {
		type = 'text',
		label,
		placeholder = '',
		value = $bindable(''),
		error,
		required = false,
		disabled = false,
		class: className = '',
		id = `input-${Math.random().toString(36).slice(2, 9)}`,
		oninput
	}: Props = $props();
</script>

<div class="flex flex-col gap-2 {className}">
	{#if label}
		<label for={id} class="text-sm font-medium text-slate-100">
			{label}
			{#if required}
				<span class="text-red-500 ml-0.5">*</span>
			{/if}
		</label>
	{/if}
	<input
		{id}
		{type}
		{placeholder}
		bind:value
		{required}
		{disabled}
		class="w-full px-4 py-3 bg-slate-900 border rounded-lg text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed {error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'}"
		{oninput}
	/>
	{#if error}
		<span class="text-xs text-red-500">{error}</span>
	{/if}
</div>
