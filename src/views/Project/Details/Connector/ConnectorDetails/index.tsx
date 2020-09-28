import React, { useState, useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
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
    onConnectorEdit: (
        key: number,
        connector: Connector | ((oldVal: Connector) => Connector),
    ) => void;
}

interface ActivePatchBody {
    isActive: boolean;
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
            if (onConnectorEdit) {
                onConnectorEdit(
                    connectorId,
                    oldValues => ({
                        ...oldValues,
                        ...response,
                    }),
                );
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
        className: styles.connectorSourceDetails,
    }), []);

    const latestLastCalculated = useMemo(() => {
        const lastCalculatedDates = sources.map((s) => {
            if (!s.lastCalculatedAt) {
                return undefined;
            }
            const date = new Date(s.lastCalculatedAt);
            return date.getTime();
        }).filter(isDefined);

        return lastCalculatedDates.length > 0
            ? Math.max(...(lastCalculatedDates.filter(isDefined)))
            : undefined;
    }, [sources]);

    const handleConnectorEdit = useCallback((connector: Connector) => {
        onConnectorEdit(connectorId, connector);
    }, [onConnectorEdit, connectorId]);

    const pending = pendingConnectorDelete || pendingConnectorPatch;

    return (
        <div className={_cs(className, styles.projectConnectorDetail)}>
            {pending && <LoadingAnimation />}
            <header className={styles.header}>
                <h4 className={styles.heading}>
                    {title}
                </h4>
                <div className={styles.status}>
                    <div className={styles.updatedOn}>
                        <div className={styles.label}>
                            {_ts('project.connector', 'updatedOnLabel')}
                        </div>
                        <FormattedDate
                            className={styles.date}
                            value={latestLastCalculated}
                            mode="dd-MM-yyyy"
                        />
                    </div>
                </div>
                <div className={styles.actions}>
                    <Switch
                        name="disableSwitch"
                        value={isActive}
                        onChange={handleConnectorActiveStatusChange}
                        label={_ts('project.connector', 'disableLabel')}
                    />
                    <ModalButton
                        iconName="edit"
                        className={styles.button}
                        transparent
                        modal={(
                            <ConnectorEditForm
                                projectId={projectId}
                                connector={details}
                                onSuccess={handleConnectorEdit}
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
                className={styles.content}
                data={sources}
                keySelector={sourceKeySelector}
                renderer={ConnectorSourceDetail}
                rendererParams={connectorSourceRendererParams}
            />
        </div>
    );
}

export default ProjectConnectorDetail;
