import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import Button from '#rsca/Button';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import _ts from '#ts';

import LeadPreview from '#components/leftpanel/LeadPreview';

import styles from './styles.scss';

const propTypes = {
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    closeModal: () => {},
};

function LeadPreviewModal(props) {
    const {
        lead,
        closeModal,
    } = props;

    const { title } = lead;

    return (
        <Modal
            className={styles.leadPreview}
            onClose={closeModal}
            closeOnEscape
        >
            <ModalHeader
                className={styles.modalHeader}
                title={title || _ts('leads', 'Preview')}
                rightComponent={
                    <Button
                        onClick={closeModal}
                        transparent
                        iconName="close"
                    />
                }
            />
            <ModalBody
                className={styles.body}
            >
                <LeadPreview
                    lead={lead}
                />
            </ModalBody>
        </Modal>
    );
}

LeadPreviewModal.propTypes = propTypes;
LeadPreviewModal.defaultProps = defaultProps;

export default LeadPreviewModal;
