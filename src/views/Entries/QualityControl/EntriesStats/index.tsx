import React, { useMemo, useCallback } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import { EntrySummary } from '#typings/entry';
import Numeral from '#rscv/Numeral';
import ListView from '#rscv/List/ListView';
import _ts from '#ts';

import { setEntriesViewFilterAction } from '#redux';

import styles from './styles.scss';

const noOp = () => {
    // no operation
};

interface Stats {
    id: string;
    title: string;
    value?: number;
}

type StaticEntrySummary = Omit<EntrySummary, 'orgTypeCount' | 'countPerTocItem'>;

const staticEntryStatTitles: { [ key in (keyof StaticEntrySummary)]: string } = {
    totalLeads: _ts('entries.qualityControl', 'totalLeads'),
    totalSources: _ts('entries.qualityControl', 'totalSources'),
    totalUnverifiedEntries: _ts('entries.qualityControl', 'totalUnverifiedEntries'),
    totalVerifiedEntries: _ts('entries.qualityControl', 'totalVerifiedEntries'),
};

const clickableKeys = ['totalUnverifiedEntries', 'totalVerifiedEntries'];

type FilterableKeys = 'totalUnverifiedEntries' | 'totalVerifiedEntries';

const filterValues: { [key in FilterableKeys]: {
    verified: boolean;
}} = {
    totalUnverifiedEntries: {
        verified: false,
    },
    totalVerifiedEntries: {
        verified: true,
    },
};

interface PropsFromDispatch {
    setEntriesViewFilter: typeof setEntriesViewFilterAction;
}

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setEntriesViewFilter: params => dispatch(setEntriesViewFilterAction(params)),
});

interface EntryStatProps {
    id: string;
    title: string;
    value: number;
    max: number;
    isClickable: boolean;
    handleClick: (v: {}) => void;
    className?: string;
}

function EntryStat({
    id,
    title,
    value = 0,
    max,
    isClickable,
    handleClick,
}: EntryStatProps) {
    const weight = value / max;
    const saturation = Math.min(100, 100 * weight);

    const onClickHandler = () => {
        if (isClickable) {
            if (clickableKeys.includes(id)) {
                const v = filterValues[id as FilterableKeys];
                handleClick(v);
            } else {
                handleClick({ authoring_organizations: [Number(id)] });
            }
        }
    };

    return (
        <div
            className={_cs(
                styles.stat,
                isClickable && styles.clickable,
            )}
            style={{
                filter: `grayscale(${100 - saturation}%)`,
            }}
            tabIndex={0}
            role="button"
            onKeyDown={noOp}
            onClick={onClickHandler}
        >
            <div className={styles.value}>
                <Numeral
                    value={value}
                    precision={0}
                />
            </div>
            <div className={styles.title}>
                {title}
            </div>
        </div>
    );
}

const statsKeySelector = (d: Stats) => d.id;

const defaultStats: EntrySummary = {
    totalLeads: 0,
    totalSources: 0,
    totalUnverifiedEntries: 0,
    totalVerifiedEntries: 0,
    orgTypeCount: [],
};

interface ComponentProps {
    className?: string;
    stats?: EntrySummary;
    entriesFilters: {};
}

type Props = ComponentProps & PropsFromDispatch;

function EntriesStats(props: Props) {
    const {
        stats = defaultStats,
        className,
        entriesFilters,
        setEntriesViewFilter,
    } = props;

    const {
        orgTypeCount,
        ...staticStats
    } = stats;

    const handleClick = useCallback((filter: {}) => {
        setEntriesViewFilter({ filters: { ...entriesFilters, ...filter } });
    }, [setEntriesViewFilter, entriesFilters]);

    const statsList: Stats[] = useMemo(() => {
        const list = Object.keys(staticEntryStatTitles).map(k => ({
            id: k,
            isClickable: clickableKeys.includes(k),
            handleClick,
            title: staticEntryStatTitles[k as keyof StaticEntrySummary],
            value: staticStats[k as keyof StaticEntrySummary],
        }));

        const orgTypeItems = orgTypeCount.map(orgType => ({
            id: String(orgType.org.id),
            isClickable: true,
            handleClick,
            title: orgType.org.shortName ?? orgType.org.title,
            value: orgType.count,
        }));

        return [
            ...list,
            ...orgTypeItems,
        ];
    }, [staticStats, orgTypeCount, handleClick]);

    const max = useMemo(() => (
        Math.max(0, ...statsList.map(d => d.value ?? 0))
    ), [statsList]);

    const statsRendererParams = (_: string, d: Stats) => ({
        ...d,
        max,
    } as EntryStatProps);

    return (
        <ListView
            className={_cs(className, styles.entriesStats)}
            renderer={EntryStat}
            data={statsList}
            keySelector={statsKeySelector}
            rendererParams={statsRendererParams}
        />
    );
}

export default connect(null, mapDispatchToProps)(EntriesStats);
