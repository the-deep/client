import PropTypes from 'prop-types';
import React from 'react';

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
    frameworkId: PropTypes.number.isRequired,
    projectId: PropTypes.number.isRequired,
    setActiveFramework: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
};

export default class CloneFrameworkModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
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

        const {
            addNewFramework,
            setActiveFramework,
        } = props;

        this.frameworkCloneRequest = new FrameworkCloneRequest({
            setState: v => this.setState(v),
            closeModal: this.props.closeModal,
            addNewFramework,
            setActiveFramework,
        });
    }

    componentWillUnmount() {
        this.frameworkCloneRequest.stop();
    }

    onModalClose = () => {
        this.props.closeModal();
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
        this.setState({ faramErrors });
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            pendingFrameworkClone,
        } = this.state;

        return (
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
                        <DangerButton onClick={this.onModalClose}>
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
        );
    }
}
