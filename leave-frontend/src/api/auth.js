const API_BASE = 'http://localhost:8080/leave-management-backend/api';

export async function fetchCurrentUser(username, password) {
  const authString = `${username}:${password}`;
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(authString));

  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers,
  });

  if (response.status === 401) {
    throw new Error('Invalid credentials');
  }
  if (response.status === 403) {
    throw new Error('Not allowed for this user');
  }
  if (!response.ok) {
    throw new Error('Unexpected error: ' + response.status);
  }

  const data = await response.json();
  // Attach basic auth for later calls if you want
  return { user: data, authHeader: 'Basic ' + btoa(authString) };
}
