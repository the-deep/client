import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';

import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import LoadingAnimation from '#rscv/LoadingAnimation';
import {
    leadsForProjectTableViewSelector,
} from '#redux';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    activeSort: PropTypes.string.isRequired,
    headers: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    leads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    loading: PropTypes.bool.isRequired,
    emptyComponent: PropTypes.func.isRequired,
    setLeadPageActiveSort: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};

const mapStateToProps = state => ({
    leads: leadsForProjectTableViewSelector(state),
});

@connect(mapStateToProps)
export default class Table extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static leadKeyExtractor = lead => String(lead.id)

    leadModifier = (lead, columnKey) => {
        const header = this.props.headers.find(d => d.key === columnKey);
        if (header.modifier) {
            return header.modifier(lead);
        }
        return lead[columnKey];
    }

    headerModifier = (headerData) => {
        const { activeSort } = this.props;

        let sortOrder = '';
        if (activeSort === headerData.key) {
            sortOrder = 'asc';
        } else if (activeSort === `-${headerData.key}`) {
            sortOrder = 'dsc';
        }
        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }

    handleTableHeaderClick = (key) => {
        const headerData = this.props.headers.find(h => h.key === key);
        // prevent click on 'actions' column
        if (!headerData.sortable) {
            return;
        }

        let { activeSort } = this.props;
        if (activeSort === key) {
            activeSort = `-${key}`;
        } else {
            activeSort = key;
        }
        this.props.setLeadPageActiveSort({ activeSort });
    }


    render() {
        const {
            leads,
            headers,
            emptyComponent,
            loading,
            isFilterEmpty,
            className,
        } = this.props;

        return (
            <div className={_cs(className, styles.tableContainer)}>
                <RawTable
                    data={leads}
                    dataModifier={this.leadModifier}
                    headerModifier={this.headerModifier}
                    headers={headers}
                    onHeaderClick={this.handleTableHeaderClick}
                    keySelector={Table.leadKeyExtractor}
                    className={styles.leadsTable}
                    emptyComponent={emptyComponent}
                    pending={loading}
                    isFiltered={!isFilterEmpty}
                />
            </div>
        );
    }
}
