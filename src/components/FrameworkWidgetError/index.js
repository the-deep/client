import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import DangerButton from '#rsca/Button/DangerButton';

import { handleException, handleReport } from '#config/sentry';
import _ts from '#ts';

const propTypes = {
    title: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
    title: _ts('components.frameworkWidgetError', 'headingTitle'),
};

export default class FrameworkWidgetError extends React.PureComponent {
    static handleException = handleException;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const errorText = _ts('components.frameworkWidgetError', 'problemText');
        const reportErrorTitle = _ts('components.frameworkWidgetError', 'reportErrorTitle');

        const {
            onClose,
            title,
        } = this.props;

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    { errorText }
                </ModalBody>
                <ModalFooter>
                    <DangerButton onClick={onClose}>
                        {_ts('components.frameworkWidgetError', 'dismissTitle')}
                    </DangerButton>
                    <PrimaryButton
                        // Use cloak for development
                        onClick={handleReport}
                    >
                        {reportErrorTitle}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
