import { matchPath } from 'react-router-dom';
import { reactRouterV5Instrumentation, BrowserOptions } from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import browserHistory from '#base/configs/history';
import routes from '#base/configs/routes';
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
    tracesSampleRate: 0.2,
    integrations: [
        new Integrations.BrowserTracing({
            // NOTE: process.env.REACT_APP_API_END is actually the domain
            // for the api endpoint
            tracingOrigins: ['localhost', process.env.REACT_APP_API_END as string],
            routingInstrumentation: reactRouterV5Instrumentation(
                browserHistory,
                Object.entries(routes),
                matchPath,
            ),
        }),
    ],
} : undefined;

export default sentryConfig;
