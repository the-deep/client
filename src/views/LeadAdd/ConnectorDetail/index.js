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
import { useArraySelection } from '#hooks/stateManagement';
import _ts from '#ts';

import ListStatusItem from '../ListStatusItem';
import {
    leadKeySelector,
    LEAD_TYPE,
} from '../utils';

import styles from './styles.scss';

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
    const [activePage, setActivePage] = useState(1);
    const [totalLeadsCount, setTotalLeadsCount] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    let connectorLeadUrl;
    if (selectedConnectorSource) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connector-sources/${selectedConnectorSource}/leads/`;
    } else if (selectedConnector) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connectors/${selectedConnector}/leads/`;
    }
    const [connectorLeadsPending, connectorLeadsResponse] = useRequest({
        url: connectorLeadUrl,
        query: {
            offset: (activePage - 1) * itemsPerPage,
            limit: itemsPerPage,
        },
        autoTrigger: true,
        onSuccess: (response) => {
            setTotalLeadsCount(response?.count);
        },
    });
    const leads = connectorLeadsResponse?.results;

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

    const rendererParams = useCallback(
        (key, data) => {
            const actionButtons = (
                <>
                    <Button
                        className={styles.button}
                        disabled
                        iconName="delete"
                        // FIXME: use strings
                        title="block/unblock"
                    />
                    <PrimaryButton
                        className={styles.button}
                        disabled
                        iconName="save"
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
                actionButtons,
            };
        },
        [
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
                            <Button
                                className={styles.button}
                                iconName="delete"
                                onClick={handleBulkBlockLeadsClick}
                                // FIXME: use strings
                                title="block/unblock"
                            />
                            <PrimaryButton
                                className={styles.button}
                                iconName="save"
                                onClick={handleBulkSaveLeadsClick}
                                // FIXME: use strings
                                title="load"
                            />
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
    );
}

ConnectorDetail.propTypes = propTypes;
ConnectorDetail.defaultProps = defaultProps;

export default ConnectorDetail;
