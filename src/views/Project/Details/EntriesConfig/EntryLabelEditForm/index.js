import PropTypes from 'prop-types';
import React from 'react';
import Faram, { requiredCondition } from '@togglecorp/faram';

import TextInput from '#rsci/TextInput';
import ColorInput from '#rsci/ColorInput';
import NumberInput from '#rsci/NumberInput';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    projectId: PropTypes.number,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    entryLabel: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entryLabelId: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    isAddForm: PropTypes.bool,
    closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
    projectId: undefined,
    entryLabel: undefined,
    entryLabelId: undefined,
    isAddForm: false,
};

const requestOptions = {
    editEntryLabelRequest: {
        url: ({
            props: {
                projectId,
                entryLabelId,
            },
        }) => `/projects/${projectId}/entry-labels/${entryLabelId}/`,
        method: methods.PATCH,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            props: {
                onEntryLabelEdit,
                entryLabelId,
                closeModal,
            },
            response,
        }) => {
            if (onEntryLabelEdit) {
                onEntryLabelEdit(entryLabelId, response);
            }
            closeModal();
        },
    },
    addEntryLabelRequest: {
        url: ({
            props: {
                projectId,
            },
        }) => `/projects/${projectId}/entry-labels/`,
        method: methods.POST,
        body: ({ params: { body } }) => body,
        onSuccess: ({
            props: {
                onEntryLabelAdd,
                closeModal,
            },
            response,
        }) => {
            if (onEntryLabelAdd) {
                onEntryLabelAdd(response);
            }
            closeModal();
        },
    },
};

@RequestCoordinator
@RequestClient(requestOptions)
export default class EntryLabelsActions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            entryLabel = {},
            isAddForm,
        } = this.props;

        const faramValues = !isAddForm ? ({
            title: entryLabel.title,
            color: entryLabel.color,
            order: entryLabel.order,
        }) : {
            color: '#414141',
        };

        this.state = {
            faramValues,
            faramErrors: {},
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                color: [requiredCondition],
                order: [requiredCondition],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    }

    handleFaramValidationSuccess = (faramValues) => {
        const {
            isAddForm,
            requests: {
                addEntryLabelRequest,
                editEntryLabelRequest,
            },
            projectId,
        } = this.props;

        if (isAddForm) {
            addEntryLabelRequest.do({
                body: {
                    ...faramValues,
                    project: projectId,
                },
            });
        } else {
            editEntryLabelRequest.do({
                body: faramValues,
            });
        }
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: true,
        });
    }

    render() {
        const {
            requests: {
                addEntryLabelRequest: {
                    pending: addEntryLabelPending,
                },
                editEntryLabelRequest: {
                    pending: editEntryLabelPending,
                },
            },
            entryLabel: {
                title,
            } = {},
            isAddForm,
            closeModal,
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const modalTitle = isAddForm ? _ts('project.entryGroups.editForm', 'newEntryLabel') : title;
        const pending = addEntryLabelPending || editEntryLabelPending;

        return (
            <Modal className={styles.entryGroupEditForm} >
                <ModalHeader
                    title={modalTitle}
                    rightComponent={(
                        <Button
                            iconName="close"
                            onClick={closeModal}
                        />
                    )}
                />
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    <ModalBody>
                        {pending && <LoadingAnimation />}
                        <TextInput
                            faramElementName="title"
                            label={_ts('project.entryGroups.editForm', 'entryLabelTitleLabel')}
                            placeholder={_ts('project.entryGroups.editForm', 'entryLabelTitlePlaceholder')}
                        />
                        <ColorInput
                            faramElementName="color"
                            label={_ts('project.entryGroups.editForm', 'entryLabelColorLabel')}
                        />
                        <NumberInput
                            faramElementName="order"
                            label={_ts('project.entryGroups.editForm', 'entryLabelOrderLabel')}
                            placeholder={_ts('project.entryGroups.editForm', 'entryLabelOrderPlaceholder')}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={closeModal} >
                            {_ts('project.entryGroups.editForm', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            disabled={pristine}
                            type="submit"
                        >
                            {_ts('project.entryGroups.editForm', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
