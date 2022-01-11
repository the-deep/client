import { matchPath } from 'react-router-dom';
import { reactRouterV5Instrumentation, BrowserOptions } from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import browserHistory from '#base/configs/history';
import routes from '#base/configs/routes';
import {
    isDev,
    appCommitHash,
    appName,
    sentryAppDsn,
    deepEnvironment,
    apiEndpoint,
} from '#base/configs/env';

const sentryConfig: BrowserOptions | undefined = sentryAppDsn ? {
    dsn: sentryAppDsn,
    release: `${appName}@${appCommitHash}`,
    environment: deepEnvironment,
    debug: isDev,
    // sendDefaultPii: true,
    normalizeDepth: 5,
    tracesSampleRate: 0.2,
    integrations: [
        new Integrations.BrowserTracing({
            // NOTE: apiEndpoint is actually the domain for the api endpoint
            tracingOrigins: ['localhost', apiEndpoint],
            routingInstrumentation: reactRouterV5Instrumentation(
                browserHistory,
                Object.entries(routes),
                matchPath,
            ),
        }),
    ],
} : undefined;

export default sentryConfig;
