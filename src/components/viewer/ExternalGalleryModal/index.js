import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ExternalGallery from '#components/viewer/ExternalGallery';
import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};

export default class Selection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            url,
            name,
            closeModal,
            ...otherProps
        } = this.props;

        return (
            <Modal className={_cs(className, styles.externalGalleryModal)}>
                <ModalHeader
                    title={name}
                    rightComponent={(
                        <Button
                            onClick={closeModal}
                            iconName="close"
                            transparent
                        />
                    )}
                />
                <ModalBody className={styles.body} >
                    <ExternalGallery
                        url={url}
                        {...otherProps}
                    />
                </ModalBody>
            </Modal>
        );
    }
}
