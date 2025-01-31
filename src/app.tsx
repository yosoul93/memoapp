import { useState } from 'react';
import styled from 'styled-components';
import { Login } from './components';
import { CategoryContainer } from './containers';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  height: 56px;
  background-color: #2196F3;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.div`
  color: white;
  font-size: 20px;
  font-weight: 500;
  font-family: Roboto, sans-serif;
`;


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Wrapper>
      <Header>
        <HeaderTitle>Memo/App</HeaderTitle>
        <Login onLogin={handleLogin} />
      </Header>

      {isLoggedIn && <CategoryContainer />}
    </Wrapper>
  );
};

export default App;