const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
    const { method = 'GET', body, isFormData = false, params } = options;
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

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  get(endpoint, params) {
    return this.request(endpoint, { params });
  }

  post(endpoint, body, isFormData = false) {
    return this.request(endpoint, { method: 'POST', body, isFormData });
  }

  put(endpoint, body, isFormData = false) {
    return this.request(endpoint, { method: 'PUT', body, isFormData });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.post('/upload', formData, true);
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

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const result = await this.post('/upload', formData, true);
    return { file_url: result.file_url };
  }
}

export const api = new ApiClient();
