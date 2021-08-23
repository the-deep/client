import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Modal,
} from '@the-deep/deep-ui';

import EntriesExportSelection from './EntriesExportSelection';
import styles from './styles.css';

interface Props {
    className?: string;
    projectId: number;
    onClose: () => void;
}

function NewExport(props: Props) {
    const {
        className,
        projectId,
        onClose,
    } = props;

    return (
        <Modal
            className={_cs(className, styles.newExportModal)}
            heading="Setup new export file"
            onCloseButtonClick={onClose}
            bodyClassName={styles.body}
        >
            <EntriesExportSelection
                className={styles.exportSelection}
                projectId={projectId}
            />
        </Modal>
    );
}

export default NewExport;
