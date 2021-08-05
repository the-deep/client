import React from 'react';
import {
    Switch,
    Route,
    Redirect,
    generatePath,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { Border } from '@the-deep/deep-ui';

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

    return (
        <div className={_cs(styles.tagging, className)}>
            <nav className={styles.subNavbar}>
                <div className={styles.navLinks}>
                    <Border />
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
                </div>
            </nav>
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
        </div>
    );
}

export default Tagging;
