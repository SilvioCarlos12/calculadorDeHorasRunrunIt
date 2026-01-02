<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { validateCredentials, getCurrentUser } from '$lib/api/runrun';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let appKey = $state('');
	let userToken = $state('');
	let loading = $state(false);
	let error = $state('');

	// Redirect if already authenticated
	$effect(() => {
		if ($auth.isAuthenticated) {
			goto('/dashboard');
		}
	});

	async function handleLogin() {
		if (!appKey.trim() || !userToken.trim()) {
			error = 'Preencha todos os campos';
			return;
		}

		loading = true;
		error = '';

		try {
			const credentials = { appKey: appKey.trim(), userToken: userToken.trim() };
			const isValid = await validateCredentials(credentials);

			if (isValid) {
				const user = await getCurrentUser(credentials);
				auth.login(credentials, user);
				goto('/dashboard');
			} else {
				error = 'Credenciais inválidas. Verifique sua App-Key e User-Token.';
			}
		} catch (e) {
			error = 'Erro ao conectar com a API. Verifique suas credenciais.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Runrun.it Dashboard</title>
</svelte:head>

<div class="login-container">
	<div class="login-content">
		<div class="logo-section">
			<div class="logo">
				<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="3" />
					<path
						d="M16 24l6 6 12-12"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<h1 class="title">Runrun.it</h1>
			<p class="subtitle">Dashboard de Produtividade</p>
		</div>

		<Card class="login-card">
			<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
				<div class="form-fields">
					<Input
						label="App-Key"
						placeholder="Sua App-Key do Runrun.it"
						bind:value={appKey}
						required
					/>

					<Input
						type="password"
						label="User-Token"
						placeholder="Seu User-Token"
						bind:value={userToken}
						required
					/>

					{#if error}
						<div class="error-alert">
							<svg viewBox="0 0 20 20" fill="currentColor" class="error-icon">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							</svg>
							<span>{error}</span>
						</div>
					{/if}

					<Button type="submit" {loading} class="login-btn">
						{loading ? 'Conectando...' : 'Entrar'}
					</Button>
				</div>
			</form>
		</Card>

		<p class="help-text">
			Obtenha suas credenciais em
			<a href="https://runrun.it/api/documentation" target="_blank" rel="noopener">
				runrun.it/api/documentation
			</a>
		</p>
	</div>

	<div class="background-decoration">
		<div class="circle circle-1"></div>
		<div class="circle circle-2"></div>
		<div class="circle circle-3"></div>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		position: relative;
		overflow: hidden;
	}

	.login-content {
		width: 100%;
		max-width: 420px;
		z-index: 10;
	}

	.logo-section {
		text-align: center;
		margin-bottom: 2rem;
	}

	.logo {
		width: 64px;
		height: 64px;
		margin: 0 auto 1rem;
		color: var(--color-primary);
	}

	.logo svg {
		width: 100%;
		height: 100%;
	}

	.title {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		background: linear-gradient(135deg, var(--color-primary), #a855f7);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		margin: 0.5rem 0 0;
		color: var(--color-text-muted);
		font-size: 1rem;
	}

	:global(.login-card) {
		backdrop-filter: blur(10px);
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	:global(.login-btn) {
		width: 100%;
		margin-top: 0.5rem;
	}

	.error-alert {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		color: var(--color-danger);
		font-size: 0.875rem;
	}

	.error-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.help-text {
		text-align: center;
		margin-top: 1.5rem;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.help-text a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.help-text a:hover {
		text-decoration: underline;
	}

	/* Background decoration */
	.background-decoration {
		position: fixed;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.circle {
		position: absolute;
		border-radius: 50%;
		opacity: 0.1;
	}

	.circle-1 {
		width: 600px;
		height: 600px;
		background: var(--color-primary);
		top: -200px;
		right: -200px;
	}

	.circle-2 {
		width: 400px;
		height: 400px;
		background: #a855f7;
		bottom: -100px;
		left: -100px;
	}

	.circle-3 {
		width: 300px;
		height: 300px;
		background: var(--color-primary);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
