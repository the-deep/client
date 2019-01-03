import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import DangerButton from '#rsca/Button/DangerButton';

import Cloak from '#components/general/Cloak';
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
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static handleException = handleException;
    static shouldHideReport = ({ isDevMode }) => isDevMode;

    render() {
        const {
            onClose,
            title,
        } = this.props;

        const errorText = _ts('components.frameworkWidgetError', 'problemText');
        const reportErrorTitle = _ts('components.frameworkWidgetError', 'reportErrorTitle');

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
                    <Cloak
                        hide={FrameworkWidgetError.shouldHideReport}
                        render={
                            <PrimaryButton
                                // Use cloak for development
                                onClick={handleReport}
                            >
                                {reportErrorTitle}
                            </PrimaryButton>
                        }
                    />
                </ModalFooter>
            </Modal>
        );
    }
}
