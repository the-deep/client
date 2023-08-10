// Basic
export interface BasicElement {
    id: string;
    title: string;
}

export interface MultiResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export interface DatabaseEntityBase {
    id: number;
    createdAt: string;
    createdBy: number;
    createdByName: string;
    modifiedAt: string;
    modifiedBy: number;
    modifiedByName: string;
    versionId: number;
}

export interface EnumEntity<T> {
    name: T;
    description?: string | null;
}

export type EnumOptions<T> = EnumEntity<T>[] | null | undefined;
