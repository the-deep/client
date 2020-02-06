import {
    NewProps,
    ClientAttributes,
} from '@togglecorp/react-rest-request';

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

// Redux

export interface AppState {
    domainData: any;
    siloDomainData: any;
    route: any;
}

export interface AppProps {
}

// Request

export type Requests<Props, Params> = {[key: string]: ClientAttributes<Props, Params>}

export type AddRequestProps<Props, Params> = NewProps<Props, Params>;

export interface MultiResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
}

export * from './framework';
export * from './questionnaire';
export * from './project';

