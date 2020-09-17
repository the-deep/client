import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Switch } from '@togglecorp/toggle-ui';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import FormattedDate from '#rscv/FormattedDate';
import ListView from '#rscv/List/ListView';
import useRequest from '#restrequest';

import {
    Connector,
    UnifiedConnectorSource,
} from '#typings';

import _ts from '#ts';

import ConnectorEditForm from '../ConnectorEditForm';
import ConnectorSourceDetail from './ConnectorSourceDetail';
import styles from './styles.scss';

const ModalButton = modalize(Button);

interface OwnProps {
    className?: string;
    projectId: number;
    details: Connector;
    onConnectorDelete: (id: number) => void;
    onConnectorEdit: (connector: Connector) => void;
}

const sourceKeySelector = (source: UnifiedConnectorSource) => source.source;

function ProjectConnectorDetail(props: OwnProps) {
    const {
        onConnectorDelete,
        onConnectorEdit,
        projectId,
        className,
        details,
    } = props;

    const {
        id: connectorId,
        title,
        updatedOn,
        disabled,
        sources,
    } = details;

    const [pendingConnectorDelete,,, deleteConnectorTrigger] = useRequest({
        url: `server://projects/${projectId}/unified-connectors/${connectorId}/`,
        method: 'DELETE',
        onSuccess: () => {
            if (connectorId) {
                onConnectorDelete(connectorId);
            }
        },
    });

    const handleConnectorActiveStatusChange = useCallback((value) => {
        console.warn('changed value', value);
    }, []);

    const connectorSourceRendererParams = useCallback((key, data) => ({
        title: data.sourceDetail?.title,
        status: data.status,
        // NOTE: We get stats from server
        statistics: data.stats,
        totalLeads: data.totalLeads,
        logo: data.sourceDetail?.logo,
    }), []);

    return (
        <div className={_cs(className, styles.projectConnectorDetail)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {title}
                </h3>
                <div className={styles.rightComponent}>
                    <span className={styles.label}>
                        {_ts('project.connector', 'updatedOnLabel')}
                    </span>
                    <FormattedDate
                        value={updatedOn}
                        mode="dd-MM-yyyy"
                    />
                    <Switch
                        name="disableSwitch"
                        value={disabled}
                        onChange={handleConnectorActiveStatusChange}
                    />
                    <ModalButton
                        iconName="edit"
                        className={styles.button}
                        transparent
                        modal={(
                            <ConnectorEditForm
                                projectId={projectId}
                                connector={details}
                                onSuccess={onConnectorEdit}
                            />
                        )}
                        title={_ts('project.connector', 'editButtonTitle')}
                    />
                    <DangerConfirmButton
                        className={styles.button}
                        transparent
                        iconName="delete"
                        onClick={deleteConnectorTrigger}
                        confirmationMessage={_ts(
                            'project.connector',
                            'connectorDeleteMessage',
                            { title },
                        )}
                    />
                </div>
            </header>
            <ListView
                className={styles.connectorSources}
                data={sources}
                keySelector={sourceKeySelector}
                renderer={ConnectorSourceDetail}
                rendererParams={connectorSourceRendererParams}
            />
        </div>
    );
}

export default ProjectConnectorDetail;
