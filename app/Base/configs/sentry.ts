import { matchPath } from 'react-router-dom';
import { reactRouterV5Instrumentation, BrowserOptions } from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import browserHistory from '#base/configs/history';
import routes from '#base/configs/routes';
import {
    isDebugMode,
    appCommitHash,
    myApp,
    sentryAppDsn,
    deepEnvironment,
    apiEndpoint,
    sentryNormalizeDepth,
    sentryTraceSampleRate,
} from '#base/configs/env';

const sentryConfig: BrowserOptions | undefined = sentryAppDsn ? {
    dsn: sentryAppDsn,
    release: `${myApp}@${appCommitHash}`,
    environment: deepEnvironment,
    debug: isDebugMode,
    // sendDefaultPii: true,
    normalizeDepth: sentryNormalizeDepth,
    tracesSampleRate: sentryTraceSampleRate,
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
