import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#rscv/Numeral';
import LoadingAnimation from '#rscv/LoadingAnimation';
import CircularProgressBar from '#rsu/../v2/View/CircularProgressBar';


import notify from '#notify';
import _ts from '#ts';
import useRequest from '#utils/request';

import {
    ProjectsSummary,
} from '#typings';

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
                <div className={styles.item}>
                    <span>{summaryResponse?.projectsCount}</span>
                    <span>{_ts('home', 'projects')}</span>
                </div>
                <div className={styles.item}>
                    <span>{summaryResponse?.totalLeadsCount}</span>
                    <span>{_ts('home', 'totalAddedSources')}</span>
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.item}>
                    <CircularProgressBar
                        className={styles.chart}
                        width={80}
                        arcWidth={5}
                        value={taggedPercent}
                        imagePadding={10}
                    />
                    <div className={styles.content}>
                        <span className={styles.value}>
                            <Numeral
                                value={taggedPercent}
                                precision={2}
                                suffix="%"
                            />
                        </span>
                        <span className={styles.label}>
                            {_ts('home', 'sourcesTagged')}
                        </span>
                    </div>
                </div>
                <div className={styles.item}>
                    <CircularProgressBar
                        className={styles.chart}
                        width={80}
                        arcWidth={5}
                        value={verifiedPercent}
                        imagePadding={10}
                    />
                    <div className={styles.content}>
                        <span className={styles.value}>
                            <Numeral
                                value={verifiedPercent}
                                precision={2}
                                suffix="%"
                            />
                        </span>
                        <span className={styles.label}>
                            {_ts('home', 'sourcesTaggedValidated')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Summary;
