import React, { useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import PreloadMessage from '#base/components/PreloadMessage';
import { UserContext } from '#base/context/UserContext';
import PageTitle from '#base/components/PageTitle';
import { User } from '#base/types/user';

import styles from './styles.css';

type Visibility = 'is-authenticated' | 'is-not-authenticated' | 'is-anything';

export interface Props<T extends { className?: string }> {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.LazyExoticComponent<(props: T) => React.ReactElement<any, any> | null>;
    componentProps: React.PropsWithRef<T>;
    visibility: Visibility,
    checkPermissions?: (permissions: NonNullable<User['permissions']>) => boolean | undefined,
    navbarVisibility: boolean;

    loginPage?: string;
    defaultPage?: string;
}

function Page<T extends { className?: string }>(props: Props<T>) {
    const {
        component: Comp,
        componentProps,
        title,
        navbarVisibility,
        visibility,
        checkPermissions,

        loginPage = '/login/',
        defaultPage = '/',
    } = props;

    const {
        authenticated,
        setNavbarState,
        user,
    } = useContext(UserContext);

    const redirectToSignIn = visibility === 'is-authenticated' && !authenticated;
    const redirectToHome = visibility === 'is-not-authenticated' && authenticated;
    const redirect = redirectToSignIn || redirectToHome;

    useEffect(
        () => {
            // NOTE: should not set visibility for redirection or, navbar will
            // flash
            if (!redirect) {
                setNavbarState(navbarVisibility);
            }
        },
        // NOTE: setNavbarState will not change, navbarVisibility will not
        // change
        [setNavbarState, navbarVisibility, redirect],
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

    if (checkPermissions && (!user?.permissions || !checkPermissions(user.permissions))) {
        return (
            <>
                <PageTitle value={`403 - ${title}`} />
                <PreloadMessage
                    heading="403"
                    content="Unauthorized"
                />
            </>
        );
    }

    return (
        <>
            <PageTitle value={title} />
            <Comp
                className={styles.page}
                {...componentProps}
            />
        </>
    );
}

export default Page;
