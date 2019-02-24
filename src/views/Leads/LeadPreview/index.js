import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import Button from '#rsca/Button';
import ExternalGallery from '#components/viewer/ExternalGallery';
import { iconNames } from '#constants';
import Attachment from '#components/viewer/Attachment';
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


export default class LeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderLeadPreview = () => {
        const {
            value: {
                url,
                attachment,
                projectId,
                tabularBook,
            },
        } = this.props;

        if (url) {
            return (
                <ExternalGallery
                    className={styles.galleryFile}
                    url={url}
                    showUrl
                />
            );
        }
        if (attachment) {
            return (
                <Attachment
                    attachment={attachment}
                    tabularBook={tabularBook}
                    className={styles.galleryFile}
                    projectId={projectId}
                />
            );
        }
        return (
            <Message>
                {_ts('addLeads', 'previewNotAvailable')}
            </Message>
        );
    }

    render() {
        const {
            value,
            closeModal,
        } = this.props;

        const Preview = this.renderLeadPreview;

        return (
            <Modal
                className={styles.leadPreview}
                onClose={closeModal}
                closeOnEscape
            >
                <ModalHeader
                    className={styles.modalHeader}
                    title={value.title || _ts('leads', 'Preview')}
                    rightComponent={
                        <Button
                            onClick={closeModal}
                            transparent
                        >
                            <span className={iconNames.close} />
                        </Button>
                    }
                />
                <ModalBody
                    className={styles.body}
                >
                    <Preview />
                </ModalBody>
            </Modal>
        );
    }
}
