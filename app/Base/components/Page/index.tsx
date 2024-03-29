import React, { useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import FullPageErrorMessage from '#views/FullPageErrorMessage';
import { UserContext } from '#base/context/UserContext';
import { NavbarContext } from '#base/context/NavbarContext';
import { ProjectContext } from '#base/context/ProjectContext';
import PageTitle from '#base/components/PageTitle';
import { Project } from '#base/types/project';
import { User } from '#base/types/user';
import ErrorBoundary from '#base/components/ErrorBoundary';

import styles from './styles.css';

type Visibility = 'is-authenticated' | 'is-not-authenticated' | 'is-anything';

export interface Props<T extends { className?: string }> {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.LazyExoticComponent<(props: T) => React.ReactElement<any, any> | null>;
    componentProps: React.PropsWithRef<T>;
    overrideProps: Partial<React.PropsWithRef<T>>;
    visibility: Visibility,
    checkPermissions?: (
        user: User | undefined,
        project: Project | undefined,
        skipProjectPermissionCheck: boolean,
    ) => boolean | undefined,
    navbarVisibility: boolean;

    path: string;
    loginPage?: string;
    defaultPage?: string;
}

function Page<T extends { className?: string }>(props: Props<T>) {
    const {
        component: Comp,
        componentProps,
        overrideProps,
        title,
        navbarVisibility,
        visibility,
        checkPermissions,

        loginPage = '/login/',
        defaultPage = '/',
        path,
    } = props;

    const {
        user,
        authenticated,
    } = useContext(UserContext);
    const {
        setNavbarState,
    } = useContext(NavbarContext);
    const {
        project,
    } = useContext(ProjectContext);

    useEffect(
        () => {
            // NOTE: Decide if we should skip for redirections
            setNavbarState((oldValue) => {
                const newValue = [...oldValue, { path, visibility: navbarVisibility }];
                return newValue;
            });
            return () => {
                setNavbarState((oldValue) => {
                    const newValue = oldValue.filter((item) => item.path !== path);
                    return newValue;
                });
            };
        },
        // NOTE: setNavbarState will not change
        // NOTE: navbarVisibility will not change
        [setNavbarState, navbarVisibility, path],
    );

    const redirectToSignIn = visibility === 'is-authenticated' && !authenticated;
    const redirectToHome = visibility === 'is-not-authenticated' && authenticated;

    if (redirectToSignIn) {
        // console.info('Redirecting to sign-in');
        return (
            <Redirect to={loginPage} />
        );
    }

    if (redirectToHome) {
        const redirectUrl = new URL(window.location.href).searchParams.get('redirect') || defaultPage;

        // console.info('Redirecting to dashboard');
        return (
            <Redirect to={redirectUrl} />
        );
    }

    // FIXME: custom error message from checkPermissions
    // FIXME: add a "back to home" or somewhere page
    // FIXME: only hide page if page is successfully mounted
    if (checkPermissions && !checkPermissions(user, project, false)) {
        return (
            <>
                <PageTitle value={`403 - ${title}`} />
                <FullPageErrorMessage
                    errorTitle="403"
                    errorMessage="You do not have permission to access this page"
                    krakenVariant="hi"
                />
            </>
        );
    }

    return (
        <>
            <PageTitle value={title} />
            <ErrorBoundary>
                <Comp
                    className={styles.page}
                    {...componentProps}
                    {...overrideProps}
                />
            </ErrorBoundary>
        </>
    );
}

export default Page;
