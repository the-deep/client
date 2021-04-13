import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    _cs,
    isDefined,
    reverseRoute,
} from '@togglecorp/fujs';

import RawTable from '#rscv/RawTable';
import Numeral from '#rscv/Numeral';
import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import TableHeader from '#rscv/TableHeader';
import FormattedDate from '#rscv/FormattedDate';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Checkbox from '#rsci/Checkbox';
import CheckboxWithIndeterminate from '#rsu/../v2/Input/Checkbox';

import Cloak from '#components/general/Cloak';
import EmmStatsModal from '#components/viewer/EmmStatsModal';
import Badge from '#components/viewer/Badge';
import DropdownEdit from '#components/general/DropdownEdit';

import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import { organizationTitleSelector } from '#entities/organization';
import {
    leadsForProjectTableViewSelector,
    patchLeadAction,
} from '#redux';
import { pathNames } from '#constants';
import {
    RequestClient,
    methods,
} from '#request';
import _ts from '#ts';
import useArraySelection from '#hooks/multiSelection';
import ActionButtons from '../ActionButtons';
import FileTypeViewer from './FileTypeViewer';
import BulkActions from './BulkActions';
import styles from './styles.scss';

const emptyObject = {};
const ModalButton = modalize(Button);

const mapStateToProps = state => ({
    leads: leadsForProjectTableViewSelector(state),
});

const mapDispatchToProps = dispatch => ({
    patchLead: params => dispatch(patchLeadAction(params)),
});

const requestOptions = {
    leadOptionsRequest: {
        url: '/lead-options/',
        method: methods.GET,
        query: ({ props: { activeProject } }) => ({
            projects: [activeProject],
            fields: [
                'priority',
                'status',
                'confidentiality',
            ],
        }),
        onPropsChanged: ['activeProject'],
        onMount: true,
        extras: {
            schemaName: 'projectLeadFilterOptions',
        },
    },
    leadPatchRequest: {
        url: ({ params: { leadId } }) => `/v2/leads/${leadId}/`,
        method: methods.PATCH,
        body: ({ params: { patchBody } }) => patchBody,
        onSuccess: ({ response, props }) => {
            if (props.patchLead) {
                props.patchLead({ lead: response });
            }
        },
        onFailure: notifyOnFailure(_ts('leads', 'leads')),
        onFatal: notifyOnFatal(_ts('leads', 'leads')),
    },
};

const shouldHideLeadEdit = ({ leadPermissions }) => !leadPermissions.modify;

const leadKeyExtractor = lead => String(lead.id);

