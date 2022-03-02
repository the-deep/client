import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    className?: string;
    connectorId: string;
    projectId: string;
}

function ConnectorDetail(props: Props) {
    const {
        className,
        connectorId,
        projectId,
    } = props;

    return (
        <ContainerCard
            className={_cs(styles.connectorDetail, className)}
            heading={connectorId}
        >
            Connector Detail
            {connectorId}
            {projectId}
        </ContainerCard>
    );
}

export default ConnectorDetail;
