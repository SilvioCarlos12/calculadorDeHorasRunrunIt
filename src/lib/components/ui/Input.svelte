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
		oninput
	}: Props = $props();
</script>

<div class="input-wrapper {className}">
	{#if label}
		<label class="input-label">
			{label}
			{#if required}
				<span class="required">*</span>
			{/if}
		</label>
	{/if}
	<input
		{type}
		{placeholder}
		bind:value
		{required}
		{disabled}
		class="input"
		class:has-error={error}
		{oninput}
	/>
	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.required {
		color: var(--color-danger);
		margin-left: 2px;
	}

	.input {
		width: 100%;
		padding: 0.875rem 1rem;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		color: var(--color-text);
		font-family: inherit;
		font-size: 1rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
	}

	.input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.input.has-error {
		border-color: var(--color-danger);
	}

	.input.has-error:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--color-danger);
	}
</style>

