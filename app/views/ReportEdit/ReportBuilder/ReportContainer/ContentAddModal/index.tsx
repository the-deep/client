import React from 'react';
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
}

function ContentAddModal(props: Props) {
    const {
        onCloseButtonClick,
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
