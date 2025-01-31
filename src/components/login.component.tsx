import { useState } from 'react';
import styled from 'styled-components';
import { usePromiseControl } from 'hooks/usePromiseControl';
import api from 'api';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TokenInput = styled.input`
  padding: 6px 8px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
  background: white;
  
  &:disabled {
    background-color: #F5F5F5;
    cursor: not-allowed;
  }
`;

const LoginButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: #43A047;
  }
    
  &:disabled {
    background-color: #E0E0E0;
    cursor: not-allowed;
  }
`;

type Props = {
  onLogin: () => void;
};

export const Login = ({ onLogin }: Props) => {
  const [token, setToken] = useState<string>('');
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const isValidToken = UUID_V4_REGEX.test(token);

    const {
      resolving: isLoading,
      resolve: doLogin,
    } = usePromiseControl({
      fn: (token: string) => api.auth.login(token),
    });
  

  const onSubmit = async () => {
    setIsDisabled(true);
    try {
      await doLogin(token);
      onLogin();
    } catch (error) {
      console.error('Login failed:', error);
      setIsDisabled(false);
    }
  };

  return (
    <Wrapper>
      <TokenInput
        id="access_token"
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        disabled={isLoading || isDisabled}
        placeholder="Enter UUID v4 Token"
      />
      <LoginButton
        id="login"
        onClick={onSubmit}
        disabled={!isValidToken || isLoading || isDisabled}
      >
        {isLoading ? 'Logging in...' : 'LOGIN'}
      </LoginButton>
    </Wrapper>
  );
};