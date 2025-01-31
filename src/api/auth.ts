import { setAccessToken } from './fetch';

export default {
  login: (token: string): Promise<void> =>
    // fake and set the access token and also resolve the Promise
    new Promise((resolve) => {
      setAccessToken(token);
      resolve();
    }),
};
