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

import {
    ProjectStatSummaryQuery,
} from '#generated/types';

import styles from './styles.css';

type SummaryResponseType = NonNullable<ProjectStatSummaryQuery>['userProjectStatSummary']

interface Props {
    className?: string;
    summaryResponse?: SummaryResponseType;
}

function Summary(props: Props) {
    const {
        className,
        summaryResponse,
    } = props;

    const total = summaryResponse?.totalLeadsCount;
    const tagged = summaryResponse?.totalLeadsTaggedCount ?? 0;
    const verified = summaryResponse?.totalLeadsTaggedAndControlledCount ?? 0;

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
                value={summaryResponse?.projectsCount ?? 0}
                variant="complement1"
                coloredBackground
            />
            <InformationCard
                icon={<IoBookmarkOutline />}
                label={_ts('home', 'totalAddedSources')}
                value={summaryResponse?.totalLeadsCount ?? 0}
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
