import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, { requiredCondition } from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import SegmentInput from '#rsci/SegmentInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import Cloak from '#components/general/Cloak';

import { addNewAfAction } from '#redux';
import _ts from '#ts';

import FrameworkCreateRequest from './requests/FrameworkCreateRequest';
import styles from './styles.scss';

const propTypes = {
    setActiveFramework: PropTypes.func.isRequired,
    closeModal: PropTypes.func,
    addNewFramework: PropTypes.func.isRequired,
};

const defaultProps = {
    closeModal: () => {},
};

const mapDispatchToProps = dispatch => ({
    addNewFramework: params => dispatch(addNewAfAction(params)),
});
//
// Note: Key is set according to is_private option
const frameworkVisibilityOptions = [
    { key: false, label: _ts('project.framework', 'visibilityPublicLabel') },
    { key: true, label: _ts('project.framework', 'visibilityPrivateLabel') },
];


@connect(undefined, mapDispatchToProps)
export default class AddFrameworkModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHidePrivate = ({ accessPrivateProject }) => !accessPrivateProject;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {
                isPrivate: false,
            },
            pending: false,
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
                isPrivate: [],
            },
        };

        this.frameworkCreateRequest = new FrameworkCreateRequest({
            setState: v => this.setState(v),
            addNewFramework: this.props.addNewFramework,
            setActiveFramework: this.props.setActiveFramework,
            onModalClose: this.props.closeModal,
        });
    }

    componentWillUnmount() {
        this.frameworkCreateRequest.stop();
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (data) => {
        this.frameworkCreateRequest
            .init(data)
            .start();
    };

    render() {
        const { closeModal } = this.props;

        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
        } = this.state;

        return (
            <Modal className={styles.addFrameworkModal}>
                <ModalHeader title={_ts('project.framework', 'addFrameworkModalTitle')} />
                <ModalBody className={styles.modalBody}>
                    <Faram
                        className={styles.addAnalysisFrameworkForm}
                        onChange={this.handleFaramChange}
                        onValidationFailure={this.handleValidationFailure}
                        onValidationSuccess={this.handleValidationSuccess}
                        schema={this.schema}
                        value={faramValues}
                        error={faramErrors}
                        disabled={pending}
                    >
                        { pending && <LoadingAnimation /> }
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
                        <Cloak
                            hide={AddFrameworkModal.shouldHidePrivate}
                            render={
                                <SegmentInput
                                    options={frameworkVisibilityOptions}
                                    className={styles.isPrivateCheckbox}
                                    faramElementName="isPrivate"
                                    label={_ts('project.framework', 'frameworkVisibilityInputLabel')}
                                    hint={_ts('project.framework', 'frameworkVisibilityInputHint')}
                                />
                            }
                        />
                        <div className={styles.actionButtons}>
                            <DangerButton onClick={closeModal}>
                                {_ts('project.framework', 'addFrameworkFormCancelButtonTitle')}
                            </DangerButton>
                            <PrimaryButton
                                disabled={pending || pristine}
                                type="submit"
                            >
                                {_ts('project.framework', 'addFrameworkFormAddButtonTitle')}
                            </PrimaryButton>
                        </div>
                    </Faram>

                </ModalBody>
            </Modal>
        );
    }
}
