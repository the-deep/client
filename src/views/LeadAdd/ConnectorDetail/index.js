import React, { useCallback, useState, useMemo } from 'react';
import { _cs, isTruthy, isDefined } from '@togglecorp/fujs';
import PropTypes from 'prop-types';
import { Checkbox } from '@togglecorp/toggle-ui';

import ListView from '#rscv/List/ListView';
import LeadPreview from '#components/leftpanel/LeadPreview';
import Message from '#rscv/Message';

import useRequest from '#restrequest';
import Button from '#rsca/Button';
import Pager from '#rscv/Pager';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import {
    useArraySelection,
    useArrayEdit,
} from '#hooks/stateManagement';
import _ts from '#ts';

import ConnectorLeadsFilter from './ConnectorLeadsFilter';
import ConnectorLeadItem from './ConnectorLeadItem';
import {
    leadKeySelector,
    LEAD_TYPE,
    LEAD_STATUS,
} from '../utils';

import styles from './styles.scss';

const connectorLeadStatusToLeadStatusMap = {
    // not_processed: LEAD_STATUS.warning,
    // success: LEAD_STATUS.complete,
    success: undefined,
    failure: LEAD_STATUS.invalid,
    processing: LEAD_STATUS.warning,
};

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    selectedConnectorSource: PropTypes.number,
    selectedConnector: PropTypes.number,
    onLeadsAdd: PropTypes.func.isRequired,
    onOrganizationsAdd: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    selectedConnector: undefined,
    selectedConnectorSource: undefined,
};

