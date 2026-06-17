import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add token to all requests
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      const token: string | null = await getToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log requests in development
      if (__DEV__) {
        console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token expiration and errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Handle 401 Unauthorized - Token expired or invalid
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear stored auth data
        await AsyncStorage.multiRemove(['userToken', 'userData']);
        
        // You could implement token refresh logic here
        // For now, just reject and let the auth context handle logout
        return Promise.reject(error);
      }
      
      // Handle other errors
      if (error.response) {
        console.error('Response error:', {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error('Network error: No response received');
      } else {
        console.error('Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Export the API instance
export const rootApi: AxiosInstance = createAxiosInstance(
  "http://192.168.88.20:8080/",
);

// Optional: Create additional instances for different base URLs
export const createCustomInstance = (baseURL: string): AxiosInstance => {
  return createAxiosInstance(baseURL);
};
