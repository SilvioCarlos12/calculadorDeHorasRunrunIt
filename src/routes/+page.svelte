<svelte:head>
  <title>Calculadora de Horas</title>
</svelte:head>

<main class="min-h-screen bg-slate-950 text-slate-100">
  <section
    class="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-4 py-10"
  >
    <div class="max-w-3xl">
      <p
        class="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300"
      >
        Calculadora de horas
      </p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Escolha como quer registrar as horas
      </h1>
      <p class="mt-4 text-lg text-slate-400">
        Use o Runrit para buscar horas direto do Runrun.it ou preencha
        manualmente para gerar um CSV.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <a
        href="/runrit"
        class="group rounded-3xl border border-[#E3524E]/30 bg-[#E3524E]/10 p-6 transition hover:-translate-y-1 hover:border-[#E3524E] hover:bg-[#E3524E]/20"
      >
        <div
          class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3524E] text-white"
        >
          <!-- Ícone do Runrun.it -->
          <svg viewBox="0 0 512 512" fill="currentColor" class="h-8 w-8">
            <path
              d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM256 64c106.1 0 192 85.9 192 192s-85.9 192-192 192S64 362.1 64 256S149.9 64 256 64z"
            />
            <path
              d="M233.4 169.4L168.6 234.2c-12.5 12.5-12.5 32.8 0 45.3l64.7 64.7c12.5 12.5 32.8 12.5 45.3 0l64.7-64.7c12.5-12.5 12.5-32.8 0-45.3L278.6 169.4c-12.5-12.5-32.8-12.5-45.3 0zM352 256c0 53-43 96-96 96s-96-43-96-96s43-96 96-96s96 43 96 96z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold">Com Runrun.it</h2>
        <p class="mt-3 text-slate-300">
          Login com App-Key e User-Token para calcular horas a partir dos
          lançamentos do Runrun.it.
        </p>
        <span
          class="mt-6 inline-flex font-semibold text-[#E3524E] group-hover:text-[#E3524E]/80"
          >Entrar com Runrun.it</span
        >
      </a>

      <a
        href="/csv"
        class="group rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-500/20"
      >
        <div
          class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-8 w-8"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14,2 14,8 20,8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold">Sem Runrit</h2>
        <p class="mt-3 text-slate-300">
          Cadastro manual com nome, tarefa, dia, mês, ano e horas, com
          exportação em CSV.
        </p>
        <span
          class="mt-6 inline-flex font-semibold text-emerald-200 group-hover:text-white"
          >Gerar CSV manual</span
        >
      </a>

      <a
        href="/jira"
        class="group rounded-3xl border border-[#005BF0]/30 bg-[#005BF0]/10 p-6 transition hover:-translate-y-1 hover:border-[#005BF0] hover:bg-[#005BF0]/20"
      >
        <div
          class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005BF0] text-white"
        >
          <!-- Ícone do Jira -->
          <svg viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8">
            <path d="M12.5 2L8 6.5L12.5 11L17 6.5L12.5 2Z" />
            <path d="M8 6.5L3.5 11L8 15.5L12.5 11L8 6.5Z" />
            <path d="M17 6.5L12.5 11L17 15.5L21.5 11L17 6.5Z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold">Com Jira</h2>
        <p class="mt-3 text-slate-300">
          Login com Personal Access Token (PAT) ou API Token para calcular horas
          a partir dos lançamentos do Jira.
        </p>
        <span
          class="mt-6 inline-flex font-semibold text-[#005BF0] group-hover:text-[#005BF0]/80"
          >Entrar com Jira</span
        >
      </a>
    </div>
  </section>
</main>
