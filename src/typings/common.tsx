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
    auth: any;
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

export interface ViewComponent<T> {
    component: React.ComponentType<T>;
    rendererParams?: () => T;
    wrapContainer?: boolean;
    mount?: boolean;
    lazyMount?: boolean;
}

export interface Permission {
    create?: boolean;
    delete?: boolean;
    view?: boolean;
    modify?: boolean;
}

export interface Permissions {
    setupPermissions: Permission;
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

export interface FaramErrors {
    [key: string]: string | undefined | string [] | FaramErrors;
}