function Table(props) {
    const {
        headersMap,
        leads,
        emptyComponent,
        loading,
        isFilterEmpty,
        className,
        requests: {
            leadOptionsRequest: {
                response: {
                    confidentiality: confidentialityOptions,
                    status: statusOptions,
                    priority,
                } = emptyObject,
            },
            leadPatchRequest,
        },
        onSearchSimilarLead,
        onRemoveLead,
        activeProject,
        activeSort,
        setLeadPageActiveSort,
        onLeadsRemoveSuccess,
        filters,
        containerRef,
    } = props;

    const { pending } = leadPatchRequest;

    const {
        values: selectedLeads,
        isItemPresent,
        clickOnItem,
        addItems,
        removeItems,
        clearSelection,
    } = useArraySelection(
        leadKeyExtractor,
        [],
    );

    useEffect(
        () => {
            clearSelection();
        },
        [activeProject, filters],
    );

    const handleLeadsRemove = useCallback((leadIds) => {
        removeItems(leadIds);
        onLeadsRemoveSuccess();
    }, [removeItems, onLeadsRemoveSuccess]);

    const handleSelectAllCheckboxClick = useCallback(
        (newValue) => {
            if (newValue) {
                addItems(leads);
            } else {
                removeItems(leads);
            }
        }, [leads, addItems, removeItems],
    );

    const {
        areAllChecked,
        areSomeChecked,
    } = useMemo(() => {
        if (!leads || leads.length === 0) {
            return {
                areAllChecked: false,
                areSomeChecked: false,
            };
        }
        const filteredLeads = leads.filter(l => isItemPresent(leadKeyExtractor(l)));
        return {
            areAllChecked: filteredLeads.length === leads.length,
            areSomeChecked: filteredLeads.length < leads.length && filteredLeads.length > 0,
        };
    }, [leads, isItemPresent]);

    const headers = useMemo(
        () => [
            {
                key: 'multi_select',
                order: 0,
                modifier: (row) => {
                    const itemSelected = selectedLeads.length > 0 && (
                        selectedLeads.find(lead => lead.id === row.id)
                    );

                    return (
                        <Checkbox
                            label=""
                            onChange={() => clickOnItem(row)}
                            value={!!itemSelected}
                            className={styles.checkbox}
                        />
                    );
                },
                label: (
                    <CheckboxWithIndeterminate
                        onChange={handleSelectAllCheckboxClick}
                        value={areAllChecked}
                        name="selectAll"
                        className={styles.selectAllCheckbox}
                        indeterminate={areSomeChecked}
                    />
                ),
            },
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
                        assessmentId,
                    } = row;

                    const showEmm = (isDefined(emmEntities) && emmEntities.length > 0)
                        || (isDefined(emmTriggers) && emmTriggers.length > 0);

                    return (
                        <div className={styles.titleContainer}>
                            <div className={styles.title}>
                                {title}
                            </div>
                            {showEmm &&
                                <ModalButton
                                    className={styles.emmButton}
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
                            {isDefined(assessmentId) &&
                                <Badge
                                    className={styles.assessmentBadge}
                                    icon="assessment"
                                    tooltip={_ts('leads', 'assessmentBadgeTooltip')}
                                />
                            }
                        </div>
                    );
                },
            },
            {
                key: 'page_count',
                order: 3,
                defaultSortOrder: 'dsc',
                modifier: ({ pageCount }) => {
                    if (pageCount === 0) {
                        return '-';
                    }
                    return (
                        <Numeral
                            value={pageCount}
                            precision={0}
                        />
                    );
                },
            },
            {
                key: 'source',
                order: 4,
                modifier: ({
                    sourceDetail,
                    sourceRaw,
                }) => (sourceDetail ? organizationTitleSelector(sourceDetail) : sourceRaw),
            },
            {
                key: 'authors',
                order: 5,
                modifier: ({
                    authorsDetail,
                    authorRaw,
                }) => ((authorsDetail && authorsDetail.length > 0)
                    ? authorsDetail.map(organizationTitleSelector).join(', ')
                    : authorRaw),
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
                    <div className={styles.inlineEditContainer}>
                        <div className={styles.label}>
                            {row.confidentiality}
                        </div>
                        <Cloak
                            hide={shouldHideLeadEdit}
                            render={
                                <DropdownEdit
                                    currentSelection={row.confidentiality}
                                    className={styles.dropdown}
                                    options={confidentialityOptions}
                                    disabled={selectedLeads.length > 0}
                                    onItemSelect={key => leadPatchRequest.do({
                                        patchBody: { confidentiality: key },
                                        leadId: row.id,
                                    })}
                                />
                            }
                        />
                    </div>
                ),
            },
            {
                key: 'status',
                order: 11,
                modifier: row => (
                    <div className={styles.inlineEditContainer}>
                        <div className={styles.label}>
                            {row.status}
                        </div>
                        <Cloak
                            hide={shouldHideLeadEdit}
                            render={
                                <DropdownEdit
                                    currentSelection={row.status}
                                    className={styles.dropdown}
                                    options={statusOptions}
                                    disabled={selectedLeads.length > 0}
                                    onItemSelect={key => leadPatchRequest.do({
                                        patchBody: { status: key },
                                        leadId: row.id,
                                    })}
                                />
                            }
                        />
                    </div>
                ),
            },
            {
                key: 'priority',
                order: 12,
                modifier: row => (
                    <div className={styles.inlineEditContainer}>
                        <div className={styles.label}>
                            {row.priorityDisplay}
                        </div>
                        <Cloak
                            hide={shouldHideLeadEdit}
                            render={
                                <DropdownEdit
                                    currentSelection={row.priority}
                                    className={styles.dropdown}
                                    options={priority}
                                    disabled={selectedLeads.length > 0}
                                    onItemSelect={key => leadPatchRequest.do({
                                        patchBody: { priority: key },
                                        leadId: row.id,
                                    })}
                                />
                            }
                        />
                    </div>
                ),
            },
            {
                key: 'entries_count',
                order: 13,
                defaultSortOrder: 'dsc',
                modifier: (row) => {
                    const percentage = row.entriesCount
                        ? ((row.verifiedEntriesCount ?? 0) / row.entriesCount) * 100
                        : 0;
                    return (
                        <div
                            title={_ts(
                                'leads',
                                'verifiedEntries',
                                {
                                    verifiedCount: row.verifiedEntriesCount,
                                    entriesCount: row.entriesCount,
                                },
                            )}
                        >
                            <Numeral
                                className={styles.entriesCount}
                                value={row.entriesCount}
                                precision={0}
                            />

                            <Numeral
                                value={percentage}
                                prefix="("
                                suffix="%)"
                                precision={0}
                            />
                        </div>
                    );
                },
            },
            {
                key: 'actions',
                order: 14,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        onSearchSimilarLead={onSearchSimilarLead}
                        onRemoveLead={onRemoveLead}
                        activeProject={activeProject}
                        disabled={selectedLeads.length > 0}
                    />
                ),
            },
        ].map(h => ({
            ...headersMap[h.key],
            ...h,
        })),
        [
            handleSelectAllCheckboxClick,
            areAllChecked,
            areSomeChecked,
            selectedLeads,
            clickOnItem,
            confidentialityOptions,
            leadPatchRequest,
            statusOptions,
            priority,
            onSearchSimilarLead,
            onRemoveLead,
            activeProject,
            headersMap,
        ],
    );

    const leadModifier = useCallback(
        (lead, columnKey) => {
            const header = headers.find(d => d.key === columnKey);
            return header.modifier(lead) ?? lead[columnKey];
        }, [headers],
    );

    const headerModifier = useCallback(
        (headerData) => {
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
        }, [activeSort],
    );

    const handleTableHeaderClick = useCallback(
        (key) => {
            const headerData = headers.find(h => h.key === key);
            // prevent click on 'actions' column
            if (!headerData || !headerData.sortable) {
                return;
            }

            let tmpActiveSort = activeSort;

            const isAsc = tmpActiveSort.charAt(0) !== '-';

            const isCurrentHeaderSorted = tmpActiveSort === key
                || (tmpActiveSort.substr(1) === key && !isAsc);

            if (isCurrentHeaderSorted) {
                tmpActiveSort = isAsc ? `-${key}` : key;
            } else {
                tmpActiveSort = headerData.defaultSortOrder === 'dsc' ? `-${key}` : key;
            }

            setLeadPageActiveSort({ activeSort: tmpActiveSort });
        }, [headers, activeSort, setLeadPageActiveSort],
    );

    return (
        <div
            ref={containerRef}
            className={_cs(className, styles.tableContainer)}
        >
            {pending && <LoadingAnimation />}
            <RawTable
                data={leads}
                dataModifier={leadModifier}
                headerModifier={headerModifier}
                headers={headers}
                onHeaderClick={handleTableHeaderClick}
                keySelector={leadKeyExtractor}
                className={styles.leadsTable}
                emptyComponent={emptyComponent}
                pending={loading}
                isFiltered={!isFilterEmpty}
            />
            {selectedLeads.length > 0 && (
                <BulkActions
                    selectedLeads={selectedLeads}
                    activeProject={activeProject}
                    onRemoveItems={handleLeadsRemove}
                    onClearSelection={clearSelection}
                />
            )}
        </div>
    );
}
export default connect(mapStateToProps, mapDispatchToProps)(
    RequestClient(requestOptions)(
        Table,
    ),
);

Table.propTypes = {
    className: PropTypes.string,
    activeSort: PropTypes.string.isRequired,
    leads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    headersMap: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    loading: PropTypes.bool.isRequired,
    emptyComponent: PropTypes.func.isRequired,
    setLeadPageActiveSort: PropTypes.func.isRequired,
    isFilterEmpty: PropTypes.bool,
    onSearchSimilarLead: PropTypes.func.isRequired,
    onRemoveLead: PropTypes.func.isRequired,
    activeProject: PropTypes.number,
};

Table.defaultProps = {
    className: undefined,
    activeProject: undefined,
    isFilterEmpty: false,
};
