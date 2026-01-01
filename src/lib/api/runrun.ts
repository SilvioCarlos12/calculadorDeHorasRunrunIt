const BASE_URL = 'https://runrun.it/api/v1.0';

export interface AuthCredentials {
	appKey: string;
	userToken: string;
}

export interface Activity {
	id: number;
	task_id: number;
	user_id: number;
	time_worked: number;
	created_at: string;
	updated_at: string;
}

export interface Task {
	id: number;
	title: string;
	project_id: number;
	project_name: string;
	client_name: string;
	state: string;
	desired_date: string | null;
	desired_start_date: string | null;
	is_working_on: boolean;
	priority: number;
	time_worked: number;
	estimated_delivery_date: string | null;
	created_at: string;
	assignments: TaskAssignment[];
}

export interface TaskAssignment {
	id: number;
	user_id: number;
	task_id: number;
	state: string;
	time_worked: number;
}

export interface User {
	id: string;
	name: string;
	email: string;
}

async function apiRequest<T>(
	endpoint: string,
	credentials: AuthCredentials,
	options: RequestInit = {}
): Promise<T> {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		...options,
		headers: {
			'App-Key': credentials.appKey,
			'User-Token': credentials.userToken,
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`API Error: ${response.status} - ${error}`);
	}

	return response.json();
}

export async function getActivities(
	credentials: AuthCredentials,
	params: {
		start_date?: string;
		end_date?: string;
		limit?: number;
		page?: number;
		user_id?: string;
	} = {}
): Promise<Activity[]> {
	const searchParams = new URLSearchParams();
	
	if (params.start_date) searchParams.append('start_date', params.start_date);
	if (params.end_date) searchParams.append('end_date', params.end_date);
	if (params.limit) searchParams.append('limit', params.limit.toString());
	if (params.page) searchParams.append('page', params.page.toString());
	if (params.user_id) searchParams.append('user_id', params.user_id);

	const query = searchParams.toString();
	const endpoint = `/activities${query ? `?${query}` : ''}`;
	// #region agent log
	fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getActivities',message:'Calling activities API',data:{endpoint,params,hasAppKey:!!credentials.appKey,hasUserToken:!!credentials.userToken},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D,E,F'})}).catch(()=>{});
	// #endregion
	try {
		const result = await apiRequest<Activity[]>(endpoint, credentials);
		// #region agent log
		fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getActivities',message:'Activities API success',data:{resultLength:result.length,firstItem:result[0]},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
		// #endregion
		return result;
	} catch (err) {
		// #region agent log
		fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getActivities',message:'Activities API error',data:{error:String(err),endpoint},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D,E,F'})}).catch(()=>{});
		// #endregion
		throw err;
	}
}

export async function getTasks(
	credentials: AuthCredentials,
	params: {
		is_closed?: boolean;
		limit?: number;
		page?: number;
		sort?: string;
		sort_dir?: 'asc' | 'desc';
		responsible_id?: string;
	} = {}
): Promise<Task[]> {
	const searchParams = new URLSearchParams();
	
	if (params.is_closed !== undefined) searchParams.append('is_closed', params.is_closed.toString());
	if (params.limit) searchParams.append('limit', params.limit.toString());
	if (params.page) searchParams.append('page', params.page.toString());
	if (params.sort) searchParams.append('sort', params.sort);
	if (params.sort_dir) searchParams.append('sort_dir', params.sort_dir);
	if (params.responsible_id) searchParams.append('responsible_id', params.responsible_id);

	const query = searchParams.toString();
	const endpoint = `/tasks${query ? `?${query}` : ''}`;
	// #region agent log
	fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getTasks',message:'Calling tasks API',data:{endpoint,params},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
	// #endregion
	const result = await apiRequest<Task[]>(endpoint, credentials);
	// #region agent log
	fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getTasks',message:'Tasks API response',data:{resultLength:result.length,firstTask:result[0]?{id:result[0].id,title:result[0].title,state:result[0].state}:null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
	// #endregion
	return result;
}

export async function getCurrentUser(credentials: AuthCredentials): Promise<User> {
	const user = await apiRequest<User>('/users/me', credentials);
	// #region agent log
	fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getCurrentUser',message:'User data from API',data:{user,userId:user.id,userIdType:typeof user.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'USER'})}).catch(()=>{});
	// #endregion
	return user;
}

export interface ManualWorkPeriod {
	id: number;
	user_id: string;
	task_id: number;
	seconds: number; // horas em segundos
	date_to_apply: string; // data do lançamento (YYYY-MM-DD)
	worker_name?: string;
	team_name?: string;
}

export async function getManualWorkPeriods(
	credentials: AuthCredentials,
	params: {
		start_date?: string;
		end_date?: string;
		user_id?: string;
		limit?: number;
		page?: number;
	} = {}
): Promise<ManualWorkPeriod[]> {
	const searchParams = new URLSearchParams();
	
	if (params.start_date) searchParams.append('start_date', params.start_date);
	if (params.end_date) searchParams.append('end_date', params.end_date);
	if (params.user_id) searchParams.append('user_id', params.user_id);
	if (params.limit) searchParams.append('limit', params.limit.toString());
	if (params.page) searchParams.append('page', params.page.toString());

	const query = searchParams.toString();
	const endpoint = `/manual_work_periods${query ? `?${query}` : ''}`;
	
	// #region agent log
	fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getManualWorkPeriods',message:'Calling manual_work_periods API',data:{endpoint,params},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H2'})}).catch(()=>{});
	// #endregion
	
	try {
		const result = await apiRequest<ManualWorkPeriod[]>(endpoint, credentials);
		// #region agent log
		const allDates = result.map(r => r.date_to_apply).sort();
		const uniqueDates = [...new Set(allDates)];
		fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getManualWorkPeriods',message:'Manual work periods success',data:{count:result.length,uniqueDates,dateRange:{min:allDates[0],max:allDates[allDates.length-1]},firstFull:result[0],lastFull:result[result.length-1]},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5,H6,H7'})}).catch(()=>{});
		// #endregion
		return result;
	} catch (err) {
		// #region agent log
		fetch('http://127.0.0.1:7243/ingest/38ce56c4-b8ef-4daa-9e72-afa7deb0ee71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runrun.ts:getManualWorkPeriods',message:'Manual work periods error',data:{error:String(err)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
		// #endregion
		throw err;
	}
}

export async function validateCredentials(credentials: AuthCredentials): Promise<boolean> {
	try {
		await getCurrentUser(credentials);
		return true;
	} catch {
		return false;
	}
}

// Helpers
export function getMonthDateRange(): { start_date: string; end_date: string } {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	
	const start = new Date(year, month, 1);
	const end = new Date(year, month + 1, 0);
	
	return {
		start_date: start.toISOString().split('T')[0],
		end_date: end.toISOString().split('T')[0]
	};
}

export function formatSecondsToHours(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	return `${hours}h ${minutes}m`;
}

export function getDaysOverdue(desiredDate: string): number {
	const desired = new Date(desiredDate);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	desired.setHours(0, 0, 0, 0);
	
	const diffTime = today.getTime() - desired.getTime();
	return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isTaskOverdue(task: Task): boolean {
	if (!task.desired_date || task.state === 'done') return false;
	return getDaysOverdue(task.desired_date) > 0;
}

