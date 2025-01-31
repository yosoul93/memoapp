import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { MemoParams, MemoSearchResponse } from 'api/types';
import { usePromiseControl } from 'hooks/usePromiseControl';
import api from 'api';

const Wrapper = styled.nav`
  padding: 1rem;
`;

const CategoryTitle = styled.div`
  padding: 0.5rem;
  background-color: #f8f9fa;
  cursor: pointer;
  border: 1px solid #ced4da;
  border-radius: 4px;

  &.active {
    background-color: #d1e7dd;
  }

  &:hover {
    background-color: #e2e6ea;
  }
`;

const MemoItemWrapper = styled.ul`
  list-style: none;
  padding-left: 1rem;
  margin-top: 0.5rem;
`;

const MemoItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #374151;

  &.active {
    background-color: #e3f2fd;
    color: #2563eb;
  }

  &:hover {
    color: #0d6efd;
  }
`;

const CategoryItemWrapper = styled.li`
  margin-bottom: 0.5rem;
`;


const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const NewMemoButton = styled.button`
  padding: 6px 12px;
  margin: 8px 0;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: #E0E0E0;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #45a049;
  }
`;

type Props = {
  selectedMemoId?: number;
  onCategoryClick: () => void;
  onMemoSelect: (memo: MemoSearchResponse | null) => void;
};

export const CategoryList = ({ 
  selectedMemoId,
  onCategoryClick, 
  onMemoSelect 
}: Props) =>  {

    const [expandedCategoryId, setExpandedCategoryId] = useState<number>();
    
    const {
      value: categories,
      resolving: isLoadingCategories,
    } = usePromiseControl({
      fn: api.category.getCategories,
      initialValue: [],
      resolveOnMounted: true,
    });
  
    const {
      value: memosByCategory,
      resolve: fetchMemosByCategory,
      resolving: isLoadingMemos,
    } = usePromiseControl({
      fn: (categoryId: number) => api.memo.searchMemos(categoryId),
      noConcurrency: false,
    });
  
    const {
      value: newMemo,
      resolve: createMemo,
      resolving: isCreatingMemo,
    } = usePromiseControl({
      fn: (data: MemoParams) => api.memo.createMemo(data),
    });

  const handleCreateMemo = async () => {
    if(!expandedCategoryId) return;
    try {
      await createMemo({
        category_id: expandedCategoryId,
        title: 'New Memo',
        content: '',
      });
      await fetchMemosByCategory(expandedCategoryId);
    } catch (error) {
      console.error('Failed to add memo:', error);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    const isExpanded = expandedCategoryId === categoryId;
    setExpandedCategoryId(isExpanded ? undefined : categoryId);
    onCategoryClick();
    if (isExpanded) return;
    fetchMemosByCategory(categoryId);
  };

  useEffect(() => {
    if (!newMemo) return;
    onMemoSelect(newMemo);
  }, [newMemo, onMemoSelect]);

  if (isLoadingCategories) return <div>Loading categories...</div>;
  if (!categories?.length) return <div>No categories found.</div>;
  
  return (
    <Wrapper>
      <List>
        {categories.map((category) => (
          <CategoryItemWrapper id={`category-${category.id}`} key={category.id}>
            <CategoryTitle
              id={`category-${category.id}-title`}
              className={expandedCategoryId === category.id ? 'active' : ''}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </CategoryTitle>
            
            {expandedCategoryId === category.id && (
              <MemoItemWrapper>
                {isLoadingMemos ? 
                  <span>Loading memos...</span> 
                  : (
                    <>
                      {memosByCategory && memosByCategory?.length === 0 && <span>No memos found.</span>}
                      {memosByCategory && memosByCategory?.length > 0 && memosByCategory.map((memo) => (
                        <MemoItem
                          key={memo.id}
                          className={memo.id === selectedMemoId ? 'active' : ''}
                          onClick={() => onMemoSelect(memo)}
                        >
                          {memo.title}
                        </MemoItem>
                      ))}
                    </>
                  )
                }
              </MemoItemWrapper>
            )}
          </CategoryItemWrapper>
        ))}
      </List>

      <NewMemoButton
        id="new-memo"
        onClick={handleCreateMemo}
        disabled={!expandedCategoryId || isLoadingMemos || isCreatingMemo}
      >
        NEW
      </NewMemoButton>
    </Wrapper>
  );
}