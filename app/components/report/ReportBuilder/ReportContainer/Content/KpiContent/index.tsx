import React, { useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';

import {
    KPIs,
} from '@the-deep/reporting-module-components';

import {
    KpiConfigType,
} from '../../../../schema';
import {
    resolveTextStyle,
} from '../../../../utils';

import styles from './styles.css';

interface Props {
    className?: string;
    configuration: KpiConfigType | undefined;
}

function KpiContent(props: Props) {
    const {
        className,
        configuration,
    } = props;

    const finalData = useMemo(() => {
        const kpis = configuration?.items;
        const sourceStyle = configuration?.sourceContentStyle ?? {};
        const subtitleStyle = configuration?.subtitleContentStyle ?? {};
        const titleStyle = configuration?.titleContentStyle ?? {};
        const valueStyle = configuration?.valueContentStyle ?? {};

        const finalKpiData = kpis?.map((kpi, index) => ({
            key: `${kpi.title}-${index}`,
            value: kpi.value,
            title: kpi.title,
            subtitle: kpi.subtitle,
            source: kpi.source,
            url: kpi.sourceUrl,
            date: kpi.date,
            backgroundColor: kpi.color ?? '#f0f0f0',
            sourceStyle: resolveTextStyle(kpi.style?.sourceContentStyle, sourceStyle),
            subtitleStyle: resolveTextStyle(kpi.style?.subtitleContentStyle, subtitleStyle),
            titleStyle: resolveTextStyle(kpi.style?.titleContentStyle, titleStyle),
            valueStyle: resolveTextStyle(kpi.style?.valueContentStyle, valueStyle),
        }));
        return finalKpiData;
    }, [configuration]);

    return (
        <div className={_cs(className, styles.kpiContainer)}>
            <KPIs
                data={finalData ?? []}
            />
        </div>
    );
}

export default KpiContent;
