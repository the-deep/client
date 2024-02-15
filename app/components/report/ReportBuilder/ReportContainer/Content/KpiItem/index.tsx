import React from 'react';
import { IoOpenOutline } from 'react-icons/io5';
import { PurgeNull } from '@togglecorp/toggle-form';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import {
    DateOutput,
} from '@the-deep/deep-ui';

import {
    AnalysisReportTextStyleType,
} from '#generated/types';

import {
    resolveKpiTextStyle,
} from '../../../../utils';
import styles from './styles.css';

interface Props {
    className?: string;
    title?: string;
    subtitle?: string;
    // abbreviateValue?: boolean;
    sourceTitle?: string;
    sourceUrl?: string;
    value?: number;
    date?: string;
    sourceStyle: PurgeNull<AnalysisReportTextStyleType>;
    subtitleStyle: PurgeNull<AnalysisReportTextStyleType>;
    titleStyle: PurgeNull<AnalysisReportTextStyleType>;
    valueStyle: PurgeNull<AnalysisReportTextStyleType>;
}

function KpiItem(props: Props) {
    const {
        className,
        title,
        subtitle,
        value = 0,
        // abbreviateValue,
        sourceUrl,
        sourceTitle,
        date,
        sourceStyle,
        subtitleStyle,
        titleStyle,
        valueStyle,
    } = props;

    return (
        <div className={_cs(styles.kpiItem, className)}>
            <div className={styles.heading}>
                <div
                    style={resolveKpiTextStyle(titleStyle)}
                >
                    {title}
                </div>
                <div
                    style={resolveKpiTextStyle(subtitleStyle)}
                >
                    {subtitle}
                </div>
            </div>
            <div className={styles.inline}>
                {/* TODO: Calculate abbreviated value if abbreviateValue is true */}
                {value !== 0 && (
                    <div
                        style={resolveKpiTextStyle(valueStyle)}
                    >
                        {value}
                    </div>
                )}
                <div className={styles.right}>
                    <DateOutput
                        value={date}
                    />
                    {isDefined(sourceUrl) && (
                        <a
                            style={resolveKpiTextStyle(sourceStyle)}
                            className={styles.link}
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <IoOpenOutline />
                            {sourceTitle}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default KpiItem;
