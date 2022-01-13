import { InitializeOptions } from 'react-ga';
import {
    isDebugMode,
    gaTrackingKey,
} from './env';

export const trackingId = gaTrackingKey;

export const gaConfig: InitializeOptions = {
    debug: isDebugMode,
    testMode: isDebugMode,
    gaOptions: {
        userId: undefined,
    },
};
