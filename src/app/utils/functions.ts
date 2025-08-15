import { environment } from '@environments/environment';

export const BUILD_ROUTE = (relativeUrl: string, period?: number, studentOrStatus?: number | string, isStudent = false): string => {
	const mainURL: string = environment.url;
	let route: string = `${mainURL}/api/`;
	// Agregar el nombre proporcionado
	route += relativeUrl;
	if (period) {
		route += `/${period}`;
	}
	if (isStudent && studentOrStatus) {
		route += `/${studentOrStatus}`;
		return route;
	}
	if (!isStudent && studentOrStatus) {
		route += `?status=${studentOrStatus}`;
		return route;
	}
	return route;
}

export const localToSessionStorage = (): void => {
	for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let value = localStorage.getItem(key);
    sessionStorage.setItem(key, value);
	}
}
