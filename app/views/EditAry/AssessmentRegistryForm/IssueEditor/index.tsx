import React from 'react';
import { Modal } from '@the-deep/deep-ui';

interface Props {
    handleCloseModal: () => void;
}
function IssueEditor(props: Props) {
    const {
        handleCloseModal,
    } = props;

    return (
        <Modal
            heading="Issue editor"
            size="medium"
            onCloseButtonClick={handleCloseModal}
        >
            modal
        </Modal>
    );
}

export default IssueEditor;
