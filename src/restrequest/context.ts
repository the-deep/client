import { createContext } from 'react';

export interface ContextInterface {
    transformUrl: (props: string) => string;
    transformOptions: (props: RequestInit) => RequestInit;
}

const defaultContext: ContextInterface = {
    transformUrl: value => value,
    transformOptions: value => ({
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
        },
        ...value,
    }),
};

const RequestContext = createContext(defaultContext);
export default RequestContext;
