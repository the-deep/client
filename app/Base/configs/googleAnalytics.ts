import { InitializeOptions } from 'react-ga';
import {
    isDev,
    gaTrackingKey,
} from './env';

export const trackingId = gaTrackingKey;

export const gaConfig: InitializeOptions = {
    debug: isDev,
    testMode: isDev,
    gaOptions: {
        userId: undefined,
    },
};
