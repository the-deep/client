import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Faram, { requiredCondition } from '@togglecorp/faram';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import {
    RequestClient,
    methods,
} from '#request';
import {
    addLeadGroupOfProjectAction,
} from '#redux';
import notify from '#notify';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number,
    onModalClose: PropTypes.func.isRequired,

    addLeadGroup: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onLeadGroupAdd: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types

    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapDispatchToProps = dispatch => ({
    addLeadGroup: params => dispatch(addLeadGroupOfProjectAction(params)),
});

const requestOptions = {
    createLeadGroupRequest: {
        extras: {
            schemaName: 'leadGroup',
        },
        url: '/lead-groups/',
        // NOTE: only pull what we post
        query: {
            fields: ['id', 'title', 'project', 'version_id'],
        },
        method: methods.POST,
        body: ({ params }) => params.body,
        onSuccess: ({ props, response }) => {
            props.addLeadGroup({
                projectId: response.project,
                newLeadGroup: {
                    key: response.id,
                    value: response.title,
                },
            });

            props.onLeadGroupAdd(response);

            props.onModalClose();

            notify.send({
                title: _ts('addLeads', 'leadGroupTitle'),
                type: notify.type.SUCCESS,
                message: _ts('addLeads', 'leadGroupCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFailure: ({ faramErrors, params }) => {
            params.setState({
                faramErrors,
                pending: false,
            });
        },
        onFatal: ({ params }) => {
            params.setState({
                faramErrors: { $internal: [_ts('addLeads', 'leadGroupCreateFailure')] },
            });
        },
    },
};

class AddLeadGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,
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
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (values) => {
        const {
            projectId,
            requests: {
                createLeadGroupRequest,
            },
        } = this.props;

        const newLeadGroup = {
            ...values,
            project: projectId,
        };

        createLeadGroupRequest.do({
            body: newLeadGroup,
            setState: v => this.setState(v),
        });
    };

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
        } = this.state;

        const { className } = this.props;

        return (
            <Modal>
                <ModalHeader title={_ts('addLeads.addLeadGroup', 'addLeadGroupModalTitle')} />
                <ModalBody>
                    {pending && <LoadingAnimation />}
                    <Faram
                        className={`${className} ${styles.addLeadGroup}`}
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
                            label={_ts('addLeads.addLeadGroup', 'addLeadGroupTitleLabel')}
                            faramElementName="title"
                            placeholder={_ts('addLeads.addLeadGroup', 'addLeadGroupTitlePlaceholder')}
                            autoFocus
                        />
                        <div className={styles.actionButtons}>
                            <DangerButton onClick={this.props.onModalClose}>
                                {_ts('addLeads.addLeadGroup', 'modalCancelLabel')}
                            </DangerButton>
                            <PrimaryButton
                                disabled={pending || !pristine}
                                type="submit"
                            >
                                {_ts('addLeads.addLeadGroup', 'modalAddLabel')}
                            </PrimaryButton>
                        </div>
                    </Faram>
                </ModalBody>
            </Modal>
        );
    }
}

export default connect(undefined, mapDispatchToProps)(
    RequestClient(requestOptions)(AddLeadGroup),
);
