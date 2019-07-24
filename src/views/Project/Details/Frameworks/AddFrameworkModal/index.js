import PropTypes from 'prop-types';
import React from 'react';
import { isTruthy } from '@togglecorp/fujs';
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
import {
    RequestClient,
    requestMethods,
} from '#request';

import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    frameworkId: PropTypes.number,
    // eslint-disable-next-line react/no-unused-prop-types
    setActiveFramework: PropTypes.func.isRequired,
    closeModal: PropTypes.func,
    isClone: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    frameworkCreateRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    frameworkCloneRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    frameworkId: undefined,
    closeModal: () => {},
    isClone: false,
};

// Note: Key is set according to is_private option
const frameworkVisibilityOptions = [
    { key: false, label: _ts('project.framework', 'visibilityPublicLabel') },
    { key: true, label: _ts('project.framework', 'visibilityPrivateLabel') },
];

const requests = {
    frameworkCloneRequest: {
        url: ({ params }) => `/clone-analysis-framework/${params.frameworkId}/`,
        method: requestMethods.POST,
        body: ({ params }) => ({ ...params.values }),
        onSuccess: ({ response, props }) => {
            // Second argument is to know that this is a new framework
            props.setActiveFramework(response.id, true);
            notify.send({
                title: _ts('project', 'afClone'),
                type: notify.type.SUCCESS,
                message: _ts('project', 'afCloneSuccess'),
                duration: notify.duration.MEDIUM,
            });
            props.closeModal();
        },
        onFailure: ({
            error: { faramErrors },
            params: { handleFailure },
        }) => {
            handleFailure(faramErrors);
        },
        onFatal: () => {
            notify.send({
                title: _ts('project', 'afCreate'),
                type: notify.type.ERROR,
                message: _ts('project', 'afCloneFatal'),
                duration: notify.duration.SLOW,
            });
        },
        schemaName: 'analysisFramework',
    },
    frameworkCreateRequest: {
        url: '/analysis-frameworks/',
        method: requestMethods.POST,
        body: ({ params }) => ({ ...params.values }),
        onSuccess: ({ response, props }) => {
            // Second argument is to know that this is a new framework
            props.setActiveFramework(response.id, true);
            notify.send({
                title: _ts('project', 'afCreate'),
                type: notify.type.SUCCESS,
                message: _ts('project', 'afCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
            props.closeModal();
        },
        onFailure: ({
            error: { faramErrors },
            params: { handleFailure },
        }) => {
            handleFailure(faramErrors);
        },
        onFatal: () => {
            notify.send({
                title: _ts('project', 'afCreate'),
                type: notify.type.ERROR,
                message: _ts('project', 'afCreateFatal'),
                duration: notify.duration.SLOW,
            });
        },
        schemaName: 'analysisFramework',
    },
};


// NOTE: This component is used both for cloning and creating new frameworks
@RequestClient(requests)
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
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
                isPrivate: [],
            },
        };
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

    handleValidationSuccess = (_, values) => {
        const {
            frameworkId,
            isClone,
            frameworkCreateRequest,
            frameworkCloneRequest,
        } = this.props;

        if (!isClone) {
            frameworkCreateRequest.do({
                values,
                handleFailure: this.handleValidationFailure,
            });
        } else if (isTruthy(frameworkId)) {
            frameworkCloneRequest.do({
                values,
                frameworkId,
                handleFailure: this.handleValidationFailure,
            });
        }
    };

    render() {
        const {
            isClone,
            closeModal,
            frameworkCreateRequest: { pending: addPending },
            frameworkCloneRequest: { pending: clonePending },
        } = this.props;

        const {
            faramErrors,
            faramValues,
            pristine,
        } = this.state;

        const pending = addPending || clonePending;
        const modalHeader = isClone
            ? _ts('project.framework', 'cloneFrameworkModalTitle')
            : _ts('project.framework', 'addFrameworkModalTitle');

        const successButtonTitle = isClone
            ? _ts('project.framework', 'cloneFrameworkCloneButtonTitle')
            : _ts('project.framework', 'addFrameworkFormAddButtonTitle');

        return (
            <Modal className={styles.addFrameworkModal}>
                <ModalHeader title={modalHeader} />
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
                                {successButtonTitle}
                            </PrimaryButton>
                        </div>
                    </Faram>

                </ModalBody>
            </Modal>
        );
    }
}
