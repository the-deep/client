import { InitializeOptions } from 'react-ga';
import {
    isBeta,
    isAlpha,
    isNightly,
    isDev,
} from './env';

export const trackingId = (() => {
    const keyFromEnv = process.env.REACT_APP_GA_TRACKING_ID;
    if (keyFromEnv) {
        return keyFromEnv;
    }
    if (isBeta || isAlpha || isNightly) {
        return 'UA-112330910-1';
    }
    return 'UA-112330910-2';
})();

export const gaConfig: InitializeOptions = {
    debug: isDev,
    testMode: isDev,
    gaOptions: {
        userId: undefined,
    },
};
