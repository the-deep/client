import React from 'react';
import { isNotDefined } from '@togglecorp/fujs';
import {
    Modal,
    RawButton,
} from '@the-deep/deep-ui';

import {
    AnalysisReportContainerContentTypeEnum,
} from '#generated/types';

import styles from './styles.css';

interface Props {
    onCloseButtonClick: () => void;
    onSelect: (contentType: AnalysisReportContainerContentTypeEnum) => void;
    reportId: string | undefined;
}

function ContentAddModal(props: Props) {
    const {
        onCloseButtonClick,
        reportId,
        onSelect,
    } = props;

    return (
        <Modal
            className={styles.contentAddModal}
            heading="Add content"
            bodyClassName={styles.modalBody}
            onCloseButtonClick={onCloseButtonClick}
            freeHeight
        >
            <RawButton
                name="HEADING"
                onClick={onSelect}
                className={styles.button}
            >
                Heading
            </RawButton>
            <RawButton
                name="TEXT"
                onClick={onSelect}
                className={styles.button}
            >
                Text
            </RawButton>
            <RawButton
                name="IMAGE"
                onClick={onSelect}
                className={styles.button}
                title={isNotDefined(reportId) ? 'Image can be added only after the report is saved' : undefined}
                disabled={isNotDefined(reportId)}
            >
                Image
            </RawButton>
            <RawButton
                name="URL"
                onClick={onSelect}
                className={styles.button}
            >
                URL
            </RawButton>
        </Modal>
    );
}

export default ContentAddModal;
