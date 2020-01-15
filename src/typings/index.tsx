import {
    NewProps,
    ClientAttributes,
} from '@togglecorp/react-rest-request';

import { WidgetElement } from './framework';
import { QuestionElement } from './questionnaire';

export interface BasicElement {
    id: string;
    title: string;
}

export interface KeyValueElement {
    key: string;
    value: string;
}

export interface AppState {
    domainData: any;
    siloDomainData: any;
    route: any;
}

export interface AppProps {
}

export type Requests<Props, Params> = {[key: string]: ClientAttributes<Props, Params>}
export type AddRequestProps<Props, Params> = NewProps<Props, Params>;

export * from './framework';
export * from './questionnaire';
export * from './project';

