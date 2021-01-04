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

// TODO: Fix typescript lint
const tabs: {[key in TabElement]: string} = {
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
    view?: boolean;
}

interface ProjectRole {
    assessmentPermissions?: Permissions;
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
        projectRole: {
            assessmentPermissions = {},
        },
        currentUserActiveProject,
    } = props;

    // TODO: Reset this
    const [activeTab, setActiveTab] = useState<TabElement>('exportSelection');
    const hasAssessmentTemplate = !!currentUserActiveProject.assessmentTemplate;

    const tabRendererParams = useCallback((_: TabElement, title: string) => ({
        title,
    }), []);

    const views = useMemo(() => (
        {
            exportSelection: {
                component: () => (
                    <ExportSelection
                        projectId={projectId}
                    />
                ),
                lazyMount: true,
            },
            aryExportSelection: {
                component: () => (
                    <AssessmentExportSelection
                        projectId={projectId}
                    />
                ),
                lazyMount: true,
            },
            exportedFiles: {
                component: () => (
                    <ExportedFiles
                        projectId={projectId}
                    />
                ),
                lazyMount: true,
            },
        }
    ), [projectId]);

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
            headerClassName={styles.header}
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
                    views={views}
                    active={activeTab}
                />
            }
        />
    );
}

export default connect(mapStateToProps)(Export);
