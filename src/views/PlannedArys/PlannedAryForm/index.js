import PropTypes from 'prop-types';
import React from 'react';
import Faram, { requiredCondition } from '@togglecorp/faram';

import {
    RequestClient,
    methods,
} from '#request';
import TextInput from '#rsci/TextInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import _ts from '#ts';
import notify from '#notify';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    editMode: PropTypes.bool,
    closeModal: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    onActionSuccess: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    plannedAryData: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
    projectId: PropTypes.number,
};

const defaultProps = {
    editMode: false,
    className: undefined,
    plannedAryData: undefined,
    projectId: undefined,
};

const requestOptions = {
    plannedAryRequest: {
        url: ({ props: {
            editMode,
            plannedAryData: { id } = {},
        } }) => (editMode
            ? `/planned-assessments/${id}/`
            : '/planned-assessments/'
        ),
        method: ({ props: { editMode } }) => (
            editMode ? methods.PATCH : methods.POST
        ),
        body: ({ params: { body } }) => body,
        onMount: false,
        onSuccess: ({
            response,
            props: {
                onActionSuccess,
                closeModal,
            },
        }) => {
            onActionSuccess(response);
            closeModal();
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('assessments.planned', 'plannedAssessmentsNotifyTitle'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'plannedAry',
        },
    },
};

@RequestClient(requestOptions)
export default class PlannedAryForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            plannedAryData,
            editMode,
        } = this.props;

        this.state = {
            faramValues: editMode ? plannedAryData : {},
            faramErrors: {},
            pristine: true,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
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
            requests: {
                plannedAryRequest,
            },
            projectId,
        } = this.props;

        const body = {
            ...faramValues,
            project: projectId,
        };

        plannedAryRequest.do({ body });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    render() {
        const {
            className,
            editMode,
            closeModal,
            requests: {
                plannedAryRequest: {
                    pending,
                },
            },
        } = this.props;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const modalTitle = editMode
            ? _ts('assessments.planned.editForm', 'editPlannedAryModalTitle')
            : _ts('assessments.planned.editForm', 'addPlannedAryModalTitle');

        return (
            <Modal className={className}>
                <ModalHeader
                    title={modalTitle}
                />
                <Faram
                    value={faramValues}
                    error={faramErrors}
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    onValidationFailure={this.handleFaramValidationFailure}
                    schema={this.schema}
                    disabled={pending}
                >
                    <ModalBody>
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            label={_ts('assessments.planned.editForm', 'plannedAryTitleInputLabel')}
                            placeholder={_ts('assessments.planned.editForm', 'plannedAryTitleInputPlacehoder')}
                        />
                    </ModalBody>
                    <ModalFooter className={styles.footer} >
                        <DangerButton
                            className={styles.button}
                            disabled={pending}
                            onClick={closeModal}
                        >
                            {_ts('assessments.planned.editForm', 'cancelButtonTitle')}
                        </DangerButton>
                        <PrimaryButton
                            className={styles.button}
                            disabled={pristine}
                            pending={pending}
                            type="submit"
                        >
                            {_ts('assessments.planned.editForm', 'saveButtonTitle')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
