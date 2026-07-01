// Configuração da API do Jira
export interface JiraConfig {
  instanceUrl: string;  // Ex: https://seu-instancia.atlassian.net
  email: string;
  apiToken: string;
}

export interface Worklog {
  id: string;
  issueId: string;
  author: {
    displayName: string;
    emailAddress: string;
  };
  timeSpent: string;  // Ex: "2h 30m"
  timeSpentSeconds: number;
  started: string;    // Data ISO
  comment?: string;
}

export interface JiraIssue {
  id: string;
  key: string;        // Ex: PROJ-101
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
  };
}

class JiraApi {
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
  }

  // Autenticação básica com API Token
  private getAuthHeader(): string {
    const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
    return `Basic ${auth}`;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.config.instanceUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jira API error: ${response.status} - ${error}`);
    }

    return response.json();
  }
// Configuração da API do Jira
export interface JiraConfig {
  instanceUrl: string;  // Ex: https://seu-instancia.atlassian.net
  email: string;
  apiToken: string;
}

export interface Worklog {
  id: string;
  issueId: string;
  author: {
    displayName: string;
    emailAddress: string;
  };
  timeSpent: string;  // Ex: "2h 30m"
  timeSpentSeconds: number;
  started: string;    // Data ISO
  comment?: string;
}

export interface JiraIssue {
  id: string;
  key: string;        // Ex: PROJ-101
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
  };
}

class JiraApi {
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
  }

  // Autenticação básica com API Token
  private getAuthHeader(): string {
    const auth = btoa(`${this.config.email}:${this.config.apiToken}`);
    return `Basic ${auth}`;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.config.instanceUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jira API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Buscar worklogs de uma issue específica
  async getIssueWorklogs(issueKey: string): Promise<Worklog[]> {
    const data = await this.request<{ worklogs: Worklog[] }>(
      `/rest/api/2/issue/${issueKey}/worklog`
    );
    return data.worklogs;
  }

  // Buscar worklogs com filtros
  async getWorklogsWithFilters(params: {
    issueKey?: string;
    dateFrom?: string;
    dateTo?: string;
    author?: string;
  }): Promise<Worklog[]> {
    let endpoint = '/rest/api/2/search?jql=';
    const conditions: string[] = [];

    if (params.issueKey) {
      conditions.push(`issue = "${params.issueKey}"`);
    }

    if (params.dateFrom || params.dateTo) {
      let dateCondition = 'worklogDate >= ';
      if (params.dateFrom) {
        dateCondition += `"${params.dateFrom}"`;
      }
      if (params.dateTo) {
        dateCondition += ` AND worklogDate <= "${params.dateTo}"`;
      }
      conditions.push(dateCondition);
    }

    if (params.author) {
      conditions.push(`worklogAuthor = "${params.author}"`);
    }

    if (conditions.length > 0) {
      endpoint += conditions.join(' AND ');
    }

    // Buscar issues que atendem aos critérios
    const data = await this.request<{ issues: JiraIssue[] }>(endpoint);
    
    // Buscar worklogs de cada issue
    const allWorklogs: Worklog[] = [];
    for (const issue of data.issues) {
      const worklogs = await this.getIssueWorklogs(issue.key);
      allWorklogs.push(...worklogs.map(w => ({
        ...w,
        issueId: issue.key,
      })));
    }

    return allWorklogs;
  }

  // Buscar todas as issues de um projeto
  async getIssuesFromProject(projectKey: string): Promise<JiraIssue[]> {
    const data = await this.request<{ issues: JiraIssue[] }>(
      `/rest/api/2/search?jql=project="${projectKey}"`
    );
    return data.issues;
  }

  // Buscar worklogs do usuário atual
  async getMyWorklogs(dateFrom?: string, dateTo?: string): Promise<Worklog[]> {
    const data = await this.request<{ issues: JiraIssue[] }>(
      `/rest/api/2/search?jql=worklogAuthor = currentUser()${dateFrom ? ` AND worklogDate >= "${dateFrom}"` : ''}${dateTo ? ` AND worklogDate <= "${dateTo}"` : ''}`
    );

    const allWorklogs: Worklog[] = [];
    for (const issue of data.issues) {
      const worklogs = await this.getIssueWorklogs(issue.key);
      allWorklogs.push(...worklogs.map(w => ({
        ...w,
        issueId: issue.key,
      })));
    }

    return allWorklogs;
  }

  // Calcular total de horas
  calculateTotalHours(worklogs: Worklog[]): number {
    return worklogs.reduce((total, w) => total + w.timeSpentSeconds, 0) / 3600;
  }

  // Formatar horas para exibição
  formatHours(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Exportar uma instância ou a classe
export { JiraApi };
export default JiraApi;
  // Buscar worklogs de uma issue específica
  async getIssueWorklogs(issueKey: string): Promise<Worklog[]> {
    const data = await this.request<{ worklogs: Worklog[] }>(
      `/rest/api/2/issue/${issueKey}/worklog`
    );
    return data.worklogs;
  }

  // Buscar worklogs com filtros
  async getWorklogsWithFilters(params: {
    issueKey?: string;
    dateFrom?: string;
    dateTo?: string;
    author?: string;
  }): Promise<Worklog[]> {
    let endpoint = '/rest/api/2/search?jql=';
    const conditions: string[] = [];

    if (params.issueKey) {
      conditions.push(`issue = "${params.issueKey}"`);
    }

    if (params.dateFrom || params.dateTo) {
      let dateCondition = 'worklogDate >= ';
      if (params.dateFrom) {
        dateCondition += `"${params.dateFrom}"`;
      }
      if (params.dateTo) {
        dateCondition += ` AND worklogDate <= "${params.dateTo}"`;
      }
      conditions.push(dateCondition);
    }

    if (params.author) {
      conditions.push(`worklogAuthor = "${params.author}"`);
    }

    if (conditions.length > 0) {
      endpoint += conditions.join(' AND ');
    }

    // Buscar issues que atendem aos critérios
    const data = await this.request<{ issues: JiraIssue[] }>(endpoint);
    
    // Buscar worklogs de cada issue
    const allWorklogs: Worklog[] = [];
    for (const issue of data.issues) {
      const worklogs = await this.getIssueWorklogs(issue.key);
      allWorklogs.push(...worklogs.map(w => ({
        ...w,
        issueId: issue.key,
      })));
    }

    return allWorklogs;
  }

  // Buscar todas as issues de um projeto
  async getIssuesFromProject(projectKey: string): Promise<JiraIssue[]> {
    const data = await this.request<{ issues: JiraIssue[] }>(
      `/rest/api/2/search?jql=project="${projectKey}"`
    );
    return data.issues;
  }

  // Buscar worklogs do usuário atual
  async getMyWorklogs(dateFrom?: string, dateTo?: string): Promise<Worklog[]> {
    const data = await this.request<{ issues: JiraIssue[] }>(
      `/rest/api/2/search?jql=worklogAuthor = currentUser()${dateFrom ? ` AND worklogDate >= "${dateFrom}"` : ''}${dateTo ? ` AND worklogDate <= "${dateTo}"` : ''}`
    );

    const allWorklogs: Worklog[] = [];
    for (const issue of data.issues) {
      const worklogs = await this.getIssueWorklogs(issue.key);
      allWorklogs.push(...worklogs.map(w => ({
        ...w,
        issueId: issue.key,
      })));
    }

    return allWorklogs;
  }

  // Calcular total de horas
  calculateTotalHours(worklogs: Worklog[]): number {
    return worklogs.reduce((total, w) => total + w.timeSpentSeconds, 0) / 3600;
  }

  // Formatar horas para exibição
  formatHours(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Exportar uma instância ou a classe
export { JiraApi };
export default JiraApi;