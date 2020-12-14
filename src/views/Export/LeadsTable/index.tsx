import React, { useMemo } from 'react';
import {
    compareString,
    compareDate,
    _cs,
} from '@togglecorp/fujs';

import AccentButton from '#rsca/Button/AccentButton';
import FormattedDate from '#rscv/FormattedDate';
import Table from '#rscv/Table';

import _ts from '#ts';

import { SelectedLead } from '../index';
import styles from './styles.scss';

const defaultSort = {
    key: 'createdAt',
    order: 'dsc',
};

interface ComponentProps {
    onSelectLeadChange: (key: number, selected: boolean) => void;
    onSelectAllClick: (v: boolean) => void;
    pending?: boolean;
    leads: SelectedLead[];
    className?: string;
}

const leadKeyExtractor = (d: SelectedLead) => d.id;

function ExportLeadsTable(props: ComponentProps) {
    const {
        leads,
        pending,
        className,
        onSelectAllClick,
        onSelectLeadChange,
    } = props;

    const areSomeNotSelected = useMemo(() => leads.some(l => !l.selected), [leads]);
    const isDisabled = useMemo(() => leads.length === 0, [leads]);

    const headers = useMemo(() => ([
        {
            key: 'select',
            labelModifier: () => {
                const title = areSomeNotSelected
                    ? _ts('export.leadsTable', 'selectAllLeadsTitle')
                    : _ts('export.leadsTable', 'unselectAllLeadsTitle');

                const icon = areSomeNotSelected
                    ? 'checkboxOutlineBlank'
                    : 'checkbox';

                return (
                    <AccentButton
                        className={styles.selectAllCheckbox}
                        title={title}
                        iconName={icon}
                        onClick={() => onSelectAllClick(areSomeNotSelected)}
                        smallVerticalPadding
                        transparent
                        disabled={isDisabled}
                    />
                );
            },
            order: 1,
            sortable: false,
            modifier: (d: SelectedLead) => {
                const key = leadKeyExtractor(d);

                const title = !d.selected
                    ? _ts('export.leadsTable', 'selectLeadTitle')
                    : _ts('export.leadsTable', 'unselectLeadTitle');

                const icon = !d.selected
                    ? 'checkboxOutlineBlank'
                    : 'checkbox';

                return (
                    <AccentButton
                        title={title}
                        iconName={icon}
                        onClick={() => onSelectLeadChange(key, !d.selected)}
                        smallVerticalPadding
                        transparent
                    />
                );
            },
        },
        {
            key: 'title',
            label: _ts('export', 'titleLabel'),
            order: 2,
            sortable: true,
            comparator: (a: SelectedLead, b: SelectedLead) => compareString(a.title, b.title),
        },
        {
            key: 'createdAt',
            label: _ts('export', 'createdAtLabel'),
            order: 3,
            sortable: true,
            comparator: (a: SelectedLead, b: SelectedLead) => (
                compareDate(a.createdAt, b.createdAt) ||
                compareString(a.title, b.title)
            ),
            modifier: (row: SelectedLead) => (
                <FormattedDate
                    value={row.createdAt}
                    mode="dd-MM-yyyy hh:mm"
                />
            ),
        },
    ]), [
        onSelectLeadChange,
        onSelectAllClick,
        areSomeNotSelected,
        isDisabled,
    ]);

    return (
        <Table
            pending={pending}
            className={_cs(className, styles.leadsTable)}
            data={leads}
            headers={headers}
            defaultSort={defaultSort}
            keySelector={leadKeyExtractor}
        />
    );
}

export default ExportLeadsTable;
