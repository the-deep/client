import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import SmartNavLink from '#base/components/SmartNavLink';
import routes from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Tagging(props: Props) {
    const { className } = props;

    return (
        <div className={_cs(styles.tagging, className)}>
            <nav className={styles.subNavbar}>
                <div className={styles.navLinks}>
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
                <Route
                    path={routes.taggingFlow.path}
                    render={routes.taggingFlow.load}
                />
            </Switch>
        </div>
    );
}

export default Tagging;
