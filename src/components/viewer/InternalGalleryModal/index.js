import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import InternalGallery from '#components/viewer/InternalGallery';
import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    attachment: PropTypes.shape({
        title: PropTypes.string,
    }),
    closeModal: PropTypes.func,
};

const defaultProps = {
    className: undefined,
    attachment: undefined,
    closeModal: () => {},
};

export default class Selection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            attachment,
            name,
            closeModal,
            ...otherProps
        } = this.props;

        return (
            <Modal className={_cs(className, styles.internalGalleryModal)}>
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
                    <InternalGallery
                        attachment={attachment}
                        {...otherProps}
                    />
                </ModalBody>
            </Modal>
        );
    }
}
