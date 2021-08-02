import React, { useEffect, useContext } from 'react';
import { Redirect } from 'react-router-dom';

import PreloadMessage from '#base/components/PreloadMessage';
import { UserContext } from '#base/context/UserContext';
import { NavbarContext } from '#base/context/NavbarContext';
import { ProjectContext } from '#base/context/ProjectContext';
import PageTitle from '#base/components/PageTitle';
import { Project } from '#base/types/project';

import styles from './styles.css';

type Visibility = 'is-authenticated' | 'is-not-authenticated' | 'is-anything';

export interface Props<T extends { className?: string }> {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.LazyExoticComponent<(props: T) => React.ReactElement<any, any> | null>;
    componentProps: React.PropsWithRef<T>;
    visibility: Visibility,
    checkPermissions?: (project: Project | undefined) => boolean | undefined,
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
    } = useContext(UserContext);
    const {
        setNavbarState,
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

    if (checkPermissions && !checkPermissions(project)) {
        return (
            <>
                <PageTitle value={`403 - ${title}`} />
                <PreloadMessage
                    heading="Oh no!"
                    content="The project does not exist or you do not have permissions to view the project."
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
