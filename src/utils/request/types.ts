export type Maybe<T> = T | null | undefined;

export interface UrlParams {
    [key: string]: Maybe<string | number | boolean | (string | number | boolean)[]>;
}

export interface Err {
    [key: string]: string[];
}

export interface Error {
    reason: string;
    exception: any;
    value: Err;
    errorCode?: number;
}
