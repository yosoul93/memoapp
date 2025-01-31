/**
 * Represents a category response from the API
 * @interface CategoryResponse
 */
export interface CategoryResponse {
  readonly id: number;
  readonly name: string;
}

/**
 * Base interface for memo properties
 */
interface MemoBase {
  category_id: number;
  title: string;
  content: string;
}

/**
 * Light version of memo for list views
 * Contains only id and title
 */
export interface MemoSearchResponse {
  readonly id: number;
  readonly title: string;
}

/**
 * Represents a memo response from the API
 */
export interface MemoResponse extends Readonly<MemoBase & {
  id: number;
}> {}

/**
 * Parameters for creating/updating a memo
 */
export interface MemoParams extends MemoBase {}