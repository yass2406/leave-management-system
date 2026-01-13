const API_BASE = "http://localhost:8080/leave-management-backend/api";

export type User = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  role: "EMPLOYEE" | "MANAGER" | "HR";
  departmentId: string | null;
};

export async function loginAndFetchUser(
  username: string,
  password: string
): Promise<{ user: User; authHeader: string }> {
  const authString = `${username}:${password}`;
  const authHeader = "Basic " + btoa(authString);

  const response = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: authHeader,
    },
  });

  if (response.status === 401) {
    throw new Error("Invalid credentials");
  }
  if (response.status === 403) {
    throw new Error("User is authenticated but not allowed");
  }
  if (!response.ok) {
    throw new Error("Unexpected error: " + response.status);
  }

  const data = (await response.json()) as User;
  return { user: data, authHeader };
}

export function getStoredUser(): User | null {
  const stored = sessionStorage.getItem("lm_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}
