import React, { useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

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
    navbarVisibility: boolean | undefined;

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
        setNavbarVisibility,
    } = useContext(NavbarContext);
    const {
        project,
    } = useContext(ProjectContext);

    const redirectToSignIn = visibility === 'is-authenticated' && !authenticated;
    const redirectToHome = visibility === 'is-not-authenticated' && authenticated;
    const redirect = redirectToSignIn || redirectToHome;

    useEffect(
        () => {
            // NOTE: should not set visibility for redirection or, navbar will
            // flash
            // NOTE: if navbarVisibility do not change navbar state
            // useful for parent routes
            if (!redirect && isDefined(navbarVisibility)) {
                setNavbarVisibility(navbarVisibility);
            }
        },
        // NOTE: setNavbarVisibility will not change
        // NOTE: navbarVisibility will not change
        // NOTE: adding path because Path component is reused when used in Switch > Routes
        [setNavbarVisibility, navbarVisibility, path, redirect],
    );

    if (redirectToSignIn) {
        // console.warn('Redirecting to sign-in');
        return (
            <Redirect to={loginPage} />
        );
    }

    if (redirectToHome) {
        // console.warn('Redirecting to dashboard');
        return (
            <Redirect to={defaultPage} />
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
