import { matchPath } from 'react-router-dom';
import { reactRouterV5Instrumentation, BrowserOptions } from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import browserHistory from '#base/configs/history';
import routes from '#base/configs/routes';
import {
    isBeta,
    isAlpha,
    isNightly,
} from '#base/configs/env';

const appCommitHash = process.env.REACT_APP_COMMITHASH;
const appName = process.env.MY_APP;

const sentryDsn = isBeta || isAlpha || isNightly
    ? 'https://9a60f35c6a1c45fe999727c5f6f7229c@sentry.io/1220157'
    : undefined;

const env = process.env.REACT_APP_DEEP_ENVIRONMENT;
const sentryConfig: BrowserOptions | undefined = sentryDsn ? {
    dsn: sentryDsn,
    release: `${appName}@${appCommitHash}`,
    environment: env,
    // sendDefaultPii: true,
    normalizeDepth: 5,
    integrations: [
        new Integrations.BrowserTracing({
            routingInstrumentation: reactRouterV5Instrumentation(
                browserHistory,
                Object.entries(routes),
                matchPath,
            ),
        }),
    ],
} : undefined;

export default sentryConfig;
