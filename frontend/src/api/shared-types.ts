export type Page<TContent> = {
  content: TContent[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
};
