import axios, { AxiosError } from 'axios';
import { request } from './request';
import type { FetchApiConfig, HandlerConfig } from './types';

let accessToken: string = '';

export const setAccessToken = (token?: string) => {
  if (!token) return
  accessToken = token;
};

// Implement customErrorHandler for handling any custom error
const customErrorHandler: HandlerConfig['customErrorHandler'] = (
  e,
  doDefaultHandling,
) => {
  return doDefaultHandling();
};

export async function fetchApi<T = unknown>(config: FetchApiConfig): Promise<T> {
  const handlerConfig: HandlerConfig = {
    ...config,
    baseURL: process.env.REACT_APP_BASE_API_URL,
    instance: axios.create(),
    customErrorHandler,
    headers: {
      ...config?.headers,
      'X-ACCESS-TOKEN': accessToken,
      'Content-Type': 'application/json',
    },
  };

  return request<T>(handlerConfig).catch((e: AxiosError) => {
    throw e;
  });
}