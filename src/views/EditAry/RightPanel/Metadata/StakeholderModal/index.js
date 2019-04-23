import PropTypes from 'prop-types';
import React from 'react';

import Modal from '#rscv/Modal';
import DangerButton from '#rsca/Button/DangerButton';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
// import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    closeModal: () => {},
};


export default class LeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            closeModal,
            children,
        } = this.props;

        return (
            <Modal
                onClose={closeModal}
                closeOnEscape
            >
                <ModalHeader
                    title="Stakeholders"
                />
                <ModalBody>
                    {children}
                </ModalBody>
                <ModalFooter>
                    <DangerButton
                        onClick={closeModal}
                    >
                        Close
                    </DangerButton>
                </ModalFooter>
            </Modal>
        );
    }
}
