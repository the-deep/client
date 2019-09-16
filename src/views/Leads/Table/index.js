import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import RawTable from '#rscv/RawTable';
import modalize from '#rscg/Modalize';
import AccentButton from '#rsca/Button/AccentButton';
import TableHeader from '#rscv/TableHeader';
import FormattedDate from '#rscv/FormattedDate';
import { Link } from 'react-router-dom';
import {
    leadsForProjectTableViewSelector,
} from '#redux';
import { pathNames } from '#constants';
import EmmStatsModal from '#components/viewer/EmmStatsModal';
import _ts from '#ts';

import ActionButtons from '../ActionButtons';
import FileTypeViewer from './FileTypeViewer';
import styles from './styles.scss';

const ModalButton = modalize(AccentButton);

const propTypes = {
    className: PropTypes.string,
    activeSort: PropTypes.string.isRequired,
    leads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    headersMap: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    loading: PropTypes.bool.isRequired,
    emptyComponent: PropTypes.func.isRequired,
    setLeadPageActiveSort: PropTypes.func.isRequired,
    isFilterEmpty: PropTypes.bool,
    onSearchSimilarLead: PropTypes.func.isRequired,
    onRemoveLead: PropTypes.func.isRequired,
    onMarkProcessed: PropTypes.func.isRequired,
    onMarkPending: PropTypes.func.isRequired,
    activeProject: PropTypes.number,
};

const defaultProps = {
    className: undefined,
    activeProject: undefined,
    isFilterEmpty: false,
};

const mapStateToProps = state => ({
    leads: leadsForProjectTableViewSelector(state),
});

@connect(mapStateToProps)
export default class Table extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static leadKeyExtractor = lead => String(lead.id)

    constructor(props) {
        super(props);

        const { headersMap } = this.props;

        const headers = [
            {
                key: 'attachment_mime_type',
                order: 1,
                modifier: row => <FileTypeViewer lead={row} />,
            },
            {
                key: 'title',
                order: 2,
                modifier: (row) => {
                    const {
                        emmEntities,
                        emmTriggers,
                        title,
                    } = row;

                    const showEmm = emmEntities.length > 0
                        || emmTriggers.length > 0;

                    return (
                        <React.Fragment>
                            {title}
                            {showEmm &&
                                <ModalButton
                                    transparent
                                    modal={
                                        <EmmStatsModal
                                            emmTriggers={emmTriggers}
                                            emmEntities={emmEntities}
                                        />
                                    }
                                >
                                    {_ts('leads', 'emmButtonLabel')}
                                </ModalButton>
                            }
                        </React.Fragment>
                    );
                },
            },
            {
                key: 'page_count',
                order: 3,
                modifier: row => row.pageCount,
            },
            {
                key: 'source',
                order: 4,
            },
            {
                key: 'author',
                order: 5,
            },
            {
                key: 'published_on',
                order: 6,
                modifier: row => (
                    <FormattedDate
                        date={row.publishedOn}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'created_by',
                order: 7,
                modifier: row => (
                    <Link
                        key={row.createdBy}
                        className="created-by-link"
                        to={reverseRoute(pathNames.userProfile, { userId: row.createdBy })}
                    >
                        {row.createdByName}
                    </Link>
                ),
            },
            {
                key: 'assignee',
                order: 8,
                modifier: ({ assignee, assigneeDetails }) => (
                    assignee ? (
                        <Link
                            key={assignee}
                            className="assignee-link"
                            to={reverseRoute(pathNames.userProfile, { userId: assignee })}
                        >
                            {assigneeDetails.displayName}
                        </Link>
                    ) : null
                ),
            },
            {
                key: 'created_at',
                order: 9,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'confidentiality',
                order: 10,
                modifier: row => (
                    <div className="confidentiality">
                        {row.confidentiality}
                    </div>
                ),
            },
            {
                key: 'status',
                order: 11,
                modifier: row => (
                    <div className="status">
                        {row.status}
                    </div>
                ),
            },
            {
                key: 'no_of_entries',
                order: 12,
                modifier: row => row.noOfEntries,
            },
            {
                key: 'actions',
                order: 13,
                modifier: (row) => {
                    const {
                        onSearchSimilarLead,
                        onRemoveLead,
                        onMarkProcessed,
                        onMarkPending,
                        activeProject,
                    } = this.props;

                    return (
                        <ActionButtons
                            row={row}
                            onSearchSimilarLead={onSearchSimilarLead}
                            onRemoveLead={onRemoveLead}
                            onMarkProcessed={onMarkProcessed}
                            onMarkPending={onMarkPending}
                            activeProject={activeProject}
                        />
                    );
                },
            },
        ];

        this.headers = headers.map(h => ({
            ...h,
            ...headersMap[h.key],
        }));
    }

    leadModifier = (lead, columnKey) => {
        const header = this.headers.find(d => d.key === columnKey);
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
        const headerData = this.headers.find(h => h.key === key);
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
                    headers={this.headers}
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
