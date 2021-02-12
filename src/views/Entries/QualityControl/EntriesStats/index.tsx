import React, { useMemo, useCallback } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import { EntrySummary } from '#typings/entry';
import Numeral from '#rscv/Numeral';
import ListView from '#rscv/List/ListView';
import Icon from '#rscg/Icon';
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

interface VerificationKeyValue {
    key: FilterableKeys;
    value: boolean;
}

const filterValues: VerificationKeyValue[] = [
    {
        key: 'totalUnverifiedEntries',
        value: false,
    },
    {
        key: 'totalVerifiedEntries',
        value: true,
    },
];

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
    isSelected: boolean;
    isClickable: boolean;
    handleClick: (v: {}) => void;
    className?: string;
    entriesFilters: {
        verified?: boolean;
        'authoring_organization_types'?: number[];
    };
}

function EntryStat({
    id,
    title,
    value = 0,
    max,
    isSelected,
    isClickable,
    handleClick,
    entriesFilters: {
        verified: oldVerificationValue,
        authoring_organization_types: oldOrganizationType = [],
    },
}: EntryStatProps) {
    const weight = value / max;
    const saturation = Math.min(100, 100 * weight);

    const onClickHandler = () => {
        if (isClickable) {
            if (clickableKeys.includes(id)) {
                const verified = filterValues.find(f => f.key === id)?.value;
                const newVerificationValue = isNotDefined(oldVerificationValue) ||
                    oldVerificationValue !== verified ? verified : undefined;
                handleClick({ verified: newVerificationValue });
            } else {
                const newOrganizationType = oldOrganizationType.length > 0
                    ? oldOrganizationType.filter(v => v !== Number(id))
                    : [...oldOrganizationType, Number(id)];
                handleClick({ authoring_organization_types: newOrganizationType });
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
            {isSelected && (
                <Icon
                    className={styles.checkmark}
                    name="checkCircle"
                />
            )}
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
    entriesFilters: {
        verified?: boolean;
        'authoring_organization_types'?: number[];
    };
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

    const {
        verified: oldVerificationValue,
        authoring_organization_types: oldOrganizationType = [],
    } = entriesFilters;

    const verificationFilter = useMemo(() => (isNotDefined(oldVerificationValue)
        ? [] : filterValues.filter(v => v.value === oldVerificationValue).map(v => v.key)
    ), [oldVerificationValue]);

    const selectedFilter = useMemo(() =>
        [...oldOrganizationType, ...verificationFilter],
    [oldOrganizationType, verificationFilter]);

    const handleClick = useCallback((filter: {}) => {
        setEntriesViewFilter({ filters: { ...entriesFilters, ...filter } });
    }, [setEntriesViewFilter, entriesFilters]);

    const statsList: Stats[] = useMemo(() => {
        const list = Object.keys(staticEntryStatTitles).map(k => ({
            id: k,
            isClickable: clickableKeys.includes(k),
            isSelected: selectedFilter.some(f => f === k),
            handleClick,
            title: staticEntryStatTitles[k as keyof StaticEntrySummary],
            value: staticStats[k as keyof StaticEntrySummary],
        }));

        const orgTypeItems = orgTypeCount.map(orgType => ({
            id: String(orgType.org.id),
            isClickable: true,
            isSelected: selectedFilter.some(f => f === orgType.org.id),
            handleClick,
            title: orgType.org.shortName ?? orgType.org.title,
            value: orgType.count,
        }));

        return [
            ...list,
            ...orgTypeItems,
        ];
    },
    [
        staticStats,
        orgTypeCount,
        handleClick,
        selectedFilter,
    ]);

    const max = useMemo(() => (
        Math.max(0, ...statsList.map(d => d.value ?? 0))
    ), [statsList]);

    const statsRendererParams = (_: string, d: Stats) => ({
        ...d,
        max,
        entriesFilters,
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
