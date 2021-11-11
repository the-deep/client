import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Modal,
} from '@the-deep/deep-ui';

import AssessmentsExportSelection from './AssessmentsExportSelection';
import styles from './styles.css';

interface Props {
    className?: string;
    projectId: string;
    onClose: () => void;
}

function NewAssessmentExport(props: Props) {
    const {
        className,
        projectId,
        onClose,
    } = props;

    return (
        <Modal
            className={_cs(className, styles.newAssessmentExportModal)}
            heading="Setup new assessment export file"
            onCloseButtonClick={onClose}
            bodyClassName={styles.body}
        >
            <AssessmentsExportSelection
                className={styles.assessmentExportSelection}
                projectId={projectId}
            />
        </Modal>
    );
}
export default NewAssessmentExport;
