import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import Button from '#rsca/Button';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import FormattedDate from '#rscv/FormattedDate';
import Checkbox from '#rsci/Checkbox';
import ListView from '#rscv/List/ListView';

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
}

const sourceKeySelector = (source: UnifiedConnectorSource) => source.source;

function ProjectConnectorDetail(props: OwnProps) {
    const {
        projectId,
        className,
        details,
    } = props;

    const {
        title,
        updatedOn,
        disabled,
        sources,
    } = details;

    const handleConnectorActiveStatusChange = useCallback((value) => {
        console.warn('changed value', value);
    }, []);

    const handleConnectorDelete = useCallback(() => {
        console.warn('connector delete clicked');
    }, []);

    const connectorSourceRendererParams = useCallback((key, data) => ({
        title: data.title,
        noOfLeads: data.noOfLeads,
        broken: data.broken,
        publishedDates: data.publishedDates,
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
                        className={styles.date}
                        value={updatedOn}
                        mode="dd-MM-yyyy"
                    />
                    <Checkbox
                        className={styles.checkbox}
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
                            />
                        )}
                        title={_ts('project.connector', 'editButtonTitle')}
                    />
                    <DangerConfirmButton
                        className={styles.button}
                        transparent
                        iconName="delete"
                        onClick={handleConnectorDelete}
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
