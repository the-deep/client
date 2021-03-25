import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
    Heading,
    Button,
    TextArea,
} from '@the-deep/deep-ui';

import FullPageHeader from '#dui/FullPageHeader';
import { breadcrumb } from '#utils/safeCommon';
import BackLink from '#dui/BackLink';
import LoadingAnimation from '#rscv/LoadingAnimation';

import useRequest from '#utils/request';
import _ts from '#ts';

import {
    PillarAnalysisElement,
    ProjectDetails,
    AppState,
} from '#typings';

import {
    projectIdFromRouteSelector,
    analysisIdFromRouteSelector,
    pillarAnalysisIdFromRouteSelector,
    activeProjectFromStateSelector,
} from '#redux';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    pillarId: pillarAnalysisIdFromRouteSelector(state),
    analysisId: analysisIdFromRouteSelector(state),
    projectId: projectIdFromRouteSelector(state),
    activeProject: activeProjectFromStateSelector(state),
});

interface PageProps {
    pillarId: number;
    projectId: number;
    analysisId: number;
    activeProject: ProjectDetails;
}

function PillarAnalysis(props: PageProps) {
    const {
        pillarId,
        analysisId,
        projectId,
        activeProject,
    } = props;

    const [value, setValue] = useState<string | undefined>();
    const [
        pendingPillarAnalysis,
        pillarAnalysis,
        ,
        ,
    ] = useRequest<PillarAnalysisElement>({
        url: `server://projects/${projectId}/analysis/${analysisId}/pillars/${pillarId}/`,
        method: 'GET',
        autoTrigger: true,
    });

    return (
        <div className={styles.pillarAnalysis}>
            <FullPageHeader
                className={styles.header}
                actionsClassName={styles.actions}
                contentClassName={styles.breadcrumb}
                heading={activeProject?.title}
                actions={(
                    <>
                        <Button
                            className={styles.button}
                            variant="primary"
                        >
                            {_ts('pillarAnalysis', 'saveButtonLabel')}
                        </Button>
                        <BackLink
                            className={styles.button}
                            defaultLink="/"
                        >
                            {_ts('pillarAnalysis', 'closeButtonLabel')}
                        </BackLink>
                    </>
                )}
            >
                {breadcrumb(pillarAnalysis?.analysisName, pillarAnalysis?.title ?? '')}
            </FullPageHeader>
            <div className={styles.content}>
                {pendingPillarAnalysis && <LoadingAnimation />}
                <div className={styles.inputsContainer}>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'mainStatementLabel')}
                        </Heading>
                        <TextArea
                            value={value}
                            onChange={setValue}
                            rows={10}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'infoGapLabel')}
                        </Heading>
                        <TextArea
                            value={value}
                            onChange={setValue}
                            rows={10}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default connect(mapStateToProps)(PillarAnalysis);
