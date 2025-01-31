import { fetchApi } from "./fetch";
import { MemoSearchResponse, MemoParams, MemoResponse } from "./types";

export default {
  searchMemos: (category_id: number): Promise<MemoSearchResponse[]> => {
    return fetchApi({
      url: `/memo?category_id=${category_id}`,
      method: 'GET',
    });
  },
  createMemo: (data: MemoParams): Promise<MemoResponse> => {
    return fetchApi({
      url: '/memo',
      method: 'POST',
      data,
    });
  },
  getSelectedMemo: (id: number): Promise<MemoResponse> => {
    return fetchApi({
      url: `/memo/${id}`,
      method: 'GET',
    });
  },
  updateMemo: (id: number, data: MemoParams): Promise<MemoResponse> => {
    return fetchApi({
      url: `/memo/${id}`,
      method: 'PUT',
      data,
    });
  },
  deleteMemo: (id: number): Promise<void> => {
    return fetchApi({
      url: `/memo/${id}`,
      method: 'DELETE',
    });
  },
}