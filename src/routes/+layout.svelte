<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	// #region agent log
	if (typeof window !== 'undefined') {
		fetch('http://127.0.0.1:7245/ingest/b997fa4c-7ad0-4f97-97b5-ef3f4a07087f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'+layout.svelte:4',message:'Using static favicon only',data:{faviconPath: '/favicon.ico', windowLocation: typeof window !== 'undefined' ? window.location.href : 'SSR'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
	}

	onMount(() => {
		// Test if favicon is accessible
		fetch('/favicon.ico', { method: 'HEAD' })
			.then(response => {
				fetch('http://127.0.0.1:7245/ingest/b997fa4c-7ad0-4f97-97b5-ef3f4a07087f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'+layout.svelte:onMount',message:'Favicon fetch test',data:{status: response.status, statusText: response.statusText, ok: response.ok, url: response.url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
			})
			.catch(error => {
				fetch('http://127.0.0.1:7245/ingest/b997fa4c-7ad0-4f97-97b5-ef3f4a07087f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'+layout.svelte:onMount',message:'Favicon fetch error',data:{error: error.message, errorName: error.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
			});
	});
	// #endregion agent log

	let { children } = $props();
</script>

<svelte:head>
	<!-- #region agent log -->
	{(() => {
		if (typeof window !== 'undefined') {
			fetch('http://127.0.0.1:7245/ingest/b997fa4c-7ad0-4f97-97b5-ef3f4a07087f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'+layout.svelte:head',message:'HTML head favicon link added',data:{faviconStatic: '/favicon.ico'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
		}
		return '';
	})()}
	<!-- #endregion agent log -->
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" type="image/png" href="/favicon.ico" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}
