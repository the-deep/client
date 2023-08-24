import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    KeyFigure,
} from '@the-deep/deep-ui';

import styles from './styles.module.css';

interface Props {
    className?: string;
    projectId: string;
}

function Statistics(props: Props) {
    const {
        className,
        projectId,
    } = props;
    // eslint-disable-next-line no-console
    console.log('here', projectId);

    // TODO dummy data
    const noOfAssessments = 220;
    const noOfJointAssessments = 25;
    const noOfUncoordinatedAssessments = 25;
    const noOfHarmoniziedAssessments = 43;
    const noOfMultisectoralAssessments = 74;
    const noOfSingleSectorAssessments = 36;

    const stakeholders = 168;
    const ingos = 54;
    const unAgencies = 54;
    const lngos = 54;
    const clusters = 54;
    const rcrc = 54;
    const donors = 54;
    const governments = 54;
    const acedemic = 24;

    const collectionTechniques = 7;
    const secondaryDataReviews = 78;
    const individualsSurveyed = 120;
    const householdsSurveyed = 54;
    const keyInformants = 76;
    const focusGroups = 220;
    const communityGroups = 47;

    return (
        <div className={_cs(styles.statistics, className)}>
            <div className={styles.row}>
                <KeyFigure
                    label="Assessments"
                    value={noOfAssessments}
                />
                <KeyFigure
                    label="Joint Assessments"
                    value={noOfJointAssessments}
                />
                <KeyFigure
                    label="Uncoordinated Assessments"
                    value={noOfUncoordinatedAssessments}
                />
                <KeyFigure
                    label="Harmonized Assessments"
                    value={noOfHarmoniziedAssessments}
                />
                <KeyFigure
                    label="Multisectoral Assessments"
                    value={noOfMultisectoralAssessments}
                />
                <KeyFigure
                    label="Single Sector Assessments"
                    value={noOfSingleSectorAssessments}
                />
            </div>
            <div className={styles.row}>
                <KeyFigure
                    label="Stakeholders"
                    value={stakeholders}
                />
                <KeyFigure
                    label="INGOs"
                    value={ingos}
                />
                <KeyFigure
                    label="UN Agencies"
                    value={unAgencies}
                />
                <KeyFigure
                    label="LNGOs"
                    value={lngos}
                />
                <KeyFigure
                    label="Cluster/Sectors"
                    value={clusters}
                />
                <KeyFigure
                    label="RCRC"
                    value={rcrc}
                />
                <KeyFigure
                    label="Donors"
                    value={donors}
                />
                <KeyFigure
                    label="Governments"
                    value={governments}
                />
                <KeyFigure
                    label="Acedemic and Research Institutes"
                    value={acedemic}
                />
            </div>
            <div className={styles.row}>
                <KeyFigure
                    label="Collection Techniques"
                    value={collectionTechniques}
                />
                <KeyFigure
                    label="Secondary Data Review"
                    value={secondaryDataReviews}
                />
                <KeyFigure
                    label="Inidividuals Surveyed"
                    value={individualsSurveyed}
                />
                <KeyFigure
                    label="Households Surveyed"
                    value={householdsSurveyed}
                />
                <KeyFigure
                    label="Key Informants Interviewed"
                    value={keyInformants}
                />
                <KeyFigure
                    label="Focus Group Discussions"
                    value={focusGroups}
                />
                <KeyFigure
                    label="Community Group Discussions"
                    value={communityGroups}
                />
            </div>
        </div>
    );
}

export default Statistics;