function ConnectorDetail(props) {
    const {
        className,
        projectId,
        selectedConnectorSource,
        selectedConnector,
        onLeadsAdd,
        onOrganizationsAdd,
    } = props;

    // TODO: validate this selected connector lead
    const [selectedConnectorLead, setSelectedConnectorLead] = useState(undefined);
    const [leadsUnfiltered, setLeads] = useState(undefined);
    const [,, modifyLead] = useArrayEdit(setLeads, leadKeySelector);
    const [activePage, setActivePage] = useState(1);
    const [totalLeadsCount, setTotalLeadsCount] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const [filters, setFilters] = useState({
        blocked: false,
    });

    // Filter out blocked/unblocked leads wrt to filter applied
    const leads = useMemo(
        () => leadsUnfiltered?.filter(item => isTruthy(item.blocked) === isTruthy(filters.blocked)),
        [filters.blocked, leadsUnfiltered],
    );

    let connectorLeadUrl;
    if (selectedConnectorSource) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connector-sources/${selectedConnectorSource}/leads/`;
    } else if (selectedConnector) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connectors/${selectedConnector}/leads/`;
    }
    const [connectorLeadsPending] = useRequest({
        url: connectorLeadUrl,
        query: {
            offset: (activePage - 1) * itemsPerPage,
            limit: itemsPerPage,
            alreadyAdded: false,
            search: filters.search,
            // NOTE: sending false / undefined is different in this case
            blocked: filters.blocked ?? false,
        },
        autoTrigger: true,
        onSuccess: (response) => {
            setTotalLeadsCount(response?.count);
            setLeads(response?.results);
        },
    });

    const activeConnectorLead = useMemo(
        () => {
            if (!selectedConnectorLead) {
                return undefined;
            }
            const connectorLead = leads?.find(
                item => item.id === selectedConnectorLead
            );
            if (!connectorLead) {
                return undefined;
            }

            return {
                sourceType: LEAD_TYPE.website,
                url: connectorLead.lead.url,
            };
        },
        [leads, selectedConnectorLead],
    );

    const {
        values: selectedLeads,
        isItemPresent,
        clickOnItem,
        addItems,
        removeItems,
        clearSelection,
    } = useArraySelection(
        leadKeySelector,
        [],
    );

    const isSelectionModeEnabled = useMemo(() => (
        selectedLeads.length > 0
    ), [selectedLeads]);

    const handleSelectAllCheckboxClick = useCallback((newValue) => {
        if (newValue) {
            addItems(leads);
        } else {
            removeItems(leads);
        }
    }, [leads, addItems, removeItems]);

    const handleLeadLoad = useCallback(
        (leadsToProcess) => {
            const authorOrgs = leadsToProcess
                .map(item => item.data?.authorsDetail)
                .filter(isDefined)
                .flat();
            const sourceOrgs = leadsToProcess
                .map(item => item.data?.sourceDetail)
                .filter(isDefined);
            const orgs = [...authorOrgs, ...sourceOrgs];

            const newLeads = leadsToProcess.map((item) => {
                const {
                    url,
                    data,
                } = item;

                const {
                    title,
                    website,
                    authors,
                    source,
                    sourceRaw,
                    authorRaw,

                    emmEntities,
                    emmTriggers,
                } = data || {};

                return {
                    faramValues: {
                        title,
                        authors,
                        source,

                        url,
                        website,

                        sourceType: LEAD_TYPE.connectors,
                        emmEntities,
                        emmTriggers,

                        authorSuggestion: authors && authors.length > 0 ? authorRaw : undefined,
                        sourceSuggestion: source ? sourceRaw : undefined,
                    },
                };
            });

            onOrganizationsAdd(orgs);
            onLeadsAdd(newLeads);
        },
        [onLeadsAdd, onOrganizationsAdd],
    );

    const handleBulkSaveLeadsClick = useCallback(() => {
        const leadsToProcess = selectedLeads.map(item => item.lead);
        handleLeadLoad(leadsToProcess);
        clearSelection();
    }, [selectedLeads, handleLeadLoad, clearSelection]);

    const handleConnectorLeadLoad = useCallback((lead) => {
        console.log(lead);
        handleLeadLoad([lead]);
    }, [handleLeadLoad]);

    const handleFilterClear = useCallback(() => {
        setFilters({});
        clearSelection();
    }, [clearSelection]);

    const handleFilterApply = useCallback((filterValues) => {
        setFilters(filterValues);
        clearSelection();
    }, [clearSelection]);

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
        const filteredLeads = leads.filter(l => isItemPresent(leadKeySelector(l)));
        return {
            areAllChecked: filteredLeads.length === leads.length,
            areSomeChecked: filteredLeads.length < leads.length && filteredLeads.length > 0,
        };
    }, [leads, isItemPresent]);

    const rendererParams = useCallback(
        (key, data) => ({
            itemKey: key,
            active: key === selectedConnectorLead,
            isItemSelected: isItemPresent(key),
            selectionMode: isSelectionModeEnabled,
            clickOnItem,
            leadData: data,
            type: LEAD_TYPE.connectors,
            onItemClick: setSelectedConnectorLead,
            itemState: connectorLeadStatusToLeadStatusMap[data.lead.status ?? 'processing'],

            onLoadClick: handleConnectorLeadLoad,
            modifyLead,

            projectId,
            selectedConnectorSource,
            selectedConnector,
        }),
        [
            projectId,
            selectedConnectorSource,
            selectedConnector,
            handleConnectorLeadLoad,
            modifyLead,
            isSelectionModeEnabled,
            selectedConnectorLead,
            setSelectedConnectorLead,
            clickOnItem,
            isItemPresent,
        ],
    );

    return (
        <div className={_cs(styles.connectorDetail, className)}>
            <div className={styles.bar}>
                <ConnectorLeadsFilter
                    className={styles.filter}
                    filters={filters}
                    onFilterClear={handleFilterClear}
                    onFilterApply={handleFilterApply}
                />
                {selectedLeads.length > 0 && (
                    <div className={styles.actions}>
                        {/*
                            <Button
                                className={styles.button}
                                iconName="delete"
                                onClick={handleBulkBlockLeadsClick}
                                // FIXME: use strings
                                title="block/unblock"
                            >
                                Block
                            </Button>
                        */}
                        <PrimaryButton
                            className={styles.button}
                            iconName="save"
                            onClick={handleBulkSaveLeadsClick}
                            // FIXME: use strings
                            title="load"
                        >
                            {/* FIXME: use strings */}
                            Load
                        </PrimaryButton>
                    </div>
                )}
            </div>
            <div className={styles.bottomContainer}>
                <div className={styles.listContainer}>
                    <header className={styles.header}>
                        <Checkbox
                            className={styles.checkbox}
                            name="selectAll"
                            label=""
                            value={areAllChecked}
                            indeterminate={areSomeChecked}
                            onChange={handleSelectAllCheckboxClick}
                        />
                        {`${selectedLeads.length} selected`}
                        {selectedLeads.length > 0 && (
                            <div className={styles.rightComponent}>
                                <DangerButton
                                    className={styles.button}
                                    iconName="trash"
                                    onClick={clearSelection}
                                    // FIXME: use strings
                                    title="Clear selection"
                                />
                            </div>
                        )}
                    </header>
                    <ListView
                        className={_cs(styles.list, className)}
                        data={leads}
                        keySelector={leadKeySelector}
                        renderer={ConnectorLeadItem}
                        rendererParams={rendererParams}
                        pending={connectorLeadsPending}
                    />
                    <footer className={styles.footer}>
                        <Pager
                            activePage={activePage}
                            itemsCount={totalLeadsCount}
                            maxItemsPerPage={itemsPerPage}
                            onPageClick={setActivePage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </footer>
                </div>
                {activeConnectorLead ? (
                    <LeadPreview
                        className={styles.leadDetail}
                        lead={activeConnectorLead}
                    />
                ) : (
                    <Message>
                        { _ts('addLeads', 'noLeadsText') }
                    </Message>
                )}
            </div>
        </div>
    );
}

ConnectorDetail.propTypes = propTypes;
ConnectorDetail.defaultProps = defaultProps;

export default ConnectorDetail;
