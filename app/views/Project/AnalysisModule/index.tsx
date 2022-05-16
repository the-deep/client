import React, {
    useContext,
    Suspense,
    useMemo,
    useState,
} from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { generatePath, Redirect, Route, Switch } from 'react-router-dom';

import SubNavbarContext from '#components/SubNavbar/context';
import SubNavbar, { SubNavbarIcons } from '#components/SubNavbar';
import ProjectSwitcher from '#components/general/ProjectSwitcher';
import { ProjectContext } from '#base/context/ProjectContext';

import routes from '#base/configs/routes';
import SmartNavLink from '#base/components/SmartNavLink';
import PreloadMessage from '#base/components/PreloadMessage';
import styles from './styles.css';

interface AnalysisModuleProps {
    className?: string;
}

function AnalysisModule(props: AnalysisModuleProps) {
    const {
        className,
    } = props;

    const {
        project,
    } = useContext(ProjectContext);
    const defaultRoute = generatePath(routes.analysisDashboard.path, { projectId: project?.id });

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
        <SubNavbarContext.Provider value={navbarContextValue}>
            <div className={_cs(styles.analysisModule, className)}>
                <SubNavbarIcons>
                    <ProjectSwitcher />
                </SubNavbarIcons>
                <SubNavbar
                    className={styles.subNavbar}
                >
                    <SmartNavLink
                        exact
                        route={routes.analysisDashboard}
                        className={styles.link}
                    />
                    <SmartNavLink
                        exact
                        route={routes.analysisExport}
                        className={styles.link}
                    />
                </SubNavbar>
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
                            path={routes.analysis.path}
                        >
                            <Redirect to={defaultRoute} />
                        </Route>
                        <Route
                            exact
                            path={routes.analysisDashboard.path}
                        >
                            {routes.analysisDashboard.load({ className: styles.childView })}
                        </Route>
                        <Route
                            exact
                            path={routes.analysisExport.path}
                        >
                            {routes.analysisExport.load({ className: styles.childView })}
                        </Route>
                    </Switch>
                </Suspense>
            </div>
        </SubNavbarContext.Provider>
    );
}
export default AnalysisModule;
