import React, { useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';

import ScrollTabs from '#rscv/ScrollTabs';
import TabTitle from '#components/general/TabTitle';
import MultiViewContainer from '#rscv/MultiViewContainer';
import Page from '#rscv/Page';

import {
    projectIdFromRouteSelector,
} from '#redux';

import {
    AppState,
} from '#typings';

import ExportedFiles from './ExportedFiles';
import ExportSelection from './ExportSelection';
import AssessmentExportSelection from './AssessmentExportSelection';

import styles from './styles.scss';

type TabElement = 'exportSelection' | 'aryExportSelection' | 'exportedFiles';

const tabs: {[key in TabElement]: string} = {
    exportSelection: 'Export Entries',
    aryExportSelection: 'Export Assessments',
    exportedFiles: 'Exported Files',
};

const mapStateToProps = (state: AppState) => ({
    projectId: projectIdFromRouteSelector(state),
});

interface PropsFromState {
    projectId: number;
}
function Export(props: PropsFromState) {
    const { projectId } = props;
    // TODO: Reset this
    const [activeTab, setActiveTab] = useState<TabElement>('exportSelection');

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

    return (
        <Page
            className={styles.export}
            headerClassName={styles.header}
            header={
                <ScrollTabs
                    tabs={tabs}
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
