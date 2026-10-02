const API_BASE = import.meta.env.VITE_API_URL || '/api';

const DEFAULT_TIMEOUT_MS = 20000;

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('jwt_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      localStorage.removeItem('jwt_token');
    }
  }

  async request(endpoint, options = {}) {
    const { method = 'GET', body, isFormData = false, params, timeout = DEFAULT_TIMEOUT_MS } = options;
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    let response;
    try {
      response = await fetch(url, config);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('The server took too long to respond. Please try again.');
      }
      throw new Error('Unable to reach the server. Check your connection and try again.');
    } finally {
      clearTimeout(timer);
    }

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }

    if (data === null && contentType.includes('application/json')) {
      throw new Error('The server returned an unreadable response.');
    }

    return data;
  }

  /**
   * Resolves with `{ data, error }` instead of throwing, so one failing
   * endpoint cannot blank out unrelated sections of a page.
   */
  async safeGet(endpoint, params) {
    try {
      const data = await this.get(endpoint, params);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  }

  get(endpoint, params) {
    return this.request(endpoint, { params });
  }

  post(endpoint, body, isFormData = false) {
    return this.request(endpoint, { method: 'POST', body, isFormData, timeout: 60000 });
  }

  put(endpoint, body, isFormData = false) {
    return this.request(endpoint, { method: 'PUT', body, isFormData, timeout: 60000 });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  upload(file, folder) {
    const formData = new FormData();
    formData.append('file', file);
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    return this.post(`/upload${query}`, formData, true);
  }

  /**
   * Downloads a binary response as a file. Used for the vote export, which
   * returns a ZIP rather than JSON.
   *
   * @param {string} endpoint
   * @param {string} fallbackName used if the server sends no filename
   */
  async download(endpoint, fallbackName = 'download') {
    const token = this.getToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);

    let response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('The export took too long to download. Please try again.');
      }
      throw new Error('Unable to reach the server. Check your connection and try again.');
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || `Export failed with status ${response.status}`);
    }

    // Prefer the filename the server chose so the date stays accurate.
    const disposition = response.headers.get('content-disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename = match ? match[1] : fallbackName;

    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    return { filename, bytes: blob.size };
  }

  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  register(email, password, name) {
    return this.post('/auth/register', { email, password, name });
  }

  me() {
    return this.get('/auth/me');
  }

  async uploadFile(file, folder) {
    const result = await this.upload(file, folder);
    return { file_url: result.file_url };
  }
}

export const api = new ApiClient();