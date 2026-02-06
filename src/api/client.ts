const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    // Обработка 401 - перенаправление на логин
    if (response.status === 401) {
      if (this.getAuthToken()) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      throw new Error('Требуется авторизация');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
      throw new Error(error.error || 'Ошибка запроса');
    }

    return response.json();
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Printers
  async getPrinters() {
    return this.request('/printers');
  }

  async getPrinter(id: string) {
    return this.request(`/printers/${id}`);
  }

  async createPrinter(printer: any) {
    return this.request('/printers', {
      method: 'POST',
      body: JSON.stringify(printer),
    });
  }

  async updatePrinter(id: string, printer: any) {
    return this.request(`/printers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(printer),
    });
  }

  async deletePrinter(id: string) {
    return this.request(`/printers/${id}`, {
      method: 'DELETE',
    });
  }

  // Packaging
  async getPackaging() {
    return this.request('/packaging');
  }

  async getPackagingItem(id: string) {
    return this.request(`/packaging/${id}`);
  }

  async createPackaging(packaging: any) {
    return this.request('/packaging', {
      method: 'POST',
      body: JSON.stringify(packaging),
    });
  }

  async updatePackaging(id: string, packaging: any) {
    return this.request(`/packaging/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packaging),
    });
  }

  async deletePackaging(id: string) {
    return this.request(`/packaging/${id}`, {
      method: 'DELETE',
    });
  }

  // Models
  async getModels() {
    return this.request('/models');
  }

  async getModel(id: string) {
    return this.request(`/models/${id}`);
  }

  async createModel(model: any) {
    return this.request('/models', {
      method: 'POST',
      body: JSON.stringify(model),
    });
  }

  async updateModel(id: string, model: any) {
    return this.request(`/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(model),
    });
  }

  async deleteModel(id: string) {
    return this.request(`/models/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(category: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient();
