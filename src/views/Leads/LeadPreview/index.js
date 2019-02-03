import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import Button from '#rsca/Button';
import ExternalGallery from '#components/viewer/ExternalGallery';
import { iconNames } from '#constants';
import InternalGallery from '#components/viewer/InternalGallery';
import Message from '#rscv/Message';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
    value: [],
};


export default class LeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderLeadPreview = (row) => {
        if (row.url) {
            return (
                <ExternalGallery
                    className={styles.galleryFile}
                    url={row.url}
                    showUrl
                />
            );
        }
        if (row.attachment) {
            return (
                <InternalGallery
                    className={styles.galleryFile}
                    galleryId={row.attachment && row.attachment.id}
                    notFoundMessage={_ts('addLeads', 'leadFileNotFound')}
                    showUrl
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
            onClose,
        } = this.props;

        return (
            <Modal
                className={styles.leadPreview}
                onClose={this.unsetLeadPreview}
                closeOnEscape
            >
                <ModalHeader
                    className={styles.modalHeader}
                    title={value.title || _ts('leads', 'Preview')}
                    rightComponent={
                        <Button
                            onClick={onClose}
                            transparent
                        >
                            <span className={iconNames.close} />
                        </Button>
                    }
                />
                <ModalBody
                    className={styles.body}
                >
                    {this.renderLeadPreview(value)}
                </ModalBody>
            </Modal>
        );
    }
}
