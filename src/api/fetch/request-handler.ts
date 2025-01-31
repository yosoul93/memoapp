import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { HandlerConfig } from './types';

export class RequestHandler {
  baseURL: string;

  tried: number;

  retryTimes: number;

  retryDelay: number;

  reqConf: AxiosRequestConfig = {};

  instance: AxiosInstance;

  customErrorHandler: HandlerConfig['customErrorHandler'];

  constructor(config: HandlerConfig) {
    const { baseURL = '', retryDelay = 0, retryTimes = 0 } = config;
    this.baseURL = baseURL;
    this.retryTimes = retryTimes;
    this.retryDelay = retryDelay;
    this.customErrorHandler = config.customErrorHandler;

    this.tried = 0;
    this.instance = config.instance;

    this.setupReqConfig(config);
  }

  setupReqConfig(config: HandlerConfig) {
    const reqConf = {
      baseURL: this.baseURL,
      headers: {},
      ...config,
    };

    reqConf.headers = {
      ...reqConf.headers,
      'origin-url': window.location.href,
      'Access-Control-Allow-Origin': '*',
    };

    this.reqConf = reqConf;
  }

  run<T = unknown>(): Promise<T> {
    return this.instance
      .request(this.reqConf)
      .then((res) => res.data)
      .catch((e: AxiosError<Error>) => {
        if (!this.customErrorHandler) {
          return this.defaultErrorHandler(e);
        }
        let doDefault = false;
        const customResult = this.customErrorHandler(e, () => {
          doDefault = true;
        });
        if (doDefault) return this.defaultErrorHandler(e);
        return customResult;
      });
  }

  defaultErrorHandler(e: AxiosError) {
    const httpStatus = e?.response?.status;

    // no retry for 4xx error, which is correct server response
    if (httpStatus && httpStatus >= 400 && httpStatus < 500) throw e;

    // meet retryTimes, throw error.
    if (this.tried >= this.retryTimes) throw e;

    this.tried += 1;
    // chain retry run
    return new Promise((resolve, reject) =>
      setTimeout(() => {
        this.run().then(resolve).catch(reject);
      }, this.getRetryDelay()),
    );
  }

  getRetryDelay() {
    if (typeof this.retryDelay === 'number') return this.retryDelay;
    // delay based on tried times
    const n = 3 ** (this.tried + 1) + Math.random();
    return Math.round(n * 1000);
  }
}