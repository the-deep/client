import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import PropTypes from 'prop-types';

import ListView from '#rscv/List/ListView';
import LeadPreview from '#components/leftpanel/LeadPreview';
import Message from '#rscv/Message';

import useRequest from '#restrequest';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
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

    let connectorLeadUrl;
    if (selectedConnectorSource) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connector-sources/${selectedConnectorSource}/leads/`;
    } else if (selectedConnector) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connectors/${selectedConnector}/leads/`;
    }
    const [connectorLeadsPending, connectorLeadsResponse] = useRequest({
        url: connectorLeadUrl,
        query: {
            offset: 1,
            limit: 20,
        },
        autoTrigger: true,
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

    const [selectedLeads,, isItemPresent, clickOnItem] = useArraySelection(
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

    return (
        <div className={_cs(styles.connectorDetail, className)}>
            <div className={styles.listContainer}>
                <ListView
                    className={_cs(styles.list, className)}
                    data={leads}
                    keySelector={leadKeySelector}
                    renderer={ListStatusItem}
                    rendererParams={rendererParams}
                    pending={connectorLeadsPending}
                />
                <div className={styles.movementButtons}>
                    <div className={styles.stats}>
                        {/* FIXME: use strings */}
                        {`${leads?.length} leads`}
                    </div>
                    <div className={styles.actions}>
                        <Button
                            disabled
                            iconName="prev"
                            title={_ts('addLeads.actions', 'previousButtonLabel')}
                        />
                        <Button
                            disabled
                            iconName="next"
                            title={_ts('addLeads.actions', 'nextButtonLabel')}
                        />
                    </div>
                </div>
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
