

export interface Pagination<T> {
    items: Array<T>;
    totalPages: number;
    totalElements: number;
    page: number;
    prevPage: number | null;
    nextPage: number | null;
    isHasPage: boolean;
}


export interface DataPagination{
    page: number, 
    limit: number,
}