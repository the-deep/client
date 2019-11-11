import PropTypes from 'prop-types';
import React from 'react';
import {
    compareString,
    compareDate,
    _cs,
} from '@togglecorp/fujs';

import AccentButton from '#rsca/Button/AccentButton';
import FormattedDate from '#rscv/FormattedDate';
import Table from '#rscv/Table';

import _ts from '#ts';

import styles from './styles.scss';

const defaultSort = {
    key: 'createdAt',
    order: 'dsc',
};

const propTypes = {
    onSelectLeadChange: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    leads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    pending: false,
    leads: [],
};

export default class ExportLeadsTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static leadKeyExtractor = d => d.id;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'select',
                labelModifier: () => {
                    const {
                        leads,
                        onSelectAllClick,
                    } = this.props;

                    const areSomeNotSelected = leads.some(l => !l.selected);

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
                            disabled={leads.length === 0}
                        />
                    );
                },
                order: 1,
                sortable: false,
                modifier: (d) => {
                    const { onSelectLeadChange } = this.props;

                    const key = ExportLeadsTable.leadKeyExtractor(d);

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
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: _ts('export', 'createdAtLabel'),
                order: 3,
                sortable: true,
                comparator: (a, b) => (
                    compareDate(a.createdAt, b.createdAt) ||
                    compareString(a.title, b.title)
                ),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
        ];
    }

    render() {
        const {
            className,
            leads,
            pending,
        } = this.props;

        return (
            <Table
                pending={pending}
                className={_cs(className, styles.leadsTable)}
                data={leads}
                headers={this.headers}
                defaultSort={defaultSort}
                keySelector={ExportLeadsTable.leadKeyExtractor}
            />
        );
    }
}
