import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import _ts from '#ts';
import {
    MultiResponse,
    Connector,
} from '#typings';
import useRequest from '#restrequest';
import { useArrayEdit } from '#hooks/stateManagement';

import ConnectorEditForm from './ConnectorEditForm';
import ConnectorDetails from './ConnectorDetails';

import styles from './styles.scss';

const ModalButton = modalize(Button);

interface OwnProps {
    className?: string;
    projectId: number;
}

const connectorKeySelector = (connector: Connector) => connector.id;

function ProjectConnector(props: OwnProps) {
    const {
        projectId,
        className,
    } = props;

    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [
        handleConnectorAdd,
        handleConnectorDelete,
        handleConnectorEdit,
        handleConnectorPatch,
    ] = useArrayEdit(setConnectors, connectorKeySelector);

    const [pendingConnectors] = useRequest<MultiResponse<Connector>>({
        autoTrigger: true,
        url: `server://projects/${projectId}/unified-connectors/with-trending-stats/`,
        onSuccess: (response) => {
            setConnectors(response.results);
        },
    });

    const connectorRendererParams = useCallback((key, data) => ({
        projectId,
        details: data,
        onConnectorDelete: handleConnectorDelete,
        onConnectorEdit: handleConnectorEdit,
        onConnectorPatch: handleConnectorPatch,
    }), [
        projectId,
        handleConnectorDelete,
        handleConnectorEdit,
        handleConnectorPatch,
    ]);

    return (
        <div className={_cs(className, styles.projectConnectors)}>
            {pendingConnectors && <LoadingAnimation />}
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {_ts('project.connector', 'connectorHeaderTitle')}
                </h3>
                <ModalButton
                    iconName="add"
                    modal={(
                        <ConnectorEditForm
                            projectId={projectId}
                            onSuccess={handleConnectorAdd}
                            isAddForm
                        />
                    )}
                >
                    {_ts('project.connector', 'addButtonTitle')}
                </ModalButton>
            </header>
            <ListView
                data={connectors}
                keySelector={connectorKeySelector}
                renderer={ConnectorDetails}
                rendererParams={connectorRendererParams}
            />
        </div>
    );
}

export default ProjectConnector;
