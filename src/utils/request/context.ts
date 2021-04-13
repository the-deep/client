import { createContext } from 'react';

export interface ContextInterface {
    transformUrl: (url: string) => string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    transformOptions: (url: string, options: Omit<RequestInit, 'body'> & { body: RequestInit['body'] | object}) => RequestInit;
}

const defaultContext: ContextInterface = {
    transformUrl: url => url,
    transformOptions: (url, { body, ...otherOptions }) => ({
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(body),
        ...otherOptions,
    }),
};

const RequestContext = createContext(defaultContext);
export default RequestContext;
