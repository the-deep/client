import React from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import SmartNavLink from '#base/components/SmartNavLink';
import routes from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Tagging(props: Props) {
    const { className } = props;
    const { projectId } = useParams<{ projectId: string }>();

    /*
     * NOTE: styling for view is located in
     * `/configs/routes/styles.css`
     */
    return (
        <div className={_cs(styles.tagging, className)}>
            <nav className={styles.subNavbar}>
                <div className={styles.navLinks}>
                    <SmartNavLink
                        exact
                        route={routes.sources}
                        className={styles.link}
                        attrs={{
                            projectId: 1,
                        }}
                    />
                    <SmartNavLink
                        exact
                        route={routes.dashboard}
                        className={styles.link}
                        attrs={{
                            projectId: 1,
                        }}
                    />
                    <SmartNavLink
                        exact
                        route={routes.export}
                        className={styles.link}
                        attrs={{
                            projectId: 1,
                        }}
                    />
                </div>
            </nav>
            <Switch>
                <Route
                    exact
                    path={routes.sources.path}
                    render={routes.sources.load}
                />
                <Route
                    exact
                    path={routes.dashboard.path}
                    render={routes.dashboard.load}
                />
                <Route
                    exact
                    path={routes.export.path}
                    render={routes.export.load}
                />
            </Switch>
        </div>
    );
}

export default Tagging;
