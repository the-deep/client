import { createContext } from 'react';

export interface ContextInterface {
    transformUrl: (url: string) => string;
    transformOptions: (
        url: string,
        // eslint-disable-next-line @typescript-eslint/ban-types
        options: Omit<RequestInit, 'body'> & { body?: RequestInit['body'] | object | undefined },
    ) => RequestInit;
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
