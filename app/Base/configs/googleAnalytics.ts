import { InitializeOptions } from 'react-ga';
import {
    isBeta,
    isAlpha,
    isNightly,
    isDev,
} from './env';

export const trackingId = isBeta || isAlpha || isNightly
    ? 'UA-112330910-1'
    : 'UA-112330910-2';

export const gaConfig: InitializeOptions = {
    debug: isDev,
    testMode: isDev,
    gaOptions: {
        userId: undefined,
    },
};
