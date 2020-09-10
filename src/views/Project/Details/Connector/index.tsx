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

    const handleConnectorAdd = useCallback((connector: Connector) => {
        setConnectors(currentConnectors => ([
            connector,
            ...currentConnectors,
        ]));
    }, [setConnectors]);

    const handleConnectorEdit = useCallback((connector: Connector) => {
        setConnectors((currentConnectors) => {
            const selectedConnectorIndex = currentConnectors
                .findIndex(c => c.id === connector.id);

            if (selectedConnectorIndex === -1) {
                return currentConnectors;
            }
            const newConnectors = [...currentConnectors];
            newConnectors.splice(selectedConnectorIndex, 1, connector);

            return newConnectors;
        });
    }, [setConnectors]);

    const handleConnectorDelete = useCallback((connectorId: number) => {
        setConnectors((currentConnectors) => {
            const selectedConnectorIndex = currentConnectors
                .findIndex(c => c.id === connectorId);

            if (selectedConnectorIndex === -1) {
                return currentConnectors;
            }
            const newConnectors = [...currentConnectors];
            newConnectors.splice(selectedConnectorIndex, 1);

            return newConnectors;
        });
    }, [setConnectors]);

    const [pendingConnectors] = useRequest<MultiResponse<Connector>>({
        url: `server://projects/${projectId}/unified-connectors/`,
        delay: 300,
    }, {
        onSuccess: (response) => {
            setConnectors(response.results);
        },
    });

    const connectorRendererParams = useCallback((key, data) => ({
        projectId,
        details: data,
        onConnectorDelete: handleConnectorDelete,
        onConnectorEdit: handleConnectorEdit,
    }), [projectId, handleConnectorDelete]);

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
