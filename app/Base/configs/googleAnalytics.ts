import {
    isDebugMode,
    googleAnalyticsMeasurementId,
} from './env';

export const trackingId = googleAnalyticsMeasurementId;

export const gaConfig = {
    gaOptions: {
        testMode: isDebugMode,
    },
};
