import { BrowserOptions } from '@sentry/react';

import {
    isBeta,
    isAlpha,
    isNightly,
    isDev,
} from '#base/configs/env';

const appCommitHash = process.env.REACT_APP_COMMITHASH;
const appName = process.env.MY_APP;

const sentryDsn = (() => {
    const keyFromEnv = process.env.REACT_APP_SENTRY_DSN;
    if (keyFromEnv) {
        return keyFromEnv;
    }
    if (isBeta || isAlpha || isNightly) {
        return 'https://9a60f35c6a1c45fe999727c5f6f7229c@sentry.io/1220157';
    }
    return undefined;
})();

const env = process.env.REACT_APP_DEEP_ENVIRONMENT;
const sentryConfig: BrowserOptions | undefined = sentryDsn ? {
    dsn: sentryDsn,
    release: `${appName}@${appCommitHash}`,
    environment: env,
    debug: isDev,
    // sendDefaultPii: true,
    normalizeDepth: 5,
    // FIXME: check for proper casts
    tracesSampleRate: +(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || 0.2),
    integrations: [],
} : undefined;

export default sentryConfig;
