<script lang="ts">
  import { jiraConfig, jiraWorklogs, jiraLoading, jiraError, totalHours, fetchJiraWorklogs } from '$lib/stores/jira';
  import Button from './ui/Button.svelte';
  import Card from './ui/Card.svelte';
  import Input from './ui/Input.svelte';

  let email = '';
  let apiToken = '';
  let instanceUrl = '';
  let dateFrom = '';
  let dateTo = '';

  async function handleConnect() {
    if (!email || !apiToken || !instanceUrl) {
      alert('Preencha todas as credenciais');
      return;
    }

    const config = {
      instanceUrl,
      email,
      apiToken,
    };

    jiraConfig.set(config);
    await fetchJiraWorklogs(config, { dateFrom, dateTo });
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  function exportToCSV() {
    // Implementar exportação CSV
    console.log('Exportar para CSV');
  }
</script>

<Card class="p-6">
  <div class="flex items-center gap-3 mb-6">
    <div class="p-3 bg-[#005BF0]/10 rounded-xl">
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-[#005BF0]">
        <path d="M12.5 2L8 6.5L12.5 11L17 6.5L12.5 2Z" />
        <path d="M8 6.5L3.5 11L8 15.5L12.5 11L8 6.5Z" />
        <path d="M17 6.5L12.5 11L17 15.5L21.5 11L17 6.5Z" />
      </svg>
    </div>
    <h2 class="text-2xl font-bold text-white">Integração Jira</h2>
  </div>

  {#if !$jiraConfig}
    <!-- Formulário de conexão -->
    <div class="space-y-4">
      <Input
        type="text"
        placeholder="URL da instância (ex: https://seu-instancia.atlassian.net)"
        bind:value={instanceUrl}
        class="w-full"
      />
      <Input
        type="email"
        placeholder="Seu e-mail"
        bind:value={email}
        class="w-full"
      />
      <Input
        type="password"
        placeholder="API Token (gerado no perfil Atlassian)"
        bind:value={apiToken}
        class="w-full"
      />
      <div class="grid grid-cols-2 gap-4">
        <Input
          type="date"
          placeholder="Data inicial"
          bind:value={dateFrom}
        />
        <Input
          type="date"
          placeholder="Data final"
          bind:value={dateTo}
        />
      </div>
      <Button
        on:click={handleConnect}
        disabled={$jiraLoading}
        class="w-full bg-[#005BF0] hover:bg-[#005BF0]/80"
      >
        {#if $jiraLoading}
          <span class="flex items-center gap-2">
            <span class="animate-spin">⏳</span>
            Conectando...
          </span>
        {:else}
          Conectar ao Jira
        {/if}
      </Button>
    </div>
  {:else}
    <!-- Dados carregados -->
    <div class="space-y-4">
      <div class="flex justify-between items-center p-4 bg-slate-800 rounded-xl">
        <span class="text-slate-400">Total de horas</span>
        <span class="text-2xl font-bold text-white">
          {formatTime($totalHours * 3600)}
        </span>
      </div>

      {#if $jiraError}
        <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {$jiraError}
        </div>
      {/if}

      {#if $jiraLoading}
        <div class="text-center py-8">
          <span class="animate-spin text-4xl">⏳</span>
          <p class="text-slate-400 mt-2">Carregando worklogs...</p>
        </div>
      {:else}
        <div class="max-h-96 overflow-y-auto space-y-2">
          {#each $jiraWorklogs as worklog}
            <div class="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-white font-medium">{worklog.author.displayName}</p>
                  <p class="text-sm text-slate-400">
                    Issue: {worklog.issueId}
                  </p>
                  {#if worklog.comment}
                    <p class="text-sm text-slate-400 mt-1">
                      {worklog.comment}
                    </p>
                  {/if}
                </div>
                <div class="text-right">
                  <span class="text-[#005BF0] font-bold">
                    {worklog.timeSpent}
                  </span>
                  <p class="text-xs text-slate-500">
                    {formatDate(worklog.started)}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if $jiraWorklogs.length === 0}
          <div class="text-center py-8 text-slate-400">
            <p>Nenhum worklog encontrado para o período selecionado</p>
          </div>
        {/if}

        <Button
          on:click={exportToCSV}
          class="w-full bg-green-600 hover:bg-green-700 mt-4"
        >
          📊 Exportar CSV
        </Button>

        <Button
          on:click={() => jiraConfig.clear()}
          variant="outline"
          class="w-full"
        >
          Desconectar
        </Button>
      {/if}
    </div>
  {/if}
</Card>