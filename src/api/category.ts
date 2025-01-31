import { fetchApi } from "./fetch";
import { CategoryResponse } from "./types";

export default {
  getCategories: (): Promise<CategoryResponse[]> => {
    return fetchApi({
      url: '/category',
      method: 'GET',
    });
  }
}