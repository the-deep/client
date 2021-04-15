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
    ContainerProps,
} from '@the-deep/deep-ui';

import LoadingAnimation from '#rscv/LoadingAnimation';

import InformationCard from '#dui/InformationCard';
import PercentageInformationCard from '#dui/PercentageInformationCard';

import _ts from '#ts';

import {
    ProjectsSummary,
} from '#typings';

import styles from './styles.scss';

interface Props extends ContainerProps {
    className?: string;
    pending: boolean;
    summaryResponse?: ProjectsSummary;
}


function Summary(props: Props) {
    const {
        className,
        pending,
        summaryResponse,
        contentClassName,
        ...otherProps
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
            contentClassName={_cs(contentClassName, styles.content)}
            {...otherProps}
        >
            {pending && <LoadingAnimation />}
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
