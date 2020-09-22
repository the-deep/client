import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    compareDate,
} from '@togglecorp/fujs';
import { Switch } from '@togglecorp/toggle-ui';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';
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
    onConnectorPatch: (connector: Connector) => void;
}

interface ActivePatchBody {
    isActive: boolean;
}

const sourceKeySelector = (source: UnifiedConnectorSource) => source.source;

function ProjectConnectorDetail(props: OwnProps) {
    const {
        onConnectorDelete,
        onConnectorEdit,
        onConnectorPatch,
        projectId,
        className,
        details,
    } = props;

    const {
        id: connectorId,
        title,
        isActive,
        sources,
    } = details;

    const [
        patchBodyToSend,
        setPatchBodyToSend,
    ] = useState<ActivePatchBody | undefined>(undefined);

    const [pendingConnectorDelete,,, deleteConnectorTrigger] = useRequest({
        url: `server://projects/${projectId}/unified-connectors/${connectorId}/`,
        method: 'DELETE',
        onSuccess: () => {
            if (connectorId) {
                onConnectorDelete(connectorId);
            }
        },
    });

    const [pendingConnectorPatch,,, triggerConnectorPatch] = useRequest<Connector>({
        url: `server://projects/${projectId}/unified-connectors/${connectorId}/`,
        method: 'PATCH',
        body: patchBodyToSend,
        onSuccess: (response) => {
            if (onConnectorPatch) {
                onConnectorPatch(response);
            }
        },
    });

    const handleConnectorActiveStatusChange = useCallback((value) => {
        setPatchBodyToSend({ isActive: value });
        triggerConnectorPatch();
    }, [triggerConnectorPatch, setPatchBodyToSend]);

    const connectorSourceRendererParams = useCallback((key, data) => ({
        title: data.sourceDetail?.title,
        status: data.status,
        // NOTE: We get stats from server
        statistics: data.stats,
        totalLeads: data.totalLeads,
        lastCalculatedAt: data.lastCalculatedAt,
        logo: data.sourceDetail?.logo,
    }), []);

    const latestLastCalculated = useMemo(() => (
        sources?.sort(
            (a, b) => compareDate(a.lastCalculatedAt, b.lastCalculatedAt, -1)
        )?.[0]?.lastCalculatedAt
    ), [sources]);

    const pending = pendingConnectorDelete || pendingConnectorPatch;

    return (
        <div className={_cs(className, styles.projectConnectorDetail)}>
            {pending && <LoadingAnimation />}
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {title}
                </h3>
                <div className={styles.rightComponent}>
                    <span className={styles.label}>
                        {_ts('project.connector', 'updatedOnLabel')}
                    </span>
                    <FormattedDate
                        value={latestLastCalculated}
                        mode="dd-MM-yyyy"
                    />
                    <Switch
                        name="disableSwitch"
                        value={isActive}
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
