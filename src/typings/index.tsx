import {
    NewProps,
    ClientAttributes,
} from '@togglecorp/react-rest-request';

import { WidgetElement } from './framework';
import { QuestionElement } from './questionnaire';

export interface BasicElement {
    key: string;
    value: string;
}

export interface AppState {
    domainData: any;
    siloDomainData: any;
}

export interface AppProps {
}

export interface FrameworkElement {
    id: number;
    widgets: WidgetElement[];
    questions: QuestionElement[];
}

export type Requests<Props, Params> = {[key: string]: ClientAttributes<Props, Params>}
export type AddRequestProps<Props, Params> = NewProps<Props, Params>;

export * from './framework';
export * from './questionnaire';

