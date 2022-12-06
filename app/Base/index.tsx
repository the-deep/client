import React, { useState, useMemo, useCallback } from 'react';
import localforage from 'localforage';
import { Router } from 'react-router-dom';
import { init, ErrorBoundary, setUser as setUserOnSentry, withProfiler } from '@sentry/react';
import { unique, _cs } from '@togglecorp/fujs';
import {
    AlertContainer,
    AlertContext,
    AlertOptions,
    Button,
} from '@the-deep/deep-ui';
import { ApolloProvider } from '@apollo/client';
import ReactGA from 'react-ga';
import { setMapboxToken } from '@togglecorp/re-map';

import '@the-deep/deep-ui/build/esm/index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import Init from '#base/components/Init';
import browserHistory from '#base/configs/history';
import sentryConfig from '#base/configs/sentry';
import { UserContext, UserContextInterface } from '#base/context/UserContext';
import {
    openZendeskFeedback,
    setUserOnZendesk,
} from '#base/utils/zendesk';
import { NavbarContext, NavbarContextInterface } from '#base/context/NavbarContext';
import AuthPopup from '#base/components/AuthPopup';
import { sync } from '#base/hooks/useAuthSync';
import Navbar from '#base/components/Navbar';
import Routes from '#base/components/Routes';
import { User } from '#base/types/user';
import { trackingId, gaConfig } from '#base/configs/googleAnalytics';
import {
    processDeepUrls,
    processDeepOptions,
    processDeepResponse,
    processDeepError,
    RequestContext,
    DeepContextInterface,
} from '#base/utils/restRequest';

import { apolloClient } from '#base/configs/apollo';
import localforageInstance from '#base/configs/localforage';
import { mapboxToken } from '#base/configs/env';

import FullPageErrorMessage from '#views/FullPageErrorMessage';

import styles from './styles.css';

localforageInstance.setDriver(
    [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
);

setMapboxToken(mapboxToken);

if (sentryConfig) {
    init(sentryConfig);
}

ReactGA.initialize(trackingId, gaConfig);
browserHistory.listen((location) => {
    const page = location.pathname ?? window.location.pathname;
    ReactGA.set({ page });
    ReactGA.pageview(page);
});

function Base() {
    const [user, setUser] = useState<User | undefined>();

    const [navbarState, setNavbarState] = useState<{
        path: string;
        visibility: boolean;
    }[]>([]);

    const authenticated = !!user;

    const setUserWithSentryAndZendesk: typeof setUser = useCallback(
        (u) => {
            if (typeof u === 'function') {
                setUser((oldUser) => {
                    const newUser = u(oldUser);

                    const sanitizedUser = newUser;
                    sync(!!sanitizedUser, sanitizedUser?.id);
                    setUserOnSentry(sanitizedUser ?? null);
                    setUserOnZendesk(sanitizedUser ?? null);

                    return newUser;
                });
            } else {
                const sanitizedUser = u;
                sync(!!sanitizedUser, sanitizedUser?.id);
                setUserOnSentry(sanitizedUser ?? null);
                setUserOnZendesk(sanitizedUser ?? null);
                setUser(u);
            }
        },
        [setUser],
    );

    const userContext: UserContextInterface = useMemo(
        () => ({
            authenticated,
            user,
            setUser: setUserWithSentryAndZendesk,
        }),
        [
            authenticated,
            user,
            setUserWithSentryAndZendesk,
        ],
    );

    const navbarContext: NavbarContextInterface = useMemo(
        () => ({
            navbarState,
            setNavbarState,
        }),
        [navbarState, setNavbarState],
    );

    const [alerts, setAlerts] = React.useState<AlertOptions[]>([]);

    const addAlert = React.useCallback(
        (alert: AlertOptions) => {
            // FIXME: this behavior is faulty
            setAlerts((prevAlerts) => unique(
                [...prevAlerts, alert],
                (a) => a.name,
            ) ?? prevAlerts);
        },
        [setAlerts],
    );

    const removeAlert = React.useCallback(
        (name: string) => {
            setAlerts((prevAlerts) => {
                const i = prevAlerts.findIndex((a) => a.name === name);
                if (i === -1) {
                    return prevAlerts;
                }

                const newAlerts = [...prevAlerts];
                newAlerts.splice(i, 1);

                return newAlerts;
            });
        },
        [setAlerts],
    );

    const updateAlertContent = React.useCallback(
        (name: string, children: React.ReactNode) => {
            setAlerts((prevAlerts) => {
                const i = prevAlerts.findIndex((a) => a.name === name);
                if (i === -1) {
                    return prevAlerts;
                }

                const updatedAlert = {
                    ...prevAlerts[i],
                    children,
                };

                const newAlerts = [...prevAlerts];
                newAlerts.splice(i, 1, updatedAlert);

                return newAlerts;
            });
        },
        [setAlerts],
    );

    const alertContext = React.useMemo(
        () => ({
            alerts,
            addAlert,
            updateAlertContent,
            removeAlert,
        }),
        [alerts, addAlert, updateAlertContent, removeAlert],
    );

    const requestContextValue = useMemo(
        () => {
            const transformError: DeepContextInterface['transformError'] = (...args) => (
                processDeepError(addAlert)(...args)
            );

            return {
                transformUrl: processDeepUrls,
                transformOptions: processDeepOptions,
                transformResponse: processDeepResponse,
                transformError,
            };
        },
        [addAlert],
    );

    const currentNavbarState = navbarState.reduce(
        (acc: typeof navbarState[number] | undefined, value) => {
            if (!acc) {
                return value;
            }
            if (acc.path.length > value.path.length) {
                return acc;
            }
            return value;
        },
        undefined,
    );

    const navbarShown = currentNavbarState?.visibility;

    return (
        <div className={styles.base}>
            <ErrorBoundary
                showDialog
                fallback={(
                    <FullPageErrorMessage
                        errorTitle="Oh no!"
                        errorMessage="Some error occured"
                        krakenVariant="hi"
                    />
                )}
            >
                <RequestContext.Provider value={requestContextValue}>
                    <ApolloProvider client={apolloClient}>
                        <UserContext.Provider value={userContext}>
                            <NavbarContext.Provider value={navbarContext}>
                                <AlertContext.Provider value={alertContext}>
                                    <AuthPopup />
                                    <AlertContainer className={styles.alertContainer} />
                                    <Router history={browserHistory}>
                                        <Init
                                            className={styles.init}
                                        >
                                            <Navbar
                                                className={_cs(
                                                    styles.navbar,
                                                    !navbarShown && styles.hidden,
                                                )}
                                                disabled={!navbarShown}
                                            />
                                            <Routes
                                                className={styles.view}
                                            />
                                        </Init>
                                    </Router>
                                </AlertContext.Provider>
                            </NavbarContext.Provider>
                        </UserContext.Provider>
                    </ApolloProvider>
                </RequestContext.Provider>
            </ErrorBoundary>
            {!navbarShown && (
                <Button
                    name={undefined}
                    title="Bug/Feedback?"
                    variant="action"
                    className={styles.zendeskHelpButton}
                    onClick={openZendeskFeedback}
                >
                    Bug / Feedback?
                </Button>
            )}
        </div>
    );
}

export default withProfiler(Base, { name: 'Base' });
