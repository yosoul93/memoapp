import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

export interface FetchApiConfig extends AxiosRequestConfig {
  retryTimes?: number;
  retryDelay?: number; // ms
}

export interface HandlerConfig extends AxiosRequestConfig {
  retryTimes?: number;
  retryDelay?: number; // ms
  instance: AxiosInstance;
  customErrorHandler?: (
    e: AxiosError<Error>,
    doDefaultHandling: () => void,
  ) => void;
}
