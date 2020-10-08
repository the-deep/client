import { createContext } from 'react';

export interface ContextInterface {
    transformUrl: (url: string) => string;
    transformOptions: (url: string, options: RequestInit) => RequestInit;
}

const defaultContext: ContextInterface = {
    transformUrl: url => url,
    transformOptions: (url, options) => ({
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
        },
        ...options,
    }),
};

const RequestContext = createContext(defaultContext);
export default RequestContext;
