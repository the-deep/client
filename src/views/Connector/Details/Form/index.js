import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import Faram, { FaramGroup, requiredCondition, urlCondition } from '@togglecorp/faram';
import {
    _cs,
    compareString,
} from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import AccentButton from '#rsca/Button/AccentButton';
import WarningButton from '#rsca/Button/WarningButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TabularSelectInput from '#rsci/TabularSelectInput';
import TextInput from '#rsci/TextInput';
import List from '#rscv/List';
import LoadingAnimation from '#rscv/LoadingAnimation';
import update from '#rsu/immutable-update';

import { RequestClient } from '#request';

import Badge from '#components/viewer/Badge';

import {
    connectorDetailsSelector,
    connectorSourceSelector,
    usersInformationListSelector,
    currentUserProjectsSelector,
    setUsersInformationAction,
    changeUserConnectorDetailsAction,
    deleteConnectorAction,
    setErrorUserConnectorDetailsAction,
    setUserConnectorDetailsAction,
} from '#redux';

import _ts from '#ts';

import ConnectorDetailsGetRequest from '../../requests/ConnectorDetailsGetRequest';
import ConnectorPatchRequest from '../../requests/ConnectorPatchRequest';
import UserListGetRequest from '../../requests/UserListGetRequest';

import TestResults from '../TestResults';
import FieldInput from './FieldInput';
import requests from './requests';
import {
    getUsersTableHeader,
    getProjectsTableHeader,
} from './connector-utils';

import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

const propTypes = {
    connectorId: PropTypes.number,
    connectorDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    connectorSource: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
    changeUserConnectorDetails: PropTypes.func.isRequired,
    setErrorUserConnectorDetails: PropTypes.func.isRequired,
    setUserConnectorDetails: PropTypes.func.isRequired,
    setUsers: PropTypes.func.isRequired,
    // These are used in requests put in another file
    // eslint-disable-next-line react/no-unused-prop-types
    deleteConnector: PropTypes.func.isRequired,
    // These are used in requests put in another file
    // eslint-disable-next-line react/no-unused-prop-types
    onConnectorDelete: PropTypes.func.isRequired,
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    connectorDeleteRequest: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    xmlFieldOptionsRequest: PropTypes.object.isRequired,
};

