import type { RequestHandler } from '@sveltejs/kit';

// Configuração de CORS para a resposta
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Endpoint para buscar worklogs
export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { instanceUrl, email, apiToken, dateFrom, dateTo } = body;

        // Validar credenciais
        if (!instanceUrl || !email || !apiToken) {
            return new Response(
                JSON.stringify({ error: 'Credenciais incompletas' }),
                { 
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                }
            );
        }

        // Construir a query JQL
        let jql = 'worklogAuthor = currentUser()';
        if (dateFrom) {
            jql += ` AND worklogDate >= "${dateFrom}"`;
        }
        if (dateTo) {
            jql += ` AND worklogDate <= "${dateTo}"`;
        }

        // Buscar issues com worklogs
        const searchUrl = `${instanceUrl}/rest/api/2/search?jql=${encodeURIComponent(jql)}&fields=id,key,summary,status,assignee&maxResults=100`;
        
        const auth = btoa(`${email}:${apiToken}`);
        const searchResponse = await fetch(searchUrl, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            throw new Error(`Jira API error: ${searchResponse.status} - ${errorText}`);
        }

        const searchData = await searchResponse.json();
        const issues = searchData.issues || [];

        // Buscar worklogs de cada issue
        const allWorklogs = [];
        for (const issue of issues) {
            const worklogUrl = `${instanceUrl}/rest/api/2/issue/${issue.key}/worklog`;
            const worklogResponse = await fetch(worklogUrl, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                }
            });

            if (worklogResponse.ok) {
                const worklogData = await worklogResponse.json();
                const worklogs = worklogData.worklogs || [];
                
                // Filtrar worklogs do usuário
                const userWorklogs = worklogs.filter((w: any) => 
                    w.author.emailAddress === email
                );

                for (const w of userWorklogs) {
                    allWorklogs.push({
                        id: w.id,
                        issueId: issue.key,
                        author: {
                            displayName: w.author.displayName,
                            emailAddress: w.author.emailAddress
                        },
                        timeSpent: w.timeSpent,
                        timeSpentSeconds: w.timeSpentSeconds,
                        started: w.started,
                        comment: w.comment
                    });
                }
            }
        }

        return new Response(
            JSON.stringify({ 
                worklogs: allWorklogs,
                total: allWorklogs.length
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            }
        );

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar worklogs';
        return new Response(
            JSON.stringify({ error: message }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            }
        );
    }
};

// Suporte para OPTIONS (preflight)
export const OPTIONS: RequestHandler = async () => {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
};