import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import LoadingAnimation from '#rscv/LoadingAnimation';
import {
    leadsForProjectTableViewSelector,
} from '#redux';
import styles from './styles.scss';

const propTypes = {
    activeSort: PropTypes.string.isRequired,
    headers: PropTypes.array.isRequired,
    leads: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    emptyComponent: PropTypes.func.isRequired,
    setLeadPageActiveSort: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    leads: leadsForProjectTableViewSelector(state),
});

@connect(mapStateToProps)
export default class Table extends React.Component {
    static propTypes = propTypes;
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
        return (
            <div className={styles.tableContainer}>
                <div className={styles.scrollWrapper}>
                    <RawTable
                        data={this.props.leads}
                        dataModifier={this.leadModifier}
                        headerModifier={this.headerModifier}
                        headers={this.props.headers}
                        onHeaderClick={this.handleTableHeaderClick}
                        keySelector={Table.leadKeyExtractor}
                        className={styles.leadsTable}
                        emptyComponent={this.props.emptyComponent}
                    />
                    { this.props.loading && <LoadingAnimation large /> }
                </div>
            </div>
        );
    }
}
