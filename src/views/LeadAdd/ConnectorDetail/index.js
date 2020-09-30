import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
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

import ListStatusItem from '../ListStatusItem';
import ConnectorLeadsFilter from './ConnectorLeadsFilter';
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
    } = props;

    // TODO: validate this selected connector lead
    const [selectedConnectorLead, setSelectedConnectorLead] = useState(undefined);
    const [leads, setLeads] = useState(undefined);
    const [,, modifyLead] = useArrayEdit(setLeads, leadKeySelector);
    const [activePage, setActivePage] = useState(1);
    const [totalLeadsCount, setTotalLeadsCount] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [leadToChangeStatus, setLeadToChangeStatus] = useState(undefined);

    const [filters, setFilters] = useState({});

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
            ...filters,
        },
        autoTrigger: true,
        onSuccess: (response) => {
            setTotalLeadsCount(response?.count);
            setLeads(response?.results);
        },
    });

    const [connectorLeadStatusChangePending,,, connectorLeadStatusChangeTrigger] = useRequest({
        url: `${connectorLeadUrl}${leadToChangeStatus?.leadKey}/`,
        method: 'PATCH',
        body: {
            blocked: leadToChangeStatus?.newStatus,
        },
        onSuccess: (response) => {
            modifyLead(leadToChangeStatus?.leadKey, response);
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
                // FIXME: use lead.data.url or lead.url
                url: connectorLead.lead.url,
                // attachment: connectorLead.lead.data.attachment,
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

    const handleConnectorLeadBlockStatusChange = useCallback((leadKey, newStatus) => {
        setLeadToChangeStatus({
            leadKey,
            newStatus,
        });
        connectorLeadStatusChangeTrigger();
    }, [setLeadToChangeStatus, connectorLeadStatusChangeTrigger]);

    const handleConnectorLeadLoad = useCallback(() => {
        console.warn('here load');
    }, []);

    const rendererParams = useCallback(
        (key, data) => {
            const {
                blocked,
                lead,
            } = data;

            console.warn('i am here', data);
            const onBlockStatusChangeClick = () => {
                handleConnectorLeadBlockStatusChange(key, !blocked);
            };
            const onConnectorLeadLoad = () => {
                handleConnectorLeadLoad(lead);
            };

            const actionButtons = (
                <>
                    <Button
                        className={styles.button}
                        iconName="delete"
                        onClick={onBlockStatusChangeClick}
                        // FIXME: use strings
                        title="block/unblock"
                    />
                    <PrimaryButton
                        className={styles.button}
                        iconName="save"
                        onClick={onConnectorLeadLoad}
                        // FIXME: use strings
                        title="load"
                    />
                </>
            );
            const onItemSelect = () => { clickOnItem(data); };

            return {
                itemKey: key,
                active: key === selectedConnectorLead,
                isItemSelected: isItemPresent(key),
                selectionMode: isSelectionModeEnabled,
                onItemSelect,
                // FIXME: check if this is always available
                // FIXME: use lead.data.url or lead.url
                title: data.lead.data.title ?? data.lead.url,
                type: LEAD_TYPE.connectors,
                onItemClick: setSelectedConnectorLead,
                // FIXME: identify bad states
                // itemState: leadStates[key],
                itemState: connectorLeadStatusToLeadStatusMap[data.lead.status ?? 'processing'],
                actionButtons,
            };
        },
        [
            handleConnectorLeadLoad,
            handleConnectorLeadBlockStatusChange,
            isSelectionModeEnabled,
            selectedConnectorLead,
            setSelectedConnectorLead,
            clickOnItem,
            isItemPresent,
        ],
    );

    const handleSelectAllCheckboxClick = useCallback((newValue) => {
        if (newValue) {
            addItems(leads);
        } else {
            removeItems(leads);
        }
    }, [leads, addItems, removeItems]);

    const handleBulkBlockLeadsClick = useCallback(() => {
        console.warn('bulk block clicked');
    }, []);

    const handleBulkSaveLeadsClick = useCallback(() => {
        console.warn('bulk save clicked');
    }, []);

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
            return false;
        }
        const filteredLeads = leads.filter(l => isItemPresent(leadKeySelector(l)));
        return {
            areAllChecked: filteredLeads.length === leads.length,
            areSomeChecked: filteredLeads.length < leads.length && filteredLeads.length > 0,
        };
    }, [leads, isItemPresent]);

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
                        <Button
                            className={styles.button}
                            iconName="delete"
                            onClick={handleBulkBlockLeadsClick}
                            // FIXME: use strings
                            title="block/unblock"
                        >
                            {/* FIXME: use strings */}
                            Block
                        </Button>
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
                        renderer={ListStatusItem}
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
