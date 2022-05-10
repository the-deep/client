import React, {
    useContext,
    Suspense,
    useMemo,
    useState,
    useCallback,
} from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    IoAdd,
} from 'react-icons/io5';
import { generatePath, Redirect, Route, Switch } from 'react-router-dom';
import {
    Button,
} from '@the-deep/deep-ui';

import SubNavbarContext from '#components/SubNavbar/context';
import SubNavbar, { SubNavbarIcons, SubNavbarActions } from '#components/SubNavbar';
import ProjectSwitcher from '#components/general/ProjectSwitcher';
import { ProjectContext } from '#base/context/ProjectContext';

import {
    useModalState,
} from '#hooks/stateManagement';

import _ts from '#ts';
import routes from '#base/configs/routes';
import SmartNavLink from '#base/components/SmartNavLink';
import styles from './styles.css';
import PreloadMessage from '#base/components/PreloadMessage';

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

    const [
        showAnalysisAddModal,
        setModalVisible,
    ] = useModalState(false);

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

    const [analysisToEdit, setAnalysisToEdit] = useState();

    const handleNewAnalysisCreateClick = useCallback(() => {
        setAnalysisToEdit(undefined);
        setModalVisible();
    }, [setModalVisible]);

    const canTagEntry = project?.allowedPermissions?.includes('UPDATE_ENTRY');

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
                <SubNavbarActions>
                    {canTagEntry && (
                        <Button
                            name={undefined}
                            variant="primary"
                            onClick={handleNewAnalysisCreateClick}
                            icons={(
                                <IoAdd />
                            )}
                        >
                            {_ts('analysis', 'setupNewAnalysisButtonLabel')}
                        </Button>
                    )}
                </SubNavbarActions>
            </div>
        </SubNavbarContext.Provider>
    );
}
export default AnalysisModule;
