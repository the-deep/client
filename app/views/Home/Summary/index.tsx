import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    IoDocumentTextOutline,
    IoBookmarkOutline,
    IoDocumentOutline,
    IoCheckmarkCircle,
} from 'react-icons/io5';

import {
    Container,
    InformationCard,
    PercentageInformationCard,
} from '@the-deep/deep-ui';

import _ts from '#ts';

import { ProjectsSummary } from '#types';

import styles from './styles.css';

interface Props {
    className?: string;
    summaryResponse?: ProjectsSummary;
}

function Summary(props: Props) {
    const {
        className,
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
        <Container
            className={_cs(className, styles.summary)}
            heading="Summary of my Projects"
            contentClassName={styles.content}
            spacing="loose"
        >
            <InformationCard
                icon={<IoDocumentTextOutline />}
                label={_ts('home', 'projects')}
                value={summaryResponse?.projectsCount}
                variant="complement1"
                coloredBackground
            />
            <InformationCard
                icon={<IoBookmarkOutline />}
                label={_ts('home', 'totalAddedSources')}
                value={summaryResponse?.totalLeadsCount}
                variant="accent"
                coloredBackground
            />
            <PercentageInformationCard
                value={taggedPercent}
                variant="complement2"
                label={_ts('home', 'sourcesTagged')}
                icon={<IoDocumentOutline />}
            />
            <PercentageInformationCard
                value={verifiedPercent}
                label={_ts('home', 'sourcesTaggedValidated')}
                variant="complement1"
                icon={<IoCheckmarkCircle />}
            />
        </Container>
    );
}

export default Summary;
