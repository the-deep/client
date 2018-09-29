import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '#rsca/Button/AccentButton';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import Faram, {
    requiredCondition,
} from '#rscg/Faram';

import _ts from '#ts';

import FrameworkCloneRequest from './requests/FrameworkCloneRequest';
import styles from './styles.scss';

const propTypes = {
    addNewFramework: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    frameworkId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
};

const defaultProps = {
    disabled: false,
};

export default class CloneFrameworkButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showCloneFrameworkModal: false,
            faramErrors: {},
            faramValues: {},
            pendingFrameworkClone: false,
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
            },
        };

        const { addNewFramework } = props;
        this.frameworkCloneRequest = new FrameworkCloneRequest({
            setState: v => this.setState(v),
            addNewFramework,
        });
    }

    componentWillUnmount() {
        this.frameworkCloneRequest.stop();
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleValidationSuccess = () => {
        const {
            frameworkId,
            projectId,
        } = this.props;

        const { faramValues } = this.state;

        this.frameworkCloneRequest
            .init(
                frameworkId,
                projectId,
                faramValues,
            )
            .start();
    }

    handleValidationFailure = (faramErrors) => {
        this.setSTate({ faramErrors });
    }

    handleClick = () => {
        this.setState({ showCloneFrameworkModal: true });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showCloneFrameworkModal: false,
            faramValues: {},
            faramErrors: {},
            pristine: true,
        });
    }

    render() {
        const { disabled } = this.props;
        const {
            showCloneFrameworkModal,
            faramValues,
            faramErrors,
            pristine,
            pendingFrameworkClone,
        } = this.state;

        return (
            <React.Fragment>
                <AccentButton
                    disabled={disabled}
                    onClick={this.handleClick}
                >
                    { _ts('project.framework', 'cloneButtonTitle') }
                </AccentButton>
                { showCloneFrameworkModal && (
                    <Modal className={styles.cloneFrameworkModal}>
                        <Faram
                            onChange={this.handleFaramChange}
                            onValidationFailure={this.handleValidationFailure}
                            onValidationSuccess={this.handleValidationSuccess}
                            schema={this.schema}
                            value={faramValues}
                            error={faramErrors}
                            disabled={pendingFrameworkClone}
                        >
                            <ModalHeader title={_ts('project.framework', 'cloneFrameworkModalTitle')} />
                            <ModalBody className={styles.modalBody}>
                                { pendingFrameworkClone && <LoadingAnimation /> }
                                <NonFieldErrors faramElement />
                                <TextInput
                                    className={styles.title}
                                    label={_ts('project.framework', 'frameworkTitleInputTitle')}
                                    faramElementName="title"
                                    placeholder={_ts('project.framework', 'frameworkTitleInputPlaceholder')}
                                    autoFocus
                                />
                                <TextArea
                                    className={styles.description}
                                    label={_ts('project.framework', 'frameworkDescriptionInputTitle')}
                                    faramElementName="description"
                                    placeholder={_ts('project.framework', 'frameworkDescriptionInputPlaceholder')}
                                    rows={3}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <DangerButton onClick={this.handleModalCancelButtonClick}>
                                    {_ts('project.framework', 'cloneFrameworkCancelButtonTitle')}
                                </DangerButton>
                                <PrimaryButton
                                    disabled={pendingFrameworkClone || pristine}
                                    type="submit"
                                >
                                    {_ts('project.framework', 'cloneFrameworkCloneButtonTitle')}
                                </PrimaryButton>
                            </ModalFooter>
                        </Faram>
                    </Modal>
                )}
            </React.Fragment>
        );
    }
}
