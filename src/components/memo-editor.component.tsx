import { ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';
import { MemoParams, MemoSearchResponse } from 'api/types';
import { usePromiseControl } from 'hooks/usePromiseControl';
import api from 'api';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

type Props = {
  activeMemo: MemoSearchResponse | null;
};

export const MemoEditor = ({ activeMemo }: Props) => {
    const { 
      resolving: isUpdating, 
      value: updatedValue, 
      resolve: updateResolve, 
    } = usePromiseControl({
      fn: (id: number, data: MemoParams) => api.memo.updateMemo(id, data),
    });
  
    const { 
      resolving: isDeleting, 
      resolve: deleteResolve 
    } = usePromiseControl({
      fn: (id: number) => api.memo.deleteMemo(id),
    });
  
    const { 
      value: selectedMemo, 
      resolve: fetchSelectedMemo, 
      setValue: setSelectedMemoValue
    } = usePromiseControl({
      fn: api.memo.getSelectedMemo,
      initialValue: {
        id: 0,
        category_id: 0,
        title: '',
        content: ''
      },
    });
  
  useEffect(() => {
    if (!activeMemo) return;
    fetchSelectedMemo(activeMemo.id);
  }, [activeMemo]);


  useEffect(() => {
    if (!updatedValue) return;
    setSelectedMemoValue(updatedValue);
  }, [updatedValue]);


  if (!activeMemo || !selectedMemo) {
    return <div>Select a memo to edit.</div>;
  }

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedMemoValue({ ...selectedMemo, title: e.target.value });
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedMemoValue({ ...selectedMemo, content: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateResolve(selectedMemo.id, {
        category_id: selectedMemo.category_id,
        title: selectedMemo.title,
        content: selectedMemo.content,
      });
    } catch (error) {
      console.error('Failed to update memo:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResolve(selectedMemo.id);
    } catch (error) {
      console.error('Failed to delete memo:', error);
    }
  };

  return (
    <Wrapper>
      <Input
        id="memo-title"
        type="text"
        value={selectedMemo?.title}
        onChange={handleTitleChange}
        disabled={isUpdating || isDeleting}
        placeholder="Memo Title"
      />
      <TextArea
        id="memo-content"
        value={selectedMemo?.content}
        onChange={handleContentChange}
        disabled={isUpdating || isDeleting}
        placeholder="Memo Content"
      />
      <ButtonGroup>
        <button 
          id="save-memo" 
          onClick={handleSave} 
          disabled={isUpdating || isDeleting || !selectedMemo}
        >
          {isUpdating ? 'Saving...' : 'SAVE'}
        </button>
        <button 
          id="delete-memo" 
          onClick={handleDelete} 
          disabled={isUpdating || isDeleting || !selectedMemo}
        >
          {isDeleting ? 'Deleting...' : 'DELETE'}
        </button>
      </ButtonGroup>
    </Wrapper>
  );
};