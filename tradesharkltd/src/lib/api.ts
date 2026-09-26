export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T = any>(method: string, url: string, body?: any): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  let data: any = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  get: <T = any>(url: string) => request<T>('GET', url),
  post: <T = any>(url: string, body?: any) => request<T>('POST', url, body ?? {}),
  put: <T = any>(url: string, body?: any) => request<T>('PUT', url, body ?? {}),
  patch: <T = any>(url: string, body?: any) => request<T>('PATCH', url, body ?? {}),
  del: <T = any>(url: string) => request<T>('DELETE', url),
  upload: <T = any>(url: string, file: File | Blob, filename?: string) => {
    const fd = new FormData();
    fd.append('file', file, filename || (file as File).name || 'upload.jpg');
    return request<T>('POST', url, fd);
  },
};

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');
