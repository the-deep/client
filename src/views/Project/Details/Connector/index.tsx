import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';
import ListView from '#rscv/List/ListView';

import _ts from '#ts';
import { Connector } from '#typings';
import useRequest from '#restrequest';

import ConnectorEditForm from './ConnectorEditForm';
import ConnectorDetails from './ConnectorDetails';

import styles from './styles.scss';

const testConnectors: Connector[] = [
    {
        id: 1,
        title: 'Corona Virus - India (from January)',
        sources: [
            {
                source: 'relief-web',
                title: 'ACAPS',
                noOfLeads: 324,
                publishedDates: [
                    {
                        count: 10,
                        date: '2019-10-12',
                    },
                    {
                        count: 14,
                        date: '2019-11-12',
                    },
                    {
                        count: 24,
                        date: '2019-12-12',
                    },
                    {
                        count: 16,
                        date: '2020-01-12',
                    },
                ],
            },
            {
                source: 'acaps',
                title: 'ReliefWeb',
                noOfLeads: 112,
                publishedDates: [
                    {
                        count: 9,
                        date: '2019-10-12',
                    },
                    {
                        count: 14,
                        date: '2019-11-12',
                    },
                    {
                        count: 34,
                        date: '2019-12-12',
                    },
                    {
                        count: 16,
                        date: '2020-01-12',
                    },
                ],
            },
            {
                source: 'idmc-libarry',
                title: 'IDMC Library',
                noOfLeads: 102,
                broken: true,
                publishedDates: [
                    {
                        count: 9,
                        date: '2019-10-12',
                    },
                    {
                        count: 9,
                        date: '2019-11-12',
                    },
                    {
                        count: 4,
                        date: '2019-12-12',
                    },
                    {
                        count: 16,
                        date: '2020-01-12',
                    },
                ],
            },
        ],
        updatedOn: '2020-01-30',
        disabled: false,
    },
    {
        id: 2,
        title: 'Corona Virus - Nigeria',
        sources: [
            {
                source: 'acaps',
                title: 'ACAPS',
                noOfLeads: 324,
                publishedDates: [
                    {
                        count: 9,
                        date: '2019-10-12',
                    },
                    {
                        count: 9,
                        date: '2019-11-12',
                    },
                    {
                        count: 4,
                        date: '2019-12-12',
                    },
                    {
                        count: 16,
                        date: '2020-01-12',
                    },
                ],
            },
            {
                source: 'reach-library',
                title: 'Reach Library',
                noOfLeads: 102,
                publishedDates: [
                    {
                        count: 9,
                        date: '2019-10-12',
                    },
                    {
                        count: 9,
                        date: '2019-11-12',
                    },
                    {
                        count: 4,
                        date: '2019-12-12',
                    },
                    {
                        count: 16,
                        date: '2020-01-12',
                    },
                ],
            },
        ],
        updatedOn: '2020-02-30',
        disabled: true,
    },
];

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

    const organizationsRequestOptions = useMemo(() => ({
        url: `/projects/${projectId}/unified-connectors/`,
    }), [projectId]);

    const [pendingConnectors, connectors] = useRequest(
        organizationsRequestOptions,
        undefined,
        300, // delay before actual fetch
    );

    const connectorRendererParams = useCallback((key, data) => ({
        projectId,
        details: data,
    }), [projectId]);

    return (
        <div className={_cs(className, styles.projectConnectors)}>
            <header className={styles.header}>
                <h3 className={styles.heading}>
                    {_ts('project.connector', 'connectorHeaderTitle')}
                </h3>
                <ModalButton
                    iconName="add"
                    modal={(
                        <ConnectorEditForm
                            projectId={projectId}
                            isAddForm
                        />
                    )}
                >
                    {_ts('project.connector', 'addButtonTitle')}
                </ModalButton>
            </header>
            <ListView
                data={testConnectors}
                keySelector={connectorKeySelector}
                renderer={ConnectorDetails}
                rendererParams={connectorRendererParams}
            />
        </div>
    );
}

export default ProjectConnector;
