import { writable, derived } from 'svelte/store';
import { JiraApi } from '$lib/api/jira';
import type { Worklog, JiraConfig } from '$lib/api/jira';

// Store para configuração do Jira
function createJiraConfig() {
  const { subscribe, set, update } = writable<JiraConfig | null>(null);

  return {
    subscribe,
    set,
    update,
    clear: () => set(null),
  };
}

// Store para worklogs
function createWorklogs() {
  const { subscribe, set, update } = writable<Worklog[]>([]);

  return {
    subscribe,
    set,
    update,
    clear: () => set([]),
  };
}

// Store para loading
function createLoading() {
  const { subscribe, set } = writable(false);
  return {
    subscribe,
    set,
    loading: (value: boolean) => set(value),
  };
}

// Store para erro
function createError() {
  const { subscribe, set } = writable<string | null>(null);
  return {
    subscribe,
    set,
    error: (message: string) => set(message),
    clear: () => set(null),
  };
}

export const jiraConfig = createJiraConfig();
export const jiraWorklogs = createWorklogs();
export const jiraLoading = createLoading();
export const jiraError = createError();

// Store derivada para total de horas
export const totalHours = derived(jiraWorklogs, ($worklogs) => {
  const api = new JiraApi({ instanceUrl: '', email: '', apiToken: '' });
  return api.calculateTotalHours($worklogs);
});

// Função para buscar worklogs
export async function fetchJiraWorklogs(
  config: JiraConfig,
  filters?: { dateFrom?: string; dateTo?: string }
) {
  jiraLoading.set(true);
  jiraError.clear();

  try {
    const api = new JiraApi(config);
    const worklogs = await api.getMyWorklogs(filters?.dateFrom, filters?.dateTo);
    jiraWorklogs.set(worklogs);
    return worklogs;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar worklogs do Jira';
    jiraError.set(message);
    throw error;
  } finally {
    jiraLoading.set(false);
  }
}