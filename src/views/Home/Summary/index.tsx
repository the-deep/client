import React from 'react';
import { _cs } from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Icon from '#rscg/Icon';

import InformationBox from '#components/viewer/InformationBox';
import svgPaths from '#constants/svgPaths';

import _ts from '#ts';

import {
    ProjectsSummary,
} from '#typings';

import InfoBoxWithDonut from './InfoBoxWithDonut';
import styles from './styles.scss';

interface Props {
    className?: string;
    pending: boolean;
    summaryResponse?: ProjectsSummary;
}


function Summary(props: Props) {
    const {
        className,
        pending,
        summaryResponse,
    } = props;

    const {
        totalLeadsCount: total = 0,
        totalLeadsTaggedCount: tagged = 0,
        totalLeadsTaggedAndVerifiedCount: verified = 0,
    } = summaryResponse ?? {};
    const taggedPercent = total ? (tagged / total) * 100 : 0;
    const verifiedPercent = total ? (verified / total) * 100 : 0;

    return (
        <div className={_cs(className, styles.summary)}>
            {pending && <LoadingAnimation />}
            <div className={styles.row}>
                <InformationBox
                    className={styles.infoBox}
                    icon={(
                        <Icon
                            className={styles.icon}
                            name="noteIcon"
                        />
                    )}
                    label={_ts('home', 'projects')}
                    value={summaryResponse?.projectsCount}
                    variant="accent"
                />
                <InformationBox
                    className={styles.infoBox}
                    icon={(
                        <Icon
                            className={styles.icon}
                            name="bookmarkIcon"
                        />
                    )}
                    label={_ts('home', 'totalAddedSources')}
                    value={summaryResponse?.totalLeadsCount}
                    variant="complement"
                />
            </div>
            <div className={styles.row}>
                <InfoBoxWithDonut
                    className={styles.tagged}
                    percent={taggedPercent}
                    variant="accent"
                    label={_ts('home', 'sourcesTagged')}
                    image={`${svgPaths.documentIcon}#document`}
                />
                <InfoBoxWithDonut
                    className={styles.verified}
                    percent={verifiedPercent}
                    label={_ts('home', 'sourcesTaggedValidated')}
                    variant="complement"
                    image={`${svgPaths.checkmarkCircleFillIcon}#checkmark`}
                />
            </div>
        </div>
    );
}

export default Summary;
