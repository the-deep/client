import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    Header,
} from '@the-deep/deep-ui';
import { IoMenuOutline } from 'react-icons/io5';

import {
    AnalysisReportHeadingConfigurationVariantEnum,
} from '#generated/types';

import {
    ReportContainerType,
} from '../schema';
import styles from './styles.css';

const variantToStyleMapping = {
    H1: styles.headingOne,
    H2: styles.headingTwo,
    H3: styles.headingThree,
    H4: styles.headingFour,
} as const;

interface TocItemProps {
    label: string | undefined;
    variant: AnalysisReportHeadingConfigurationVariantEnum | undefined;
}

function TocItem(props: TocItemProps) {
    const {
        label,
        variant,
    } = props;

    return (
        <div
            className={_cs(
                styles.tocItem,
                variant && variantToStyleMapping[variant],
            )}
        >
            {label}
        </div>
    );
}

const containerKeySelector = (item: ReportContainerType) => item.clientId;

interface Props {
    className?: string;
    data: ReportContainerType[] | undefined;
}

function Toc(props: Props) {
    const {
        className,
        data,
    } = props;

    const tocRendererParams = useCallback((_: string, item: ReportContainerType) => ({
        label: item.contentConfiguration?.heading?.content,
        variant: item.contentConfiguration?.heading?.variant,
    }), []);

    return (
        <div className={_cs(styles.toc, className)}>
            <Header
                className={styles.header}
                headingSectionClassName={styles.headingSection}
                icons={(
                    <IoMenuOutline className={styles.icon} />
                )}
                heading="Table of Contents"
                headingSize="medium"
            />
            <ListView
                className={styles.list}
                keySelector={containerKeySelector}
                renderer={TocItem}
                rendererParams={tocRendererParams}
                data={data}
                filtered={false}
                pending={false}
                errored={false}
            />
        </div>
    );
}

export default Toc;
