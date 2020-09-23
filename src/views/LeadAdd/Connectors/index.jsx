import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import List from '#rscv/List';
import Icon from '#rscg/Icon';

import LeadListItem from '../LeadListItem';
import { LEAD_TYPE, LEAD_STATUS } from '../utils';

import styles from './styles.scss';

const entityKeySelector = item => item.id;

const connectorStatusToLeadStatusMap = {
    not_processed: LEAD_STATUS.warning,
    success: LEAD_STATUS.complete,
    failure: LEAD_STATUS.invalid,
    processing: LEAD_STATUS.requesting,
};

function ConnectorItem(props) {
    const {
        data,
        selectedConnector,
        selectedConnectorSource,

        triggering,
        triggerDisabled,

        onConnectorSelect,
        onConnectorTrigger,
        onConnectorSourceSelect,
    } = props;

    const {
        id,
        sources,
        title,
        totalLeads,
    } = data;

    const handleConnectorSourceSelect = useCallback(
        (sourceId) => {
            onConnectorSourceSelect(id, sourceId);
        },
        [id, onConnectorSourceSelect],
    );
    const handleConnectorTrigger = useCallback(
        () => {
            onConnectorTrigger(id);
        },
        [id, onConnectorTrigger],
    );

    const sourceRendererParams = useCallback(
        (key, source) => ({
            key,
            itemKey: key,
            title: source.sourceDetail.title,
            type: LEAD_TYPE.connectors,
            active: id === selectedConnector && key === selectedConnectorSource,
            onItemSelect: handleConnectorSourceSelect,
            count: source.totalLeads,
            indent: 1,
            separator: false,
            itemState: connectorStatusToLeadStatusMap[source.status],
        }),
        [id, handleConnectorSourceSelect, selectedConnector, selectedConnectorSource],
    );

    return (
        <div>
            <LeadListItem
                itemKey={id}
                title={title}
                count={totalLeads}
                active={id === selectedConnector && !selectedConnectorSource}
                separator={false}
                onItemSelect={onConnectorSelect}
                actionButtons={(
                    <PrimaryButton
                        onClick={handleConnectorTrigger}
                        pending={triggering}
                        disabled={triggerDisabled}
                    >
                        <Icon name="refresh" />
                    </PrimaryButton>
                )}
            />
            <List
                data={sources}
                renderer={LeadListItem}
                rendererParams={sourceRendererParams}
                keySelector={entityKeySelector}
            />
        </div>
    );
}
ConnectorItem.propTypes = {
    data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    selectedConnector: PropTypes.number,
    selectedConnectorSource: PropTypes.number,
    triggering: PropTypes.bool,
    triggerDisabled: PropTypes.bool,
    onConnectorTrigger: PropTypes.func.isRequired,
    onConnectorSelect: PropTypes.func.isRequired,
    onConnectorSourceSelect: PropTypes.func.isRequired,
};
ConnectorItem.defaultProps = {
    selectedConnector: undefined,
    selectedConnectorSource: undefined,
    triggering: false,
    triggerDisabled: false,
};

function Connectors(props) {
    const {
        connectors,
        selectedConnector,
        selectedConnectorSource,

        connectorToTrigger,
        connectorTriggering,

        onConnectorSelect,
        onConnectorTrigger,
        onConnectorSourceSelect,
    } = props;

    const connectorRendererParams = useCallback(
        (key, connector) => ({
            key,
            data: connector,
            selectedConnector,
            selectedConnectorSource,
            triggering: key === connectorToTrigger && connectorTriggering,
            triggerDisabled: connectorTriggering,
            onConnectorSelect,
            onConnectorTrigger,
            onConnectorSourceSelect,
        }),
        [
            selectedConnector, selectedConnectorSource,
            connectorToTrigger, connectorTriggering,
            onConnectorSelect, onConnectorTrigger, onConnectorSourceSelect,
        ],
    );

    return (
        <div className={styles.connectors}>
            <h4 className={styles.connectorHeading}>
                {/* FIXME: use strings */}
                Browse
            </h4>
            <List
                data={connectors}
                renderer={ConnectorItem}
                rendererParams={connectorRendererParams}
                keySelector={entityKeySelector}
            />
        </div>
    );
}
Connectors.propTypes = {
    connectors: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedConnector: PropTypes.number,
    selectedConnectorSource: PropTypes.number,
    onConnectorTrigger: PropTypes.func.isRequired,
    onConnectorSelect: PropTypes.func.isRequired,
    onConnectorSourceSelect: PropTypes.func.isRequired,
    connectorToTrigger: PropTypes.number,
    connectorTriggering: PropTypes.bool,
};
Connectors.defaultProps = {
    connectors: [],
    selectedConnector: undefined,
    selectedConnectorSource: undefined,
    connectorToTrigger: undefined,
    connectorTriggering: false,
};

export default Connectors;
