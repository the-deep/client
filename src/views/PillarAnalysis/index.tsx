import React, { useState } from 'react';
import { connect } from 'react-redux';

import Button from '#dui/Button';
import FullPageHeader from '#components/general/FullPageHeader';
import { breadcrumb } from '#utils/safeCommon';
import BackLink from '#dui/BackLink';
import TextArea from '#dui/TextArea';
import Heading from '#dui/Heading';
import LoadingAnimation from '#rscv/LoadingAnimation';

import useRequest from '#utils/request';
import _ts from '#ts';

import {
    PillarAnalysisElement,
    AppState,
} from '#typings';

import {
    projectIdFromRouteSelector,
    analysisIdFromRouteSelector,
    pillarAnalysisIdFromRouteSelector,
} from '#redux';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    pillarId: pillarAnalysisIdFromRouteSelector(state),
    analysisId: analysisIdFromRouteSelector(state),
    projectId: projectIdFromRouteSelector(state),
});

interface PageProps {
    pillarId: number;
    projectId: number;
    analysisId: number;
}

function PillarAnalysis(props: PageProps) {
    const {
        pillarId,
        analysisId,
        projectId,
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
