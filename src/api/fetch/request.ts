import { RequestHandler } from './request-handler';
import type { HandlerConfig } from './types';

export function request<T = unknown>(config: HandlerConfig) {
  return new RequestHandler(config).run<T>();
}