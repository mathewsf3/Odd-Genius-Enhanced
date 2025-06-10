import axios, { AxiosRequestConfig, Method } from 'axios';
import { memoryCache } from './cache';

interface CachedResponse<T> {
  data: T;
  timestamp: number;
}

export const cachedApiRequest = async <T>(
  method: Method,
  url: string,
  data?: any,
  cacheTTL?: number,
  config?: AxiosRequestConfig
): Promise<T> => {
  // If cacheTTL is provided and it's a GET request, try to get from cache
  if (cacheTTL && method.toLowerCase() === 'get') {
    const cacheKey = `${method}-${url}`;
    const cachedData = memoryCache.get<CachedResponse<T>>(cacheKey, cacheTTL);
    
    if (cachedData) {
      return cachedData.data;
    }
  }

  try {
    const response = await axios({
      method,
      url,
      data,
      ...config
    });

    // If cacheTTL is provided and it's a GET request, cache the response
    if (cacheTTL && method.toLowerCase() === 'get') {
      const cacheKey = `${method}-${url}`;
      const cacheData: CachedResponse<T> = {
        data: response.data,
        timestamp: Date.now()
      };
      memoryCache.set(cacheKey, cacheData);
    }

    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const apiRequest = async <T>(
  method: Method,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axios({
      method,
      url,
      data,
      ...config
    });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Export memoryCache and apiClient as a constant for backwards compatibility
export const apiClient = { 
  get: <T>(url: string, config?: AxiosRequestConfig) => apiRequest<T>('get', url, undefined, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiRequest<T>('post', url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => apiRequest<T>('put', url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => apiRequest<T>('delete', url, undefined, config)
};

// Export memoryCache for backward compatibility
export { memoryCache };
