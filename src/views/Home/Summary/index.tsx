import React from 'react';
import { _cs } from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Icon from '#rscg/Icon';

import InformationBox from '#components/viewer/InformationBox';
import svgPaths from '#constants/svgPaths';

import notify from '#notify';
import _ts from '#ts';
import useRequest from '#utils/request';

import {
    ProjectsSummary,
} from '#typings';

import InfoBoxWithDonut from './InfoBoxWithDonut';
import styles from './styles.scss';

interface Props {
    className?: string;
    selectedProject?: number;
}


function Summary(props: Props) {
    const {
        className,
    } = props;

    const [
        pending,
        summaryResponse,
    ] = useRequest<ProjectsSummary>({
        url: 'server://projects-stat/summary/',
        method: 'GET',
        autoTrigger: true,
        schemaName: 'userExportsGetResponse',
        onFailure: (_, { messageForNotification }) => {
            notify.send({
                title: _ts('home', 'summaryOfMyProjectsHeading'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
    });

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
