import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import Button from '#rsca/Button';
import ExternalGallery from '#components/viewer/ExternalGallery';
import InternalGalleryWithTabular from '#components/viewer/InternalGalleryWithTabular';
import Message from '#rscv/Message';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    value: {},
    closeModal: () => {},
};

function LeadPreview(props) {
    const {
        value: {
            title,
            url,
            attachment,
            projectId,
            tabularBook,
        },
        closeModal,
    } = props;

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
                {url && (
                    <ExternalGallery
                        className={styles.galleryFile}
                        url={url}
                        showUrl
                    />
                )}
                {!url && attachment && (
                    <InternalGalleryWithTabular
                        className={styles.galleryFile}
                        galleryId={attachment.id}
                        showUrl

                        projectId={projectId}
                        tabularBook={tabularBook}
                    />
                )}
                {!url && !attachment && (
                    <Message>
                        {_ts('addLeads', 'previewNotAvailable')}
                    </Message>
                )}
            </ModalBody>
        </Modal>
    );
}

LeadPreview.propTypes = propTypes;
LeadPreview.defaultProps = defaultProps;

export default LeadPreview;
