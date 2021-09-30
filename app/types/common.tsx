// Basic

export interface BasicElement {
    id: string;
    title: string;
}

// Used
export interface KeyValueElement {
    key: string;
    value: string;
}

export interface MultiResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export type NullableField<T, K extends keyof T> = {
    [key in K]+?: T[key];
} & Omit<T, K>

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

export interface BooleanKeyValueElement {
    key: boolean;
    value: string;
}

export interface FaramErrors {
    [key: string]: string | undefined | string [] | FaramErrors;
}

export interface EnumEntity<T> {
    name: T;
    description?: string | null;
}
