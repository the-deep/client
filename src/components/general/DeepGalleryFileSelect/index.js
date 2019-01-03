import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';

import DeepGallerySelect from './DeepGallerySelect';
import styles from './styles.scss';

const propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
    show: false,
};

/*
 * Deep Gallery Files Selector Component Modal Wrapper
 *
 */
export default class DeepGallery extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            show,
            onClose,
            ...otherProps
        } = this.props;

        if (!show) {
            return null;
        }

        return (
            <Modal
                className={styles.addGalleryFileModal}
                onClose={onClose}
            >
                <DeepGallerySelect
                    onClose={onClose}
                    {...otherProps}
                />
            </Modal>
        );
    }
}
