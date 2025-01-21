import React, {
    useState,
    useMemo,
    useCallback,
} from 'react';
import localforage from 'localforage';
import { IoRemove } from 'react-icons/io5';
import { Router } from 'react-router-dom';
import { unique, _cs } from '@togglecorp/fujs';
import {
    init,
    ErrorBoundary,
    setUser as setUserOnSentry,
    withProfiler,
} from '@sentry/react';
import {
    AlertContainer,
    AlertContext,
    AlertOptions,
    Button,
    QuickActionButton,
    useModalState,
} from '@the-deep/deep-ui';
import { ApolloProvider } from '@apollo/client';
import { setMapboxToken } from '@togglecorp/re-map';
import ReactGA from 'react-ga4';

import '@the-deep/deep-ui/build/esm/index.css';
import '@the-deep/reporting-module-components/build/esm/index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import Init from '#base/components/Init';
import browserHistory from '#base/configs/history';
import sentryConfig from '#base/configs/sentry';
import { NavbarContext, NavbarContextInterface } from '#base/context/NavbarContext';
import AuthPopup from '#base/components/AuthPopup';
import Navbar from '#base/components/Navbar';
import Routes from '#base/components/Routes';
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
import { trackingId, gaConfig } from '#base/configs/googleAnalytics';
import { UserContext, UserContextInterface } from '#base/context/UserContext';
import { sync } from '#base/hooks/useAuthSync';
import { User } from '#base/types/user';
import FullPageErrorMessage from '#views/FullPageErrorMessage';

import styles from './styles.css';

localforageInstance.setDriver(
    [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
);

setMapboxToken(mapboxToken);

if (sentryConfig) {
    init(sentryConfig);
}
if (trackingId) {
    ReactGA.initialize([{
        trackingId,
        gaOptions: gaConfig,
    }]);

    browserHistory.listen((location) => {
        const page = location.pathname + location.search + location.hash;
        ReactGA.set({ page });
        ReactGA.send({ hitType: 'pageview', page });
    });
}

function Base() {
    const [user, setUser] = useState<User | undefined>();

    const [
        showMondayForm,
        setMondayFormVisible,
        setMondayFormHidden,
    ] = useModalState(false);

    const [navbarState, setNavbarState] = useState<{
        path: string;
        visibility: boolean;
    }[]>([]);

    const authenticated = !!user;

    const setUserWithSentry: typeof setUser = useCallback(
        (u) => {
            if (typeof u === 'function') {
                setUser((oldUser) => {
                    const newUser = u(oldUser);

                    const sanitizedUser = newUser;
                    sync(!!sanitizedUser, sanitizedUser?.id);
                    setUserOnSentry(sanitizedUser ?? null);

                    return newUser;
                });
            } else {
                const sanitizedUser = u;
                sync(!!sanitizedUser, sanitizedUser?.id);
                setUserOnSentry(sanitizedUser ?? null);
                setUser(u);
            }
        },
        [setUser],
    );

    const userContext: UserContextInterface = useMemo(
        () => ({
            authenticated,
            user,
            setUser: setUserWithSentry,
        }),
        [
            authenticated,
            user,
            setUserWithSentry,
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
            <Button
                className={styles.mondayHelpButton}
                name={undefined}
                title="Bug / Feedback?"
                variant="action"
                onClick={setMondayFormVisible}
            >
                Bug / Feedback?
            </Button>

            {showMondayForm && (
                <div className={styles.formOverlay}>
                    <div className={styles.formContent}>
                        <div className={styles.formTopBar}>
                            <p>Leave us a message</p>
                            <QuickActionButton
                                name={undefined}
                                onClick={setMondayFormHidden}
                                variant="transparent"
                            >
                                <IoRemove />
                            </QuickActionButton>
                        </div>
                        <iframe
                            className={styles.iframe}
                            src="https://forms.monday.com/forms/embed/6438474a471702280d54bd27e87f5855?r=apse2"
                            title="Monday Form"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default withProfiler(Base, { name: 'Base' });
