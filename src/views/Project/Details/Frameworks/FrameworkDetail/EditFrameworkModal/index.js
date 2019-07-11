import PropTypes from 'prop-types';
import React from 'react';
import Faram, { requiredCondition } from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import LoadingAnimation from '#rscv/LoadingAnimation';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import {
    RequestClient,
    requestMethods,
} from '#request';
import _ts from '#ts';

import FrameworkUsersTable from './FrameworkUsersTable';

import styles from './styles.scss';

const propTypes = {
    frameworkId: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    frameworkPatchRequest: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    closeModal: PropTypes.func,
};

const defaultProps = {
    frameworkId: undefined,
    title: '',
    description: '',
    frameworkPatchRequest: {},
    closeModal: () => {},
};

const requests = {
    frameworkPatchRequest: {
        url: ({ props }) => `/analysis-frameworks/${props.frameworkId}/`,
        method: requestMethods.PATCH,
        body: ({ params: { body } } = {}) => body,
        onSuccess: ({ response, props, params }) => {
            params.setPristine();
            console.warn(response, props);
        },
        schemaName: 'analysisFramework',
    },
};


@RequestClient(requests)
export default class EditFrameworkModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            title,
            description,
        } = this.props;

        this.state = {
            faramValues: {
                title,
                description,
            },
            faramErrors: {},
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
            },
        };
    }

    setPristine = () => {
        this.setState({ pristine: true });
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
    }

    handleValidationSuccess = (_, body) => {
        const { frameworkPatchRequest } = this.props;

        frameworkPatchRequest.do({
            body,
            setPristine: this.setPristine,
        });
    }

    render() {
        const {
            frameworkPatchRequest: {
                pending,
            },
            closeModal,
            frameworkId,
        } = this.props;

        const {
            pristine,
            faramValues,
            faramErrors,
        } = this.state;

        return (
            <Modal className={styles.editFrameworkModal} >
                <ModalHeader
                    title={_ts('project.framework', 'editFrameworkModalTitle')}
                    rightComponent={
                        <Button
                            transparent
                            iconName="close"
                            onClick={closeModal}
                        />
                    }
                />
                <ModalBody className={styles.modalBody} >
                    { pending && <LoadingAnimation /> }
                    <div className={styles.editDetailsSection} >
                        <Faram
                            className={styles.editAnalysisFrameworkForm}
                            onChange={this.handleFaramChange}
                            onValidationFailure={this.handleValidationFailure}
                            onValidationSuccess={this.handleValidationSuccess}
                            schema={this.schema}
                            value={faramValues}
                            error={faramErrors}
                            disabled={pending}
                        >
                            <NonFieldErrors faramElement />
                            <TextInput
                                label={_ts('project.framework', 'frameworkTitleInputTitle')}
                                faramElementName="title"
                                placeholder={_ts('project.framework', 'frameworkTitleInputPlaceholder')}
                                autoFocus
                            />
                            <TextArea
                                label={_ts('project.framework', 'frameworkDescriptionInputTitle')}
                                faramElementName="description"
                                placeholder={_ts('project.framework', 'frameworkDescriptionInputPlaceholder')}
                                rows={3}
                            />
                            <div className={styles.actionButtons}>
                                <PrimaryButton
                                    disabled={pending || pristine}
                                    type="submit"
                                >
                                    {_ts('project.framework', 'editFrameworkModalSaveButtonTitle')}
                                </PrimaryButton>
                            </div>
                        </Faram>
                    </div>
                    <div className={styles.editUsersSection} >
                        <FrameworkUsersTable frameworkId={frameworkId} />
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
