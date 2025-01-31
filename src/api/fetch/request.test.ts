import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { request } from './request';

function getMock() {
  const instance = axios.create();
  const mock = new AxiosMockAdapter(instance);
  // setup basic mock
  mock.onGet('/network-error').networkError();
  mock.onGet('/500-error').reply(500);
  mock.onGet('/400-error').reply(400);

  return [instance, mock] as const;
}

test('network error retry', async () => {
  const [instance, mock] = getMock();
  await expect(
    request({
      url: '/network-error',
      retryDelay: 0,
      retryTimes: 2,
      instance,
    }),
  ).rejects.toThrow();
  expect(mock.history.get.length).toBe(3);
  mock.resetHistory();
});

test('5xx error retry', async () => {
  const [instance, mock] = getMock();
  await expect(
    request({
      url: '/500-error',
      retryDelay: 0,
      retryTimes: 2,
      instance,
    }),
  ).rejects.toThrow();
  expect(mock.history.get.length).toBe(3);
});

test('5xx error no retry by default', async () => {
  const [instance, mock] = getMock();
  await expect(
    request({
      url: '/500-error',
      retryDelay: 0,
      instance,
    }),
  ).rejects.toThrow();
  expect(mock.history.get.length).toBe(1);
});

test('4xx error no retry', async () => {
  const [instance, mock] = getMock();
  await expect(
    request({
      url: '/400-error',
      retryDelay: 0,
      retryTimes: 2,
      instance,
    }),
  ).rejects.toThrow();
  expect(mock.history.get.length).toBe(1);
});
