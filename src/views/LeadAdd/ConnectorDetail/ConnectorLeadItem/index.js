import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import useRequest from '#restrequest';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import ListStatusItem from '../../ListStatusItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    type: PropTypes.string,
    isItemSelected: PropTypes.func.isRequired,
    onItemClick: PropTypes.func.isRequired,
    modifyLead: PropTypes.func.isRequired,
    projectId: PropTypes.number.isRequired,
    selectedConnectorSource: PropTypes.number,
    selectedConnector: PropTypes.number,
    itemKey: PropTypes.number.isRequired,
    itemState: PropTypes.string.isRequired,
    onLoadClick: PropTypes.func.isRequired,
    clickOnItem: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
    selectionMode: PropTypes.bool.isRequired,
    leadData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
    type: undefined,
    selectedConnector: undefined,
    selectedConnectorSource: undefined,
};

function ConnectorLeadItem(props) {
    const {
        className,
        active,
        itemKey,
        isItemSelected,
        selectionMode,
        type,
        onItemClick,
        itemState,
        projectId,
        selectedConnectorSource,
        selectedConnector,
        leadData,
        clickOnItem,
        onLoadClick,
        modifyLead,
    } = props;

    const [leadToChangeStatus, setLeadToChangeStatus] = useState(undefined);
    let connectorLeadUrl;
    if (selectedConnectorSource) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connector-sources/${selectedConnectorSource}/leads/`;
    } else if (selectedConnector) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connectors/${selectedConnector}/leads/`;
    }

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

    const {
        blocked,
        lead,
    } = leadData;

    const onItemSelect = useCallback(() => {
        clickOnItem(leadData);
    }, [clickOnItem, leadData]);

    const handleBlockStatusChangeClick = useCallback(() => {
        setLeadToChangeStatus({
            leadKey: itemKey,
            newStatus: !blocked,
        });
        connectorLeadStatusChangeTrigger();
    }, [itemKey, blocked, setLeadToChangeStatus, connectorLeadStatusChangeTrigger]);

    const onConnectorLeadLoad = useCallback(() => {
        onLoadClick(lead);
    }, [lead, onLoadClick]);

    return (
        <ListStatusItem
            classname={className}
            itemKey={itemKey}
            active={active}
            isItemSelected={isItemSelected}
            selectionMode={selectionMode}
            onItemSelect={onItemSelect}
            onItemClick={onItemClick}
            type={type}
            itemState={itemState}
            // FIXME: check if this is always available
            // FIXME: use lead.data.url or lead.url
            title={leadData.lead.data.title ?? leadData.lead.url}
            actionButtons={(
                <>
                    <Button
                        className={styles.button}
                        iconName={blocked ? 'undo' : 'delete'}
                        pending={connectorLeadStatusChangePending}
                        onClick={handleBlockStatusChangeClick}
                        // FIXME: use strings
                        title={blocked ? 'unblock' : 'block'}
                    />
                    {!blocked && (
                        <PrimaryButton
                            className={styles.button}
                            iconName="save"
                            onClick={onConnectorLeadLoad}
                            // FIXME: use strings
                            title="load"
                        />
                    )}
                </>
            )}
        />
    );
}


ConnectorLeadItem.propTypes = propTypes;
ConnectorLeadItem.defaultProps = defaultProps;

export default ConnectorLeadItem;
