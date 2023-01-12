import React from 'react';
import {
    Modal,
    PendingMessage,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    leadId: string;
    onClose: () => void;
}

function LeadDuplicatesModal(props: Props) {
    const {
        leadId,
        onClose,
    } = props;

    const loading = true;

    return (
        <Modal
            className={styles.leadDuplicatesModal}
            onCloseButtonClick={onClose}
            heading="Duplicate Leads"
            size="small"
        >
            {loading && <PendingMessage />}
        </Modal>
    );
}

export default LeadDuplicatesModal;
