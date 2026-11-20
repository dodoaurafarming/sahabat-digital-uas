const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost/sahabat-digital-uas/backend';

export interface HealthResponse {
  status: string;
  service: string;
  database: string;
}

export async function checkApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/index.php`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}