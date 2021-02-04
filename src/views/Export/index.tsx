import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';

import ScrollTabs from '#rscv/ScrollTabs';
import TabTitle from '#components/general/TabTitle';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Page from '#rscv/Page';

import {
    projectIdFromRouteSelector,
    activeProjectFromStateSelector,
    activeProjectRoleSelector,
} from '#redux';

import {
    AppState,
} from '#typings';

import ExportedFiles from './ExportedFiles';
import ExportSelection from './ExportSelection';
import AssessmentExportSelection from './AssessmentExportSelection';

import styles from './styles.scss';

type TabElement = 'exportSelection' | 'aryExportSelection' | 'exportedFiles';

interface Tabs {
    exportSelection: string;
    aryExportSelection?: string;
    exportedFiles: string;
}

const tabs: Tabs = {
    exportSelection: 'Export Entries',
    aryExportSelection: 'Export Assessments',
    exportedFiles: 'Exported Files',
};

const mapStateToProps = (state: AppState) => ({
    projectId: projectIdFromRouteSelector(state),
    projectRole: activeProjectRoleSelector(state),
    currentUserActiveProject: activeProjectFromStateSelector(state),
});

interface Permissions {
    'create_only_unprotected'?: boolean;
    view?: boolean;
}

interface ProjectRole {
    assessmentPermissions?: Permissions;
    exportPermissions?: Permissions;
}

interface Project {
    assessmentTemplate: boolean;
}

interface PropsFromState {
    projectId: number;
    // TODO: Fix later
    projectRole: ProjectRole;
    currentUserActiveProject: Project;
}
function Export(props: PropsFromState) {
    const {
        projectId,
        projectRole,
        currentUserActiveProject,
    } = props;

    // TODO: Reset this
    const [activeTab, setActiveTab] = useState<TabElement>('exportSelection');
    const hasAssessmentTemplate = !!currentUserActiveProject.assessmentTemplate;

    const tabRendererParams = useCallback((_: TabElement, title: string) => ({
        title,
    }), []);

    const {
        assessmentPermissions = {},
    } = projectRole;

    const views = useMemo(() => (
        {
            exportSelection: {
                component: () => (
                    <ExportSelection
                        projectRole={projectRole}
                        projectId={projectId}
                    />
                ),
                wrapContainer: true,
                lazyMount: true,
                mount: true,
            },
            aryExportSelection: {
                component: () => (
                    <AssessmentExportSelection
                        projectRole={projectRole}
                        projectId={projectId}
                    />
                ),
                wrapContainer: true,
                lazyMount: true,
                mount: true,
            },
            exportedFiles: {
                component: () => (
                    <ExportedFiles
                        projectId={projectId}
                    />
                ),
                wrapContainer: true,
            },
        }
    ), [projectId, projectRole]);

    const finalTabs = useMemo(() => {
        const newTabs = { ...tabs };
        if (!hasAssessmentTemplate || !assessmentPermissions.view) {
            delete newTabs.aryExportSelection;
            return newTabs;
        }
        return tabs;
    }, [hasAssessmentTemplate, assessmentPermissions]);

    useEffect(() => {
        if (
            activeTab === 'aryExportSelection'
            && (!hasAssessmentTemplate || !assessmentPermissions.view)
        ) {
            setActiveTab('exportSelection');
        }
    }, [activeTab, hasAssessmentTemplate, assessmentPermissions]);

    return (
        <Page
            className={styles.export}
            headerClassName={styles.exportPageHeader}
            header={
                <ScrollTabs
                    tabs={finalTabs}
                    active={activeTab}
                    renderer={TabTitle}
                    onClick={setActiveTab}
                    rendererParams={tabRendererParams}
                />
            }
            mainContentClassName={styles.mainContent}
            mainContent={
                <MultiViewContainer
                    containerClassName={styles.left}
                    activeClassName={styles.active}
                    views={views}
                    active={activeTab}
                />
            }
        />
    );
}

export default connect(mapStateToProps)(Export);