const defaultProps = {
    connectorDetails: {},
    connectorSource: {},
    userProjects: [],
    className: '',
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorDetails: connectorDetailsSelector(state),
    users: usersInformationListSelector(state),
    userProjects: currentUserProjectsSelector(state),
    connectorSource: connectorSourceSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUsers: params => dispatch(setUsersInformationAction(params)),
    changeUserConnectorDetails: params => dispatch(changeUserConnectorDetailsAction(params)),
    setErrorUserConnectorDetails: params => dispatch(setErrorUserConnectorDetailsAction(params)),
    setUserConnectorDetails: params => dispatch(setUserConnectorDetailsAction(params)),
    deleteConnector: params => dispatch(deleteConnectorAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requests)
export default class ConnectorDetailsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static fieldKeySelector = s => s.key;

    static userLabelSelector = (d = {}) => d.displayName;
    static userKeySelector = (d = {}) => d.user;
    static projectLabelSelector = (d = {}) => d.title;
    static projectKeySelector = (d = {}) => d.project;

    constructor(props) {
        super(props);

        const { xmlFieldOptionsRequest } = this.props;
        xmlFieldOptionsRequest.setDefaultParams({
            setFaramError: this.setFaramError,
        });

        this.state = {
            userDataLoading: true,
            connectorDataLoading: false,
            pending: false,
        };

        this.usersHeader = getUsersTableHeader(
            this.handleToggleUserRoleClick,
            this.handleDeleteUserClick,
        );

        this.projectsHeader = getProjectsTableHeader(
            this.handleToggleProjectRoleClick,
            this.handleDeleteProjectClick,
        );
    }

    componentDidMount() {
        this.startUsersListGetRequest();
    }

    componentWillUnmount() {
        if (this.requestForConnectorPatch) {
            this.requestForConnectorPatch.stop();
        }
        if (this.requestForUserList) {
            this.requestForUserList.stop();
        }
        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }
    }

    getOptionsForUser = memoize((users, members) => {
        if (!members) {
            return emptyList;
        }

        if (!users) {
            return members;
        }

        const finalOptions = members.map(m => ({
            ...m,
            sortKey: `${m.displayName}-${m.user}`,
        }));

        users.forEach((u) => {
            const memberIndex = members.findIndex(m => m.user === u.id);
            if (memberIndex === -1) {
                finalOptions.push({
                    displayName: u.displayName,
                    email: u.email,
                    role: 'normal',
                    user: u.id,
                    sortKey: `${u.displayName}-${u.id}`,
                });
            }
        });

        return finalOptions.sort((a, b) => compareString(a.sortKey, b.sortKey));
    })

    getOptionsForProjects = memoize((allProjects, connectorProjects) => {
        if (!connectorProjects) {
            return emptyList;
        }

        if (!allProjects) {
            return connectorProjects;
        }

        const finalOptions = connectorProjects.map(m => ({
            ...m,
            sortKey: `${m.title}-${m.project}`,
        }));

        allProjects.forEach((a) => {
            const memberIndex = connectorProjects.findIndex(m => m.project === a.id);
            if (memberIndex === -1) {
                finalOptions.push({
                    title: a.title,
                    role: 'self',
                    project: a.id,
                    admin: a.memberStatus,
                    sortKey: `${a.title}-${a.id}`,
                });
            } else {
                finalOptions[memberIndex].admin = a.memberStatus;
            }
        });

        return finalOptions.sort((a, b) => compareString(a.sortKey, b.sortKey));
    })

    setFaramError = () => {
        const {
            changeUserConnectorDetails,
            connectorDetails: {
                faramValues = {},
            },
            connectorId,
        } = this.props;

        const faramErrors = {
            $internal: ['None of the items in this EMM have triggers or entities'],
        };

        changeUserConnectorDetails({
            faramValues,
            faramErrors,
            connectorId,
        });
    }

    createSchema = memoize((connectorSource) => {
        // FIXME: potential problem here with params,
        // it should be empty array not empty object
        const schema = {
            fields: {
                title: [requiredCondition],
                params: {},
                users: [],
                projects: [],
            },
        };
        if ((connectorSource.options || emptyList).length === 0) {
            return schema;
        }
        const paramFields = {};
        connectorSource.options.forEach((o) => {
            const validation = [];
            if (o.fieldType === 'url') {
                validation.push(urlCondition);
            }
            paramFields[o.key] = validation;
        });
        schema.fields.params.fields = paramFields;
        return schema;
    })

    startConnectorPatchRequest = (connectorId, connectorDetails) => {
        if (this.requestForConnectorPatch) {
            this.requestForConnectorPatch.stop();
        }
        const requestForConnectorPatch = new ConnectorPatchRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails: this.props.setUserConnectorDetails,
            connectorId: this.props.connectorId,
            setConnectorError: this.props.setErrorUserConnectorDetails,
        });

        this.requestForConnectorPatch = requestForConnectorPatch.create(
            connectorId,
            connectorDetails,
        );

        this.requestForConnectorPatch.start();
    }

    startUsersListGetRequest = () => {
        if (this.requestForUserList) {
            this.requestForUserList.stop();
        }
        const requestForUserList = new UserListGetRequest({
            setState: v => this.setState(v),
            setUsers: this.props.setUsers,
        });

        this.requestForUserList = requestForUserList.create();
        this.requestForUserList.start();
    }

    startConnectorDetailsRequest = (connectorId) => {
        const {
            setUserConnectorDetails,
            connectorDetails,
        } = this.props;

        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }

        const requestForConnectorDetails = new ConnectorDetailsGetRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails,
            connectorDetails,
            isBeingCancelled: true,
        });

        this.requestForConnectorDetails = requestForConnectorDetails.create(connectorId);
        this.requestForConnectorDetails.start();
    }

    handleToggleUserRoleClick = (selectedUser) => {
        const {
            connectorId,
            connectorDetails: {
                faramValues = {},
                faramErrors,
            },
            changeUserConnectorDetails,
        } = this.props;

        const index = (faramValues.users || emptyList).findIndex(u => u.user === selectedUser.user);

        if (index !== -1) {
            const settings = {
                users: {
                    [index]: {
                        role: {
                            $set: selectedUser.role === 'admin' ? 'normal' : 'admin',
                        },
                    },
                },
            };

            const newFaramValues = update(faramValues, settings);

            changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId,
            });
        }
    }

    handleToggleProjectRoleClick = (selectedProject) => {
        const {
            connectorId,
            connectorDetails: {
                faramValues = {},
                faramErrors,
            },
            changeUserConnectorDetails,
        } = this.props;

        const index = (faramValues.projects || []).findIndex(p =>
            p.project === selectedProject.project);

        if (index !== -1) {
            const settings = {
                projects: {
                    [index]: {
                        role: {
                            $set: selectedProject.role === 'global' ? 'self' : 'global',
                        },
                    },
                },
            };

            const newFaramValues = update(faramValues, settings);

            changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId,
            });
        }
    }

    handleDeleteUserClick = (selectedUser) => {
        const {
            connectorDetails: {
                faramValues = {},
                faramErrors,
            },
            changeUserConnectorDetails,
            connectorId,
        } = this.props;

        const index = (faramValues.users || emptyList).findIndex(u => u.user === selectedUser.user);

        if (index !== -1) {
            const settings = {
                users: {
                    $splice: [[index, 1]],
                },
            };

            const newFaramValues = update(faramValues, settings);

            changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId,
            });
        }
    }

    handleDeleteProjectClick = (selectedProject) => {
        const {
            connectorDetails: {
                faramValues = {},
                faramErrors,
            },
            changeUserConnectorDetails,
            connectorId,
        } = this.props;

        const index = (faramValues.projects || []).findIndex(p =>
            p.project === selectedProject.project);

        if (index !== -1) {
            const settings = {
                projects: {
                    $splice: [[index, 1]],
                },
            };

            const newFaramValues = update(faramValues, settings);

            changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId,
            });
        }
    }

    handleFaramChange = (faramValues, faramErrors) => {
        const {
            changeUserConnectorDetails,
            connectorId,
        } = this.props;

        changeUserConnectorDetails({
            faramValues,
            faramErrors,
            connectorId,
        });
    };

    handleValidationFailure = (faramErrors) => {
        const {
            setErrorUserConnectorDetails,
            connectorId,
        } = this.props;

        setErrorUserConnectorDetails({
            faramErrors,
            connectorId,
        });
    };

    handleValidationSuccess = (connectorDetails) => {
        this.startConnectorPatchRequest(this.props.connectorId, connectorDetails);
    };

    handleFormCancel = () => {
        this.startConnectorDetailsRequest(this.props.connectorId);
    };

    handleConnectorDelete = () => {
        this.props.connectorDeleteRequest.do();
    };

    fieldInputRendererParams = (key, data) => {
        const {
            connectorSource: { key: connectorSourceKey },
            xmlFieldOptionsRequest: {
                pending,
                response: {
                    results: xmlFieldOptions,
                } = {},
            },
        } = this.props;

        return ({
            field: data,
            connectorSourceKey,
            xmlFieldOptions,
            pendingXmlFieldOptions: pending,
        });
    }

    render() {
        const {
            users,
            userProjects,
            className,
            connectorDeleteRequest: {
                pending: deletePending,
            },
            connectorSource,
            connectorDetails: {
                faramValues = {},
                faramErrors,
                pristine,
            },
            connectorId,
        } = this.props;

        const {
            pending,
            connectorDataLoading,
            userDataLoading,
        } = this.state;

        const {
            users: faramValuesUsers,
            projects: faramValuesProjects,
            params,
        } = faramValues;

        const usersOptions = this.getOptionsForUser(users, faramValuesUsers);
        const projectsOptions = this.getOptionsForProjects(userProjects, faramValuesProjects);
        const schema = this.createSchema(connectorSource);

        const loading = userDataLoading || connectorDataLoading || pending;

        return (
            <Faram
                className={_cs(styles.connectorDetailsForm, className)}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
                disabled={loading}
            >
                { loading && <LoadingAnimation /> }
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        {faramValues.title}
                        <Badge
                            className={styles.badge}
                            title={connectorSource.title}
                        />
                    </h3>
                    <div className={styles.actionButtons}>
                        <AccentModalButton
                            modal={
                                <TestResults
                                    title={faramValues.title}
                                    connectorId={connectorId}
                                    paramsForTest={params}
                                    onConnectorTestLoading={this.handleConnectorTestLoading}
                                />
                            }
                        >
                            {_ts('connector', 'connectorDetailTestLabel')}
                        </AccentModalButton>
                        <DangerConfirmButton
                            pending={deletePending}
                            confirmationMessage={_ts(
                                'connector',
                                'deleteConnectorConfirmText',
                                { connector: faramValues.title },
                            )}
                            onClick={this.handleConnectorDelete}
                            disabled={loading}
                        >
                            {_ts('connector', 'connectorDetailDeleteLabel')}
                        </DangerConfirmButton>
                        <WarningButton
                            onClick={this.handleFormCancel}
                            disabled={loading || !pristine}
                        >
                            {_ts('connector', 'connectorDetailCancelLabel')}
                        </WarningButton>
                        <SuccessButton
                            type="submit"
                            disabled={loading || !pristine}
                        >
                            {_ts('connector', 'connectorDetailSaveLabel')}
                        </SuccessButton>
                    </div>
                </header>
                <div className={styles.content} >
                    <NonFieldErrors
                        faramElement
                        className={styles.errors}
                    />
                    <div className={styles.normalInputs} >
                        <TextInput
                            faramElementName="title"
                            label={_ts('connector', 'connectorTitleLabel')}
                            placeholder="Relief Web"
                            autoFocus
                        />
                        <FaramGroup faramElementName="params">
                            <List
                                data={connectorSource.options}
                                rendererParams={this.fieldInputRendererParams}
                                keySelector={ConnectorDetailsForm.fieldKeySelector}
                                renderer={FieldInput}
                            />
                        </FaramGroup>
                    </div>
                    {!(userDataLoading || connectorDataLoading) &&
                        <div className={styles.tabularSelectInputs} >
                            <TabularSelectInput
                                className={styles.users}
                                faramElementName="users"
                                options={usersOptions}
                                label={_ts('connector', 'connectorUsersLabel')}
                                labelSelector={ConnectorDetailsForm.userLabelSelector}
                                keySelector={ConnectorDetailsForm.userKeySelector}
                                tableHeaders={this.usersHeader}
                                hideRemoveFromListButton
                                hideSelectAllButton
                            />
                            <TabularSelectInput
                                faramElementName="projects"
                                options={projectsOptions}
                                label={_ts('connector', 'connectorProjectsLabel')}
                                labelSelector={ConnectorDetailsForm.projectLabelSelector}
                                keySelector={ConnectorDetailsForm.projectKeySelector}
                                tableHeaders={this.projectsHeader}
                                hideRemoveFromListButton
                            />
                        </div>
                    }
                </div>
            </Faram>
        );
    }
}
