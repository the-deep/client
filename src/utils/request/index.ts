import RequestContext from './context';
import useMyRequest, { RequestOptions } from './useRequest';
import useMyLazyRequest, { LazyRequestOptions } from './useLazyRequest';

import { Error, OptionBase } from './deep';

// eslint-disable-next-line
const useLazyRequest: <R, C = null>(requestOptions: LazyRequestOptions<R, Error, C, OptionBase>) => {
    response: R | undefined;
    pending: boolean;
    error: Error | undefined;
    trigger: (ctx: C) => void;
    context: C | undefined,
} = useMyLazyRequest;

const useRequest: <R>(requestOptions: RequestOptions<R, Error, OptionBase>) => {
    response: R | undefined;
    pending: boolean;
    error: Error | undefined;
    retrigger: () => void;
} = useMyRequest;

export { RequestContext, useRequest, useLazyRequest };
