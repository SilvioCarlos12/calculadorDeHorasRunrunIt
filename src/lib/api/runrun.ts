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
	return apiRequest<Activity[]>(endpoint, credentials);
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
	return apiRequest<Task[]>(endpoint, credentials);
}

export async function getCurrentUser(credentials: AuthCredentials): Promise<User> {
	return apiRequest<User>('/users/me', credentials);
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
	return apiRequest<ManualWorkPeriod[]>(endpoint, credentials);
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

