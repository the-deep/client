import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Faram, { requiredCondition } from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import { alterResponseErrorToFaramError } from '#rest';

import {
    RequestClient,
    requestMethods,
} from '#request';

import { pathNames } from '#constants';
import { reverseRoute } from '@togglecorp/fujs';

import _ts from '#ts';
import notify from '#notify';
import {
    connectorSourcesListSelector,
    addUserConnectorAction,
} from '#redux';

import styles from './styles.scss';

const propTypes = {
    onModalClose: PropTypes.func.isRequired,
    addUserConnector: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    connectorSourcesList: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    connectorCreateRequest: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    connectorSourcesList: connectorSourcesListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addUserConnector: params => dispatch(addUserConnectorAction(params)),
});

const requests = {
    connectorCreateRequest: {
        url: '/connectors/',
        method: requestMethods.POST,
        body: ({ params: { values } }) => values,
        onSuccess: ({ response, params: { handleConnectorAdd } }) => {
            handleConnectorAdd(response);
        },
        onFailure: ({
            response,
            params: { handleFaramErrors },
        }) => {
            handleFaramErrors(response);
        },
        onFatal: ({ params: { handleRequestFatal } }) => {
            handleRequestFatal();
        },
        schemaName: 'connector',
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class ConnectorAddForm extends React.PureComponent {
    static propTypes = propTypes;
    static keySelector = s => s.key;
    static labelSelector = s => s.title;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: { source: 'rss-feed' },
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                source: [requiredCondition],
            },
        };
    }

    handleConnectorAdd = (response) => {
        const connector = {
            id: response.id,
            versionId: response.versionId,
            source: response.source,
            faramValues: {
                title: response.title,
                users: response.users,
                params: response.params,
                projects: response.projects,
            },
            role: response.role,
            faramErrors: {},
            pristine: false,
        };

        this.props.addUserConnector({ connector });

        notify.send({
            title: _ts('connector', 'connectorCreateTitle'),
            type: notify.type.SUCCESS,
            message: _ts('connector', 'connectorCreateSuccess'),
            duration: notify.duration.MEDIUM,
        });

        this.setState({
            redirectTo: reverseRoute(
                pathNames.connectors, { connectorId: response.id },
            ),
        });

        this.handleModalClose();
    }

    handleFaramErrors = (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);

        this.setState({
            faramErrors,
            pending: false,
        });
    }

    handleRequestFatal = () => {
        this.setState({
            faramErrors: { $internal: [_ts('connector', 'connectorCreateFailure')] },
        });
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
        const { connectorCreateRequest } = this.props;

        connectorCreateRequest.do({
            handleFaramErrors: this.handleFaramErrors,
            handleRequestFatal: this.handleRequestFatal,
            handleConnectorAdd: this.handleConnectorAdd,
            values,
        });
    };

    // BUTTONS
    handleModalClose = () => {
        this.props.onModalClose();
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pending,
            pristine,
            redirectTo,
        } = this.state;

        const {
            connectorSourcesList = [],
            connectorCreateRequest: {
                pending: dataLoading,
            },
        } = this.props;

        const loading = pending || dataLoading;

        if (redirectTo) {
            return (
                <Redirect
                    to={redirectTo}
                    push
                />
            );
        }

        return (
            <Faram
                className={styles.connectorAddForm}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { loading && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    faramElementName="title"
                    label={_ts('connector', 'addConnectorModalTitleLabel')}
                    placeholder={_ts('connector', 'addConnectorModalTitlePlaceholder')}
                    autoFocus
                />
                <SelectInput
                    faramElementName="source"
                    label={_ts('connector', 'addConnectorModalSourceLabel')}
                    options={connectorSourcesList}
                    keySelector={ConnectorAddForm.keySelector}
                    labelSelector={ConnectorAddForm.labelSelector}
                    placeholder={_ts('connector', 'addConnectorModalSourcePlaceholder')}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleModalClose}>
                        {_ts('connector', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        type="submit"
                        disabled={loading || !pristine}
                    >
                        {_ts('connector', 'modalCreate')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
