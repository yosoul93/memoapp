import { useState } from 'react';
import { MemoSearchResponse } from '../api/types';
import { CategoryList,  MemoEditor } from '../components';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
`;

const Sidebar = styled.aside`
  width: 256px;
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
`;

const AreaWrapper = styled.main`
  flex: 1;
  padding: 1rem;
`;

export const CategoryContainer = () => {
  const [activeMemo, setActiveMemo] = useState<MemoSearchResponse | null>(null);

  return (
    <Wrapper>
      <Sidebar>
        <CategoryList
          onCategoryClick={() => setActiveMemo(null)}
          selectedMemoId={activeMemo?.id}
          onMemoSelect={setActiveMemo}
        />
      </Sidebar>
      
      <AreaWrapper>
        <MemoEditor activeMemo={activeMemo} />
      </AreaWrapper>
    </Wrapper>
  );
};