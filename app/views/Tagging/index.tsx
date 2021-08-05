import React, { Suspense, useMemo, useState } from 'react';
import {
    Switch,
    Route,
    Redirect,
    generatePath,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import ProjectSwitcher from '#components/ProjectSwitcher';
import PreloadMessage from '#base/components/PreloadMessage';
import NavbarContext from '#components/SubNavbar/context';
import SubNavbar, { Icons } from '#components/SubNavbar';
import ProjectContext from '#base/context/ProjectContext';
import SmartNavLink from '#base/components/SmartNavLink';
import routes from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Tagging(props: Props) {
    const { className } = props;
    const { project } = React.useContext(ProjectContext);

    const defaultRoute = generatePath(routes.sources.path, { projectId: project?.id });

    const [iconsNode, setIconsNode] = useState<Element | null | undefined>();
    const [actionsNode, setActionsNode] = useState<Element | null | undefined>();

    const navbarContextValue = useMemo(
        () => ({
            iconsNode,
            actionsNode,
            setIconsNode,
            setActionsNode,
        }),
        [iconsNode, actionsNode],
    );

    return (
        <NavbarContext.Provider value={navbarContextValue}>
            <div className={_cs(styles.tagging, className)}>
                <SubNavbar
                    className={styles.subNavbar}
                >
                    <SmartNavLink
                        exact
                        route={routes.sources}
                        className={styles.link}
                    />
                    <SmartNavLink
                        exact
                        route={routes.dashboard}
                        className={styles.link}
                    />
                    <SmartNavLink
                        exact
                        route={routes.export}
                        className={styles.link}
                    />
                </SubNavbar>
                <Switch>
                    <Route
                        exact
                        path={routes.sources.path}
                    >
                        <Icons>
                            <ProjectSwitcher />
                        </Icons>
                    </Route>
                    <Route
                        exact
                        path={routes.dashboard.path}
                    >
                        <Icons>
                            <ProjectSwitcher />
                        </Icons>
                    </Route>
                    <Route
                        exact
                        path={routes.export.path}
                    >
                        <Icons>
                            <ProjectSwitcher />
                        </Icons>
                    </Route>
                </Switch>
                <Suspense
                    fallback={(
                        <PreloadMessage
                            className={styles.childView}
                            content="Loading page..."
                        />
                    )}
                >
                    <Switch>
                        <Route
                            exact
                            path={routes.tagging.path}
                        >
                            <Redirect to={defaultRoute} />
                        </Route>
                        <Route
                            exact
                            path={routes.sources.path}
                        >
                            {routes.sources.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.dashboard.path}
                        >
                            {routes.dashboard.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.export.path}
                        >
                            {routes.export.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.taggingFlow.path}
                        >
                            {routes.taggingFlow.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.fourHundredFour.path}
                        >
                            {routes.fourHundredFour.load({ className: styles.childView })}
                        </Route>
                    </Switch>
                </Suspense>
            </div>
        </NavbarContext.Provider>
    );
}

export default Tagging;
