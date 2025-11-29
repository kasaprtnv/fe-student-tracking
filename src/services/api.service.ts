import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Temporary token for development
const DEV_TOKEN =
  'eyJhbGciOiJIUzI1NiIsImtpZCI6IjBwUHhIYkhveGdPRjZNQWkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2phdWZ3YWdqeGpvZG96d2RqaXBrLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJiMGNmYzhmZi00OGFkLTQ5NTEtOGE2ZC02ZDgwMTA1MmY0OWYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY0MjYwNjUzLCJpYXQiOjE3NjQyNTcwNTMsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6ImIwY2ZjOGZmLTQ4YWQtNDk1MS04YTZkLTZkODAxMDUyZjQ5ZiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzY0MjU3MDUzfV0sInNlc3Npb25faWQiOiJkNGYzOGMyNC1iZTQ0LTRlOGEtOWI0ZC04ZjhkOGQzN2YwYjYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.RAbFqTaqZWvHjzDtOnu_-8JlrA4uznJj24L6EoQS_fA';

export abstract class APIService {
  protected baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${DEV_TOKEN}`,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const currentPath = window.location.pathname;
          window.location.replace(
            `/${currentPath ? `?next_path=${currentPath}` : ``}`,
          );
        }
        return Promise.reject(error);
      },
    );
  }

  get(url: string, params = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.get(url, {
      ...params,
      ...config,
    });
  }

  post(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.put(url, data, config);
  }

  patch(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.patch(url, data, config);
  }

  delete(url: string, data?: unknown, config: AxiosRequestConfig = {}) {
    return this.axiosInstance.delete(url, { data, ...config });
  }

  request(config = {}) {
    return this.axiosInstance(config);
  }
}
