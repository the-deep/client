import React, { useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';

import ProjectConnectorsPane from './ProjectConnectorsPane';
import LeadsPane from './LeadsPane';
import styles from './styles.css';

interface Props {
    className?: string;
    onClose: () => void;
    projectId: string;
}

function UnifiedConnectorModal(props: Props) {
    const {
        className,
        onClose,
        projectId,
    } = props;

    const pending = false;
    const [selectedConnector, setSelectedConnector] = useState<string | undefined>();

    return (
        <Modal
            className={_cs(className, styles.unifiedConnectorModal)}
            heading="Add sources from connectors"
            size="cover"
            onCloseButtonClick={onClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name={undefined}
                    disabled
                >
                    Save
                </Button>
            )}
        >
            {pending && <PendingMessage />}
            <ProjectConnectorsPane
                className={styles.projectConnectorPane}
                projectId={projectId}
                selectedConnector={selectedConnector}
                setSelectedConnector={setSelectedConnector}
            />
            <LeadsPane
                className={styles.leadsPane}
                projectId={projectId}
                connectorId={selectedConnector}
            />
        </Modal>
    );
}

export default UnifiedConnectorModal;
