export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LoginApiResponse {
  status: string;
  email: string;
  privileges: string[];
  api_key: string;
}

class ApiClient {
  private baseUrl: string;
  private sessionKey: string | null = null;
  private userEmail: string | null = null;

  constructor(baseUrl = '/admin') {
    this.baseUrl = baseUrl;
    this.sessionKey = localStorage.getItem('session_key');
    this.userEmail = localStorage.getItem('user_email');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // For form data requests, don't set Content-Type
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Use Basic Auth with email:api_key for authenticated requests
    if (this.sessionKey && this.userEmail) {
      const credentials = btoa(`${this.userEmail}:${this.sessionKey}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle plain text responses
        const text = await response.text();
        data = text;
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
          // Redirect to login page if we're not already there
          if (!window.location.hash.includes('login')) {
            window.location.hash = '#/login';
          }
          throw new Error('Authentication failed');
        }
        
        // Try to get error message from response
        const errorMessage = typeof data === 'object' && data.reason 
          ? data.reason 
          : `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    let body;
    let headers: Record<string, string> = {};

    if (data instanceof FormData) {
      body = data;
      // Don't set Content-Type for FormData, let browser set it with boundary
    } else if (data) {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body,
      headers,
    });
  }

  async login(email: string, password: string, token?: string): Promise<ApiResponse<LoginApiResponse>> {
    // Mail-in-a-Box uses Basic Auth for login
    const credentials = btoa(`${email}:${password}`);
    const headers: Record<string, string> = {
      'Authorization': `Basic ${credentials}`,
    };

    if (token) {
      headers['X-Auth-Token'] = token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers,
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { status: 'error', reason: text };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.reason || `Authentication failed: ${response.status}`
        };
      }

      if (data.status === 'ok' && data.api_key) {
        this.sessionKey = data.api_key;
        this.userEmail = email; // Store the email for future API calls
        localStorage.setItem('session_key', data.api_key);
        localStorage.setItem('user_email', email);
        return { success: true, data };
      } else if (data.status === 'missing-totp-token') {
        return {
          success: false,
          error: 'missing-totp-token'
        };
      } else {
        return {
          success: false,
          error: data.reason || 'Login failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  logout(): void {
    this.sessionKey = null;
    this.userEmail = null;
    localStorage.removeItem('session_key');
    localStorage.removeItem('user_email');
  }

  isAuthenticated(): boolean {
    return !!this.sessionKey;
  }
}

export const api = new ApiClient();
